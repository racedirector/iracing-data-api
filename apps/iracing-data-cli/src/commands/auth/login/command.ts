import { Command } from "@commander-js/extra-typings";
import { type OAuthTokenResponse } from "@iracing-data/oauth-client";
import { readGlobalOptions } from "../../../schema.js";
import { type Options, type RawOptions, resolveOptions } from "./schema.js";
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
  invocation: Options,
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
 * Build login input parsing and execution over an invocation-owned authentication scope.
 * @param {LoginCommandDependencies} options - Authentication and persistence scope factory.
 * @returns {Command} Login command with hidden environment-backed credential inputs.
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
    .action(async (raw: RawOptions, command) => {
      const options = resolveOptions.parse({
        ...raw,
        ...readGlobalOptions(command),
      });

      const { authentication, credentials, diagnostics } =
        await createScope(options);

      const token = await authentication.authenticate();

      await credentials.write(token);
      diagnostics.info(
        `OAuth authentication complete. Credentials updated: ${credentials.destination}`,
      );
    });
}
