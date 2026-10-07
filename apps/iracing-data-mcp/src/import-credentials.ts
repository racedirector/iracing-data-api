import path from "node:path";
import {
  readOAuthTokenDocument,
  writeOAuthTokenDocument,
} from "@iracing-data/oauth-client";
import { checkProductionDirectory } from "./production.js";
import { MCP_CREDENTIAL_FILE } from "./session.js";

/**
 * Imports a shared OAuth token JSON document, atomically overwriting the
 * destination with required durability and mode 0600, without an OAuth request.
 * Callers must stop and drain credential owners first; this function does not
 * enforce that prerequisite. The destination defaults to MCP_CREDENTIAL_FILE.
 * Rejects with a configuration error if the destination directory check fails,
 * or "Invalid import." if the source is missing or lacks a refresh token or
 * iracing.auth scope. Document validation, path, I/O, and durability errors from
 * the shared reader/writer propagate; a durability failure can occur after the
 * destination has been replaced.
 */
export async function importCredentials(
  source: string,
  destination = MCP_CREDENTIAL_FILE,
) {
  await checkProductionDirectory(path.dirname(destination));
  const token = await readOAuthTokenDocument(source);

  if (
    !token?.refresh_token ||
    !token.scope?.split(/\s+/).includes("iracing.auth")
  ) {
    throw new Error("Invalid import.");
  }

  await writeOAuthTokenDocument(destination, token, {
    overwrite: true,
    durability: "required",
  });
}
