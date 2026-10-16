import { Command } from "@commander-js/extra-typings";
import {
  OAuthScopeListCodec,
  type OAuthScopeList,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { DEFAULT_SCOPES } from "../../../authenticate.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Authentication methods supported by the login command. */
export type LoginMethod = "browser" | "password-limited";

/** Raw Commander values accepted by the login leaf before method, scope, and timeout normalization. */
export interface LoginOptions {
  /** Writes the command result to the configured destination. */
  output?: string;

  /** Credential-file selection or writer owned by this command scope. */
  credentials?: string;

  /** Repeated OAuth scope selections supplied on the command line. */
  scope?: string[];

  /** Explicit JSON or YAML serialization choice. */
  format?: string;

  /** Whether an existing output file may be replaced. */
  force?: boolean;

  /** Whether browser login launches the authorization URL automatically. */
  open: boolean;

  /** Maximum time to wait for browser authorization before cancelling. */
  timeoutSeconds: string;

  /** Requested browser or password-limited authentication flow. */
  method: string;
}

/**
 * Normalized login request passed into the invocation scope after method and repeated scope
 * options have been canonicalized.
 */
export type LoginInvocation = Omit<LoginOptions, "method" | "scope"> & {
  method: LoginMethod;
  scopes: OAuthScopeList;
};

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
  invocation: LoginInvocation,
) => Promise<LoginCommandScope>;

/**
 * Application-registration dependencies for the login command; runtime work is delegated to an
 * invocation scope.
 */
export interface LoginCommandDependencies {
  /** Resolves dependencies once for each command invocation. */
  createScope: CreateLoginCommandScope;
}

const INVALID_SCOPE_MESSAGE =
  "--scope must be either 'iracing.auth' or 'iracing.auth iracing.profile'.";

const INVALID_METHOD_MESSAGE =
  "--method must be either 'browser' or 'password-limited'.";

/**
 * Parse the requested authentication method, preserving browser authorization as the default.
 * Accept only the exact strings `browser` and `password-limited`; an omitted value
 * selects `browser`. Throw an Error for any other value, including an empty string.
 * @param {string | undefined} value - Input value to validate, store, or serialize.
 * @returns {LoginMethod} Supported authentication method, defaulting to browser.
 * @throws {Error} If the selection is neither browser nor password-limited.
 */
export function resolveLoginMethod(value: string | undefined): LoginMethod {
  const method = value ?? "browser";

  if (method === "browser" || method === "password-limited") {
    return method;
  }

  throw new Error(INVALID_METHOD_MESSAGE);
}

/**
 * Parse scope arguments, defaulting to auth and profile when omitted.
 * Accept only `iracing.auth` alone or followed by `iracing.profile`, in that
 * order. Throw an Error for empty, malformed, or unsupported selections.
 * @param {string[] | undefined} values - Repeated scope arguments supplied by the caller.
 * @returns {OAuthScopeList} Validated ordered authorization permissions.
 * @throws {Error} If the scope sequence is empty, malformed, or unsupported.
 */
export function resolveLoginScopes(
  values: string[] | undefined,
): OAuthScopeList {
  if (!values) {
    return DEFAULT_SCOPES;
  }

  const parsed = OAuthScopeListCodec.safeParse(values.join(" "));

  if (!parsed.success) {
    throw new Error(INVALID_SCOPE_MESSAGE);
  }

  const scopes = parsed.data;

  const authOnly = scopes.length === 1 && scopes[0] === "iracing.auth";

  const authAndProfile =
    scopes.length === 2 &&
    scopes[0] === "iracing.auth" &&
    scopes[1] === "iracing.profile";

  if (!authOnly && !authAndProfile) {
    throw new Error(INVALID_SCOPE_MESSAGE);
  }

  return scopes;
}

/**
 * Build the login command. Its action validates method, scope, and destination options,
 * resolves one scope, then authenticates and persists the returned token.
 * Conflicting destinations, invalid methods or scopes, and scope, authentication, or
 * persistence failures reject `parseAsync()`.
 * @param {LoginCommandDependencies} root0 - Command composition inputs and dependency overrides.
 * @param {CreateLoginCommandScope} root0.createScope - Factory resolving dependencies once per command invocation.
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
    .action(async (options) => {
      if (options.output && options.credentials) {
        throw new Error("Use either --output or --credentials, not both.");
      }

      const method = resolveLoginMethod(options.method);

      const scopes = resolveLoginScopes(options.scope);

      const { authentication, credentials, diagnostics } = await createScope({
        ...options,
        method,
        scopes,
      });

      const token = await authentication.authenticate();

      await credentials.write(token);
      diagnostics.info(
        `OAuth authentication complete. Credentials updated: ${credentials.destination}`,
      );
    });
}
