import path from "node:path";
import {
  readOAuthTokenDocument,
  writeOAuthTokenDocument,
} from "@iracing-data/oauth-client";
import { checkProductionDirectory } from "./production.js";
import { MCP_CREDENTIAL_FILE } from "./session.js";

/** Offline stopped-owner import: shared schema and atomic durable writer, no OAuth client. */
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
