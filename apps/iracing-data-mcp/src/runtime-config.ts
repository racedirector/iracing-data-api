import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { remoteAuthorizationFromEnv } from "./jwt-verifier.js";

/**
 * The CLI has a dedicated auth-only MCP token document. This is intentionally
 * different from its general credentials.json: refresh-token owners must not
 * concurrently rotate the same document.
 */
export const DEFAULT_CLI_MCP_CREDENTIAL_FILE = fileURLToPath(
  new URL("../../../.iracing-data/iracing-data-mcp/credentials.json", import.meta.url),
);

/** The container's durable volume path; the host does not own this file. */
export const CONTAINER_MCP_CREDENTIAL_FILE =
  "/var/lib/iracing-data-mcp/credentials.json";

function exactAuthorities(value: string, origin: boolean): string[] {
  return value.split(",").map((item) => {
    if (item !== item.trim() || /[\s*]/.test(item)) {
      throw new Error("Invalid address.");
    }

    const url = new URL(origin ? item : `http://${item}`);

    if (
      url.username ||
      url.password ||
      url.protocol !== "http:" ||
      !["127.0.0.1", "localhost"].includes(url.hostname) ||
      (origin ? url.origin !== item : url.host !== item)
    ) {
      throw new Error("Invalid address.");
    }

    return item;
  });
}

/** Validate environment values once and transform directly into runtime options. */
export const RuntimeEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(["production", "development", "test"]).default("development"),
    IRACING_MCP_LISTEN_HOST: z.enum(["127.0.0.1", "0.0.0.0"]).default("127.0.0.1"),
    IRACING_MCP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    IRACING_MCP_CLIENT_ID: z.string().trim().min(1).max(512).optional(),
    IRACING_MCP_CLIENT_SECRET_FILE: z.string().optional(),
    IRACING_MCP_CREDENTIAL_FILE: z.string().min(1).optional(),
    IRACING_MCP_ALLOWED_HOSTS: z.string().optional(),
    IRACING_MCP_ALLOWED_ORIGINS: z.string().optional(),
    IRACING_MCP_CLIENT_SECRET: z.never().optional(),
    IRACING_AUTH_SECRET: z.never().optional(),
    IRACING_MCP_RESOURCE_URL: z.string().optional(),
    IRACING_MCP_AUTH_ISSUER: z.string().optional(),
    IRACING_MCP_AUTH_AUDIENCE: z.string().optional(),
    IRACING_MCP_AUTH_JWKS_URL: z.string().optional(),
    IRACING_MCP_AUTH_SCOPES: z.string().optional(),
  })
  .transform((environment, context) => {
    const host = environment.IRACING_MCP_LISTEN_HOST;
    const port = environment.IRACING_MCP_PORT;
    const credentialFile =
      environment.IRACING_MCP_CREDENTIAL_FILE ??
      (environment.NODE_ENV === "production"
        ? CONTAINER_MCP_CREDENTIAL_FILE
        : DEFAULT_CLI_MCP_CREDENTIAL_FILE);

    let allowedHosts: string[];
    let allowedOrigins: string[];

    try {
      allowedHosts = exactAuthorities(
        environment.IRACING_MCP_ALLOWED_HOSTS ??
          `127.0.0.1:${port},localhost:${port}`,
        false,
      );
      allowedOrigins = exactAuthorities(
        environment.IRACING_MCP_ALLOWED_ORIGINS ??
          `http://127.0.0.1:${port},http://localhost:${port}`,
        true,
      );
    } catch {
      context.addIssue({
        code: "custom",
        message: "Invalid host or origin policy.",
        path: ["IRACING_MCP_ALLOWED_HOSTS"],
      });

      return z.NEVER;
    }

    const secretFile =
      environment.IRACING_MCP_CLIENT_SECRET_FILE || undefined;

    if (
      allowedOrigins.some((origin) => !allowedHosts.includes(new URL(origin).host)) ||
      (secretFile !== undefined &&
        (!path.isAbsolute(secretFile) ||
          path.dirname(secretFile) !== path.dirname(credentialFile) ||
          secretFile === credentialFile)) ||
      !path.isAbsolute(credentialFile)
    ) {
      context.addIssue({
        code: "custom",
        message: "Invalid runtime host or credential policy.",
        path: ["IRACING_MCP_CREDENTIAL_FILE"],
      });

      return z.NEVER;
    }

    let remoteAuthorization: ReturnType<typeof remoteAuthorizationFromEnv>;

    try {
      remoteAuthorization = remoteAuthorizationFromEnv({
        IRACING_MCP_RESOURCE_URL: environment.IRACING_MCP_RESOURCE_URL,
        IRACING_MCP_AUTH_ISSUER: environment.IRACING_MCP_AUTH_ISSUER,
        IRACING_MCP_AUTH_AUDIENCE: environment.IRACING_MCP_AUTH_AUDIENCE,
        IRACING_MCP_AUTH_JWKS_URL: environment.IRACING_MCP_AUTH_JWKS_URL,
        IRACING_MCP_AUTH_SCOPES: environment.IRACING_MCP_AUTH_SCOPES,
      });
    } catch {
      context.addIssue({
        code: "custom",
        message: "Invalid remote authorization configuration.",
        path: ["IRACING_MCP_RESOURCE_URL"],
      });

      return z.NEVER;
    }

    return {
      host,
      port,
      clientId: environment.IRACING_MCP_CLIENT_ID,
      secretFile,
      credentialFile,
      allowedHosts,
      allowedOrigins,
      remoteAuthorization,
    };
  });

/** Options accepted by the runtime host after validation and defaults. */
export type RuntimeConfig = z.infer<typeof RuntimeEnvironmentSchema>;

/**
 * Parse runtime settings without disclosing untrusted values or credentials.
 * @param {NodeJS.ProcessEnv} environment - Process environment including optional host overrides.
 * @returns {RuntimeConfig} Validated, transformed host and credential options.
 */
export function parseRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env,
): RuntimeConfig {
  const parsed = RuntimeEnvironmentSchema.safeParse(environment);

  if (!parsed.success) {
    throw new Error("MCP runtime configuration invalid.");
  }

  return parsed.data;
}
