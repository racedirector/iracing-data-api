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
 * Typed factories compose session, gateway and HTTP lifetimes once. Missing or
 * corrupt credentials can leave health/initialize available for stopped recovery.
 * Termination handlers drain HTTP before closing authorization; executable startup
 * and shutdown diagnostics must not expose configuration values or raw errors.
 */
import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { parseMcpApplicationConfig } from "./config.js";
import { createHttpApplication, installTerminationHandlers } from "./http.js";
import { createMcpServices, MCP_CREDENTIAL_FILE } from "./session.js";

/** Creates a recovery error without including configuration values or underlying errors. */
const configurationError = () =>
  new Error(
    "MCP configuration invalid. Set a client ID, exact Host/Origin lists, and a same-client secret file if required; use a non-root UID/GID and an owned 0700 credential directory with 0600 files. Stop the server before repairing credentials.",
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

/**
 * Returns frozen production settings with a trimmed, 1–512-character client ID.
 * Rejects inline secrets; an optional secret file must be an absolute path beside
 * the credential file, with a different filename. File access is checked later.
 * Host/origin lists use exact localhost or 127.0.0.1 entries, defaulting to port
 * 3000 and HTTP origins; every origin's authority must appear in the host list.
 * Throws a configuration error for invalid settings.
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
 * Composes one session/gateway owner and returns the HTTP application listening
 * on 0.0.0.0:3000, with SIGTERM/SIGINT shutdown handlers installed.
 * Validates configuration and local file permissions before composing services.
 * Missing or invalid stored credentials allow startup in authorization_required.
 * Configuration and file checks reject with a configuration error; service
 * construction errors propagate. Listen or signal-handler setup failures shut
 * down the application and reject with a configuration error.
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
    allowedHosts: config.allowedHosts,
    allowedOrigins: config.allowedOrigins,
  });

  try {
    await app.listen(3000, config.listenHost);
    installTerminationHandlers(app, services);
    return app;
  } catch {
    await app.shutdown().catch(() => undefined);
    await services.close().catch(() => undefined);
    throw configurationError();
  }
}
