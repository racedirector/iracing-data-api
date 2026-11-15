import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { remoteAuthorizationFromEnv } from "./jwt-verifier.js";

/**
 * CLI login uses an auth-only MCP token document; the general CLI credential
 * file must never be shared with another refresh-token owner.
 */
export const DEFAULT_CLI_MCP_CREDENTIAL_FILE = fileURLToPath(
  new URL(
    "../../../.iracing-data/iracing-data-mcp/credentials.json",
    import.meta.url,
  ),
);

/** Default persisted credential document inside the Docker volume. */
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

const EnvironmentValues = z.object({
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  IRACING_MCP_LISTEN_HOST: z
    .enum(["127.0.0.1", "0.0.0.0"])
    .default("127.0.0.1"),
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
});

type Environment = z.infer<typeof EnvironmentValues>;

function parseHostPolicy(environment: Environment) {
  const port = String(environment.IRACING_MCP_PORT);

  const allowedHosts = exactAuthorities(
    environment.IRACING_MCP_ALLOWED_HOSTS ??
      `127.0.0.1:${port},localhost:${port}`,
    false,
  );

  const allowedOrigins = exactAuthorities(
    environment.IRACING_MCP_ALLOWED_ORIGINS ??
      `http://127.0.0.1:${port},http://localhost:${port}`,
    true,
  );

  if (
    allowedOrigins.some(
      (origin) => !allowedHosts.includes(new URL(origin).host),
    )
  ) {
    throw new Error("Origin and host policies differ.");
  }

  return { allowedHosts, allowedOrigins };
}

function parseCredentialPath(environment: Environment): {
  credentialFile: string;
  secretFile: string | undefined;
} {
  const credentialFile =
    environment.IRACING_MCP_CREDENTIAL_FILE ??
    (environment.NODE_ENV === "production"
      ? CONTAINER_MCP_CREDENTIAL_FILE
      : DEFAULT_CLI_MCP_CREDENTIAL_FILE);

  const secretFile =
    environment.IRACING_MCP_CLIENT_SECRET_FILE === ""
      ? undefined
      : environment.IRACING_MCP_CLIENT_SECRET_FILE;

  if (
    !path.isAbsolute(credentialFile) ||
    (secretFile !== undefined &&
      (!path.isAbsolute(secretFile) ||
        path.dirname(secretFile) !== path.dirname(credentialFile) ||
        secretFile === credentialFile))
  ) {
    throw new Error("Invalid credential paths.");
  }

  return { credentialFile, secretFile };
}

function parseRemoteAuthorization(environment: Environment) {
  return remoteAuthorizationFromEnv({
    IRACING_MCP_RESOURCE_URL: environment.IRACING_MCP_RESOURCE_URL,
    IRACING_MCP_AUTH_ISSUER: environment.IRACING_MCP_AUTH_ISSUER,
    IRACING_MCP_AUTH_AUDIENCE: environment.IRACING_MCP_AUTH_AUDIENCE,
    IRACING_MCP_AUTH_JWKS_URL: environment.IRACING_MCP_AUTH_JWKS_URL,
    IRACING_MCP_AUTH_SCOPES: environment.IRACING_MCP_AUTH_SCOPES,
  });
}

/** Single Zod boundary: defaults, validates, and maps env to runtime options. */
export const RuntimeEnvironmentSchema = EnvironmentValues.transform(
  (environment, context) => {
    try {
      return {
        host: environment.IRACING_MCP_LISTEN_HOST,
        port: environment.IRACING_MCP_PORT,
        clientId: environment.IRACING_MCP_CLIENT_ID,
        ...parseHostPolicy(environment),
        ...parseCredentialPath(environment),
        remoteAuthorization: parseRemoteAuthorization(environment),
      };
    } catch {
      context.addIssue({
        code: "custom",
        message: "MCP runtime configuration invalid.",
        path: [],
      });

      return z.NEVER;
    }
  },
);

/** Host options after Zod validation, defaults, and transformation. */
export type RuntimeConfig = z.infer<typeof RuntimeEnvironmentSchema>;

/**
 * Parse runtime configuration while keeping invalid secret values out of errors.
 * @param {NodeJS.ProcessEnv} environment - Environment settings supplied by the process.
 * @returns {RuntimeConfig} Validated and transformed listener and provider settings.
 * @throws {Error} If any runtime, credential, or authorization setting is invalid.
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
