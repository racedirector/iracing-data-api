/**
 * Read-only access-token resolution for authenticated CLI commands.
 *
 * Explicit --credentials overrides an injected/environment access token. Otherwise
 * an injected token takes precedence over IRACING_ACCESS_TOKEN, then the repository
 * default file is used only when no token is selected. A selected unreadable/invalid
 * file fails; it never silently falls through to a different identity. JSON/YAML
 * parsing here extracts access_token only, not a durable OAuth session or refresh
 * operation. Reject empty tokens, CR/LF and an existing Bearer prefix.
 *
 * Default paths are repository-relative with equal source/dist depth. login.ts
 * selects a separate auth-only MCP document so independent refreshing consumers do
 * not share one rotating credential. Callers selecting that document must observe
 * stopped-owner discipline; resolution does not lock or watch the file.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

// This CLI is private to the repository; source and dist have the same depth.
export const defaultCredentialsPath = fileURLToPath(
  new URL("../../../.iracing-data/credentials.json", import.meta.url),
);
export const defaultMcpCredentialsPath = fileURLToPath(
  new URL(
    "../../../.iracing-data/iracing-data-mcp/credentials.json",
    import.meta.url,
  ),
);

export type CredentialOptions = {
  credentials?: string;
  accessToken?: string;
  readCredentials?: (path: string) => Promise<string>;
};
export async function resolveAccessToken(
  options: CredentialOptions = {},
): Promise<string> {
  let token = options.accessToken ?? process.env.IRACING_ACCESS_TOKEN;
  const credentialPath =
    options.credentials ?? (!token ? defaultCredentialsPath : undefined);
  if (credentialPath) {
    let value: unknown;
    try {
      const text = await (
        options.readCredentials ?? ((path: string) => readFile(path, "utf8"))
      )(credentialPath);
      value = /\.ya?ml$/i.test(credentialPath)
        ? parseYaml(text)
        : JSON.parse(text);
    } catch {
      throw new Error(
        "Unable to read credentials. Run iracing-data auth login, set IRACING_ACCESS_TOKEN, or provide --credentials with a JSON or YAML token file.",
      );
    }
    token =
      typeof value === "object" &&
      value !== null &&
      "access_token" in value &&
      typeof value.access_token === "string"
        ? value.access_token
        : undefined;
  }
  if (!token?.trim() || /[\r\n]/.test(token) || token.startsWith("Bearer ")) {
    throw new Error(
      "Set IRACING_ACCESS_TOKEN without a Bearer prefix, or pass --credentials with an auth login token file.",
    );
  }
  return token;
}
