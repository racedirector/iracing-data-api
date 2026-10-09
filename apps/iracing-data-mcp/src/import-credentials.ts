import { randomUUID } from "node:crypto";
import { chmod, open, rename, unlink } from "node:fs/promises";
import path from "node:path";
import {
  OAuthTokenResponseSchema,
  readOAuthTokenDocument,
  writeOAuthTokenDocument,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { checkProductionDirectory } from "./production.js";
import { MCP_CREDENTIAL_FILE } from "./session.js";

const MCP_CLIENT_SECRET_FILE = path.join(
  path.dirname(MCP_CREDENTIAL_FILE),
  "client-secret",
);

function validateImportedToken(token: OAuthTokenResponse) {
  if (
    !token.refresh_token ||
    !token.scope?.split(/\s+/).includes("iracing.auth")
  ) {
    throw new Error("Invalid import.");
  }

  return token;
}

async function publishCredentials(
  token: OAuthTokenResponse,
  destination: string,
) {
  await checkProductionDirectory(path.dirname(destination));
  await writeOAuthTokenDocument(destination, validateImportedToken(token), {
    overwrite: true,
    durability: "required",
  });
}

/**
 * Imports a shared OAuth token JSON document from a secure filesystem path.
 * Callers must stop and drain credential owners first; this function does not
 * enforce that prerequisite.
 */
export async function importCredentials(
  source: string,
  destination = MCP_CREDENTIAL_FILE,
) {
  const token = await readOAuthTokenDocument(source);

  if (!token) {
    throw new Error("Invalid import.");
  }

  await publishCredentials(token, destination);
}

/**
 * Imports a serialized OAuth token document supplied out-of-band, such as stdin.
 * This intentionally avoids applying POSIX source-file checks to a host staging
 * file while retaining schema validation and secure durable destination writes.
 */
export async function importCredentialsJson(
  serialized: string,
  destination = MCP_CREDENTIAL_FILE,
) {
  let value: unknown;

  try {
    value = JSON.parse(serialized);
  } catch {
    throw new Error("Invalid import.");
  }

  const parsed = OAuthTokenResponseSchema.safeParse(value);

  if (!parsed.success) {
    throw new Error("Invalid import.");
  }

  await publishCredentials(parsed.data, destination);
}

/**
 * Atomically writes a client secret supplied out-of-band into the owned MCP data
 * directory. The secret is never accepted from the MCP container environment.
 */
export async function importClientSecret(
  secret: string,
  destination = MCP_CLIENT_SECRET_FILE,
) {
  const value = secret.trim();

  if (!value || /[\r\n\0]/.test(value) || Buffer.byteLength(value) > 4096) {
    throw new Error("Invalid import.");
  }

  const directory = path.dirname(destination);

  await checkProductionDirectory(directory);
  const temporary = path.join(
    directory,
    `.${path.basename(destination)}.${process.pid}.${randomUUID()}.tmp`,
  );
  let temporaryExists = false;

  try {
    const handle = await open(temporary, "wx", 0o600);

    temporaryExists = true;
    try {
      await handle.writeFile(value, { encoding: "utf8" });
      await handle.sync();
    } finally {
      await handle.close();
    }

    await chmod(temporary, 0o600);
    await rename(temporary, destination);
    temporaryExists = false;

    const directoryHandle = await open(directory, "r");

    try {
      await directoryHandle.sync();
    } finally {
      await directoryHandle.close();
    }
  } finally {
    if (temporaryExists) {
      await unlink(temporary).catch(() => undefined);
    }
  }
}
