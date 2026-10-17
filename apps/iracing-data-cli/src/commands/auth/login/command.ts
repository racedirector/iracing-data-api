import { Command } from "@commander-js/extra-typings";
import { type OAuthTokenResponse } from "@iracing-data/oauth-client";
import {
  type LoginOptions,
  type RawLoginOptions,
  resolveOptions,
} from "./schema.js";
import type { Diagnostics } from "../../../diagnostics.js";

/**
 * Per-invocation capabilities required to authenticate, persist credentials, and emit
 * diagnostics without global state.
 */
export interface LoginCommandScope {
  /** Runs the selected OAuth grant without exposing tokens to diagnostics. */
  authentication: {
    authenticate(): Promise<OAuthTokenResponse>;
  };

  /** Credential-file selection or writer owned by this command scope. */
  credentials: {
    destination: string;
    write(token: OAuthTokenResponse): Promise<void>;
  };

  /** Secret-safe diagnostic sink for command progress and failures. */
  diagnostics: Diagnostics;
}

/**
 * Factory contract that owns construction and cleanup boundaries for one login invocation.
 * @param {LoginInvocation} invocation - Parsed authentication options for this command invocation.
 * @returns {Promise<LoginCommandScope>} Resolved capabilities for one command invocation.
 */
export type CreateLoginCommandScope = (
  invocation: LoginOptions,
) => Promise<LoginCommandScope>;

/**
 * Application-registration dependencies for the login command; runtime work is delegated to an
 * invocation scope.
 */
export interface LoginCommandDependencies {
  /** Resolves dependencies once for each command invocation. */
  createScope: CreateLoginCommandScope;
}

/**
 * Build the login command. Its action validates method, scope, and destination options,
 * resolves one scope, then authenticates and persists the returned token.
 * Conflicting destinations, invalid methods or scopes, and scope, authentication, or
 * persistence failures reject `parseAsync()`.
 * @param {LoginCommandDependencies} options - Command composition inputs and dependency overrides.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createLoginCommand({ createScope }: LoginCommandDependencies) {
  return new Command("login")
    .description("Authenticate with iRacing OAuth")
    .option(
      "--method <browser|password-limited>",
      "Authentication method",
      "browser",
    )
    .option(
      "-o, --output <path>",
      "Write tokens to an alternate file (protected unless --force)",
    )
    .option(
      "--credentials <path>",
      "Credential file to update instead of the repository default",
    )
    .option(
      "--scope <scopes...>",
      "OAuth scopes: iracing.auth, or iracing.auth iracing.profile",
    )
    .option("--format <json|yaml>", "Token serialization format")
    .option("--force", "Replace an existing output file")
    .option("--no-open", "Do not open the browser automatically")
    .option(
      "--timeout-seconds <seconds>",
      "OAuth callback timeout in seconds",
      "300",
    )
    .action(async (raw: RawLoginOptions) => {
      const options = resolveOptions.parse(raw);

      const { authentication, credentials, diagnostics } =
        await createScope(options);

      const token = await authentication.authenticate();

      await credentials.write(token);
      diagnostics.info(
        `OAuth authentication complete. Credentials updated: ${credentials.destination}`,
      );
    });
}
