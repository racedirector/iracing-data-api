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
import { createMcpAuthorizationBoundary } from "./authorization.js";
import {
  createDefaultMcpJwtVerifier,
} from "./jwt-verifier.js";
import { createCliMcpRuntimeDependencies } from "./composition.js";
import { parseRuntimeConfig } from "./runtime-config.js";
import { startMcpRuntime } from "./runtime.js";

/** Creates a recovery error without including configuration values or underlying errors. */
const configurationError = () =>
  new Error(
    "MCP configuration invalid. Set a client ID, exact Host/Origin lists, and a same-client secret file if required; use a non-root UID/GID and an owned 0700 credential directory with 0600 files. Stop the server before repairing credentials.",
  );

/**
 * Validate the Docker production settings through the runtime's single Zod
 * environment transform. Production still requires an OAuth client ID.
 * @param {NodeJS.ProcessEnv} environment - Process configuration supplied by Docker or the host.
 * @returns {ReturnType<typeof parseRuntimeConfig>} Validated listener and credential options.
 */
export function parseProductionConfig(environment: NodeJS.ProcessEnv) {
  const config = parseRuntimeConfig({ ...environment, NODE_ENV: "production" });

  if (!config.clientId) {
    throw configurationError();
  }

  return config;
}

/**
 * Checks that the directory exists, is not a symlink, and is owned by the current
 * user with mode 0700. Requires nonzero process UID and GID; does not create or
 * repair the directory. Rejects with a configuration error on validation or I/O
 * failure, replacing the underlying error.
 * @param {string} directory - Credential directory whose ownership and permissions must be checked.
 * @returns {Promise<void>} Completion after the directory passes ownership and permission checks.
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
 * @param {string} file - Secret-file path whose contents and permissions must be checked.
 * @returns {Promise<string>} Validated client-secret contents.
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
 * Start the local Docker host with a production credential owner. Authenticated
 * deployments may instead call startMcpRuntime with injected actor/providers.
 * @param {NodeJS.ProcessEnv} environment - Docker environment and listener settings.
 * @returns {Promise<Awaited<ReturnType<typeof startMcpRuntime>>>} Running MCP application and shutdown controls.
 */
export async function startProduction(
  environment: NodeJS.ProcessEnv = process.env,
) {
  const config = parseProductionConfig(environment);

  const authorization = config.remoteAuthorization
    ? createMcpAuthorizationBoundary({
        ...config.remoteAuthorization,
        verifier: await createDefaultMcpJwtVerifier(config.remoteAuthorization),
      })
    : undefined;

  await checkProductionDirectory(path.dirname(config.credentialFile));

  const clientSecret = config.secretFile
    ? await readProductionSecret(config.secretFile)
    : undefined;

  const dependencies = await createCliMcpRuntimeDependencies({
    clientMetadata: {
      clientId: config.clientId!,
      clientSecret,
      redirectUri: `http://127.0.0.1:${config.port}/unused`,
      scopes: ["iracing.auth"],
    },
    credentialFile: config.credentialFile,
  });

  return startMcpRuntime({
    config,
    dependencies,
    authorization,
    onStopped: (exitCode) => {
      process.stderr.write("", () => process.exit(exitCode));
    },
  });
}

