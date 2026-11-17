import path from "node:path";
import { Option } from "@commander-js/extra-typings";

/**
 * Option for explicitly setting the iRacing access token for requests.
 */
export const accessTokenOption = new Option("--access-token <token>")
  .env("IRACING_ACCESS_TOKEN")
  .hideHelp();

/**
 * Option a file to use for OAuth credentials.
 */
export const credentialsOption = new Option(
  "--credentials <path>",
  "Credential document",
)
  .env("IRACING_CREDENTIALS")
  .default(path.resolve(".iracing-data/iracing-data-mcp/credentials.json"));

/**
 * OAuth client ID option.
 */
export const clientIdOption = new Option(
  "--client-id <id>",
  "The iRacing OAuth client ID.",
).env("IRACING_AUTH_CLIENT");

/**
 * OAuth client secret option.
 */
export const maskedClientSecretOption = new Option(
  "--masked-client-secret <masked>",
  "The pre-masked iRacing OAuth client secret.",
);

/**
 * OAuth client secret option, loaded from the environment.
 */
export const clientSecretOption = new Option(
  "--client-secret <secret>",
  "The iRacing OAuth client secret.",
)
  .env("IRACING_AUTH_SECRET")
  .hideHelp();

/**
 * OAuth redirect URI option.
 */
export const redirectUriOption = new Option(
  "--redirect-uri <uri>",
  "A redirect registered with iRacing for the client.",
).env("IRACING_AUTH_REDIRECT_URI");

/**
 * IRacing OAuth password-limited username option.
 */
export const usernameOption = new Option(
  "--username <username>",
  "The iRacing OAuth password-limited account username.",
).env("IRACING_AUTH_USERNAME");

/**
 * IRacing OAuth password-limited password option.
 */
export const maskedPasswordOption = new Option(
  "--masked-password <masked>",
  "The pre-masked iRacing OAuth password-limited account password.",
);

/**
 * IRacing OAuth password-limited password option.
 *
 * This cannot be provided via CLI options or stdin.
 */
export const passwordOption = new Option(
  "--password <password>",
  "The iRacing OAuth password-limited account password",
)
  .env("IRACING_AUTH_PASSWORD")
  .hideHelp();

/**
 * Select server transport mode.
 */
export const transportOption = new Option(
  "--transport <transport>",
  "MCP transport",
)
  .choices(["stdio", "http"])
  .default("stdio");
