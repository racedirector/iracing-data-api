/**
 * Production assembly for one local process/account.
 *
 * Configuration and secure directory/secret checks precede owner construction.
 * Only a secret file beside the credential document is accepted; environment
 * secret values are rejected. The container's fixed non-root UID/GID and exact
 * loopback Host/Origin configuration are enforced here; compose.yaml owns host
 * port publication, Docker-managed storage, and container isolation. The internal
 * listen address may be 0.0.0.0 for Docker while the published boundary remains
 * loopback.
 *
 * Remote MCP OAuth authorization is explicitly opt-in and fail-closed. It configures
 * only a resource-server verifier; the authorization server remains external.
 * Typed factories compose session, gateway and HTTP lifetimes once. Missing or
 * corrupt iRacing credentials can leave health/initialize available for stopped
 * recovery. Termination handlers drain HTTP before closing authorization.
 */
import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  createMcpAuthorizationBoundary,
  parseMcpRemoteAuthorizationConfig,
  type McpRemoteAuthorizationConfig,
} from "./authorization.js";
import { parseMcpApplicationConfig } from "./config.js";
import { createHttpApplication, installTerminationHandlers } from "./http.js";
import { createMcpServices, MCP_CREDENTIAL_FILE } from "./session.js";

/** Creates a recovery error without including configuration values or underlying errors. */
const configurationError = () =>
  new Error(
    "MCP configuration invalid. Check client identity, local Host/Origin policy, secure credential files, and any complete remote OAuth resource-server settings.",
  );

/**
 * Returns a frozen list of comma-separated authorities, or HTTP origins when
 * `origin` is true. Entries must use localhost or 127.0.0.1 and exactly match
 * their URL representation, without whitespace, wildcards, paths, or credentials.
 * Throws a configuration error for an empty list or any invalid entry.
 */
function exactList(value: string, origin: boolean) {
  const values = value.split(",");

  if (
    !values.length ||
    values.some((entry) => {
      try {
        if (!entry || entry !== entry.trim() || /[\s*]/.test(entry)) {
          return true;
        }

        const url = new URL(origin ? entry : `http://${entry}`);

        return (
          url.username !== "" ||
          url.password !== "" ||
          url.protocol !== "http:" ||
          !["127.0.0.1", "localhost"].includes(url.hostname) ||
          (origin ? url.origin !== entry : url.host !== entry)
        );
      } catch {
        return true;
      }
    })
  ) {
    throw configurationError();
  }

  return Object.freeze(values);
}

const remoteAuthorizationKeys = [
  "IRACING_MCP_RESOURCE_URL",
  "IRACING_MCP_AUTH_ISSUER",
  "IRACING_MCP_AUTH_AUDIENCE",
  "IRACING_MCP_AUTH_JWKS_URL",
  "IRACING_MCP_AUTH_SCOPES",
] as const;

/** Returns absent local mode or a complete validated remote OAuth configuration. */
function parseRemoteAuthorization(
  env: NodeJS.ProcessEnv,
): McpRemoteAuthorizationConfig | undefined {
  const configured = remoteAuthorizationKeys.filter(
    (key) => env[key] !== undefined,
  );

  if (configured.length === 0) {
    return undefined;
  }

  if (configured.length !== remoteAuthorizationKeys.length) {
    throw configurationError();
  }

  try {
    return parseMcpRemoteAuthorizationConfig({
      resourceUrl: env.IRACING_MCP_RESOURCE_URL,
      issuer: env.IRACING_MCP_AUTH_ISSUER,
      audience: env.IRACING_MCP_AUTH_AUDIENCE,
      jwksUrl: env.IRACING_MCP_AUTH_JWKS_URL,
      requiredScopes: env.IRACING_MCP_AUTH_SCOPES!.trim().split(/\s+/),
    });
  } catch {
    throw configurationError();
  }
}

/**
 * Returns frozen production settings with a trimmed, 1–512-character client ID.
 * Rejects inline iRacing secrets; an optional secret file must be an absolute path
 * beside the credential file, with a different filename. Host/origin lists retain
 * their exact local-only contract. Remote OAuth is absent by default and accepted
 * only when all resource-server variables are present and valid.
 */
export function parseProductionConfig(env: NodeJS.ProcessEnv) {
  const clientId = z
    .string()
    .trim()
    .min(1)
    .max(512)
    .safeParse(env.IRACING_MCP_CLIENT_ID);

  if (
    !clientId.success ||
    env.IRACING_MCP_CLIENT_SECRET !== undefined ||
    env.IRACING_AUTH_SECRET !== undefined
  ) {
    throw configurationError();
  }

  const secretFile = env.IRACING_MCP_CLIENT_SECRET_FILE || undefined;

  if (
    secretFile !== undefined &&
    (!path.isAbsolute(secretFile) ||
      path.dirname(secretFile) !== path.dirname(MCP_CREDENTIAL_FILE) ||
      path.basename(secretFile) === "credentials.json")
  ) {
    throw configurationError();
  }

  const allowedHosts = exactList(
    env.IRACING_MCP_ALLOWED_HOSTS ?? "127.0.0.1:3000,localhost:3000",
    false,
  );

  const allowedOrigins = exactList(
    env.IRACING_MCP_ALLOWED_ORIGINS ??
      "http://127.0.0.1:3000,http://localhost:3000",
    true,
  );

  const listenHost = env.IRACING_MCP_LISTEN_HOST ?? "127.0.0.1";

  if (
    !["127.0.0.1", "0.0.0.0"].includes(listenHost) ||
    allowedOrigins.some(
      (origin) => !allowedHosts.includes(new URL(origin).host),
    )
  ) {
    throw configurationError();
  }

  return Object.freeze({
    clientId: clientId.data,
    secretFile,
    allowedHosts,
    allowedOrigins,
    listenHost,
    remoteAuthorization: parseRemoteAuthorization(env),
  });
}

/**
 * Checks that the directory exists, is not a symlink, and is owned by the current
 * user with mode 0700. Requires nonzero process UID and GID; does not create or
 * repair the directory. Rejects with a configuration error on validation or I/O
 * failure, replacing the underlying error.
 */
export async function checkProductionDirectory(directory: string) {
  try {
    const stats = await lstat(directory);

    if (
      !process.getuid ||
      !process.getgid ||
      process.getuid() === 0 ||
      process.getgid() === 0 ||
      !stats.isDirectory() ||
      stats.isSymbolicLink() ||
      stats.uid !== process.getuid() ||
      (stats.mode & 0o777) !== 0o700
    ) {
      throw configurationError();
    }
  } catch {
    throw configurationError();
  }
}

/**
 * Reads a UTF-8 secret from a regular file owned by the current user with mode
 * 0600, rejecting a final-component symlink or a reported size above 4096 bytes.
 * Returns the trimmed value, which must be nonempty and contain no CR, LF, or NUL.
 * Validation and file open, read, stat, or close failures reject with a
 * configuration error that replaces the underlying error.
 */
export async function readProductionSecret(file: string) {
  try {
    const handle = await open(
      file,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
    );

    try {
      const stats = await handle.stat();

      if (
        !stats.isFile() ||
        stats.uid !== process.getuid?.() ||
        (stats.mode & 0o777) !== 0o600 ||
        stats.size > 4096
      ) {
        throw configurationError();
      }

      const value = (await handle.readFile("utf8")).trim();

      if (!value || /[\r\n\0]/.test(value)) {
        throw configurationError();
      }

      return value;
    } finally {
      await handle.close();
    }
  } catch {
    throw configurationError();
  }
}

/**
 * Composes one session/gateway owner and returns the HTTP application with logical
 * MCP sessions enabled and SIGTERM/SIGINT shutdown handlers installed. Listens on
 * port 3000 at IRACING_MCP_LISTEN_HOST, defaulting to 127.0.0.1.
 * Validates configuration and local file permissions before composing services.
 * Missing or invalid stored credentials allow startup in authorization_required.
 * Configuration and file checks reject with a configuration error; service
 * construction errors propagate. Listen or signal-handler setup failures shut
 * down the application and reject with a configuration error unless shutdown
 * itself rejects, in which case its error propagates.
 */
export async function startProduction(env: NodeJS.ProcessEnv = process.env) {
  const config = parseProductionConfig(env);

  await checkProductionDirectory(path.dirname(MCP_CREDENTIAL_FILE));

  const clientSecret = config.secretFile
    ? await readProductionSecret(config.secretFile)
    : undefined;

  const services = await createMcpServices({
    clientMetadata: {
      clientId: config.clientId,
      clientSecret,
      redirectUri: "http://127.0.0.1:3000/unused",
      scopes: ["iracing.auth"],
    },
  });

  const app = createHttpApplication({
    config: parseMcpApplicationConfig(),
    services,
    authorization: config.remoteAuthorization
      ? createMcpAuthorizationBoundary(config.remoteAuthorization)
      : undefined,
    allowedHosts: config.allowedHosts,
    allowedOrigins: config.allowedOrigins,
    sessionIdGenerator: randomUUID,
  });

  try {
    await app.listen(3000, config.listenHost);
    installTerminationHandlers(app, (exitCode) => {
      // HTTP has drained and the owner has removed uncertain credentials. A grant
      // socket may never settle; flush safe diagnostics and end the production process.
      process.stderr.write("", () => process.exit(exitCode));
    });

    return app;
  } catch {
    await app.shutdown();
    throw configurationError();
  }
}
