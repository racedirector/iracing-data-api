import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { parseMcpApplicationConfig } from "./config.js";
import { createHttpApplication, installTerminationHandlers } from "./http.js";
import { createMcpServices, MCP_CREDENTIAL_FILE } from "./session.js";

const configurationError = () =>
  new Error(
    "MCP configuration invalid. Set a client ID, exact Host/Origin lists, and a same-client secret file if required; use a non-root UID/GID and an owned 0700 credential directory with 0600 files. Stop the server before repairing credentials.",
  );

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

  if (
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
  });
}

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

/** Compose exactly one session/gateway owner and use the existing bounded HTTP lifecycle. */
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
    await app.listen(3000, "0.0.0.0");
    installTerminationHandlers(app);

    return app;
  } catch {
    await app.shutdown();
    throw configurationError();
  }
}
