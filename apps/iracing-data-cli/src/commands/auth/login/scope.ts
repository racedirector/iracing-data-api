import {
  InMemoryStore,
  OAuthClient,
  type InternalState,
  type OAuthScopeList,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { authenticateWithBrowser } from "../../../authenticate.js";
import {
  defaultCredentialsPath,
  defaultMcpCredentialsPath,
} from "../../../credentials.js";
import { resolveTokenFormat, writeTokenOutput } from "../../../token-output.js";
import type { CreateLoginCommandScope, LoginInvocation } from "./command.js";
import type { Diagnostics } from "../../../diagnostics.js";

/**
 * Environment variables consumed by login composition; unrelated process environment values
 * are intentionally outside this boundary.
 */
export interface LoginEnvironment {
  /** OAuth client identifier supplied by the environment. */
  IRACING_AUTH_CLIENT?: string;

  /** Optional OAuth client secret supplied by the environment. */
  IRACING_AUTH_SECRET?: string;

  /** Registered loopback redirect URL supplied by the environment. */
  IRACING_AUTH_REDIRECT_URI?: string;

  /** Account username for password-limited authentication. */
  IRACING_AUTH_USERNAME?: string;

  /** Account password for password-limited authentication. */
  IRACING_AUTH_PASSWORD?: string;
}

interface PasswordLimitedCredentials {
  username: string;
  password: string;
}

type PasswordLimitedAuthenticationOptions = PasswordLimitedCredentials & {
  clientId: string;
  clientSecret: string;
  scopes: OAuthScopeList;
};

/**
 * Injectable authentication, output, and environment seams used to construct an isolated login
 * invocation scope.
 */
export interface LoginScopeDependencies {
  /** Injected loopback browser authorization implementation. */
  authenticate: typeof authenticateWithBrowser;

  /** Injected credential-document writer. */
  writeOutput: typeof writeTokenOutput;

  /** OAuth registration and account inputs read from the process environment. */
  environment: LoginEnvironment;

  /**
   * Optional implementation of the password-limited grant.
   * @param {PasswordLimitedAuthenticationOptions} options - Configuration and injected capabilities for this operation.
   * @returns {Promise<OAuthTokenResponse>} OAuth credentials obtained by the password-limited grant.
   */
  authenticatePasswordLimited?: (
    options: PasswordLimitedAuthenticationOptions,
  ) => Promise<OAuthTokenResponse>;
}

const defaultDependencies: LoginScopeDependencies = {
  authenticate: authenticateWithBrowser,
  writeOutput: writeTokenOutput,
  environment: process.env,
};

/**
 * Acquire and return an OAuth token using the password-limited grant, keeping the
 * username-keyed session in memory only. Client configuration, grant request, and
 * token validation failures reject unchanged; the invocation handles redaction.
 */
async function authenticateWithPasswordLimited(
  options: PasswordLimitedAuthenticationOptions,
): Promise<OAuthTokenResponse> {
  const client = new OAuthClient({
    clientMetadata: {
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      username: options.username,
      password: options.password,
      scopes: [...options.scopes],
    },
    stateStore: new InMemoryStore<string, InternalState>(),
    sessionStore: new InMemoryStore<string, OAuthTokenResponse>(),
  });

  return await client.passwordLimitedAuthorization();
}

/**
 * Return a factory that binds authentication and persistence to a validated
 * login invocation. Output takes precedence over credentials; otherwise an
 * auth-only scope selects the MCP credential file and auth/profile selects
 * the general CLI file.
 *
 * The returned factory rejects unsupported formats and explicit YAML for a
 * default destination before authentication. Authentication and file writes
 * are deferred to the returned capabilities. Browser authentication and writer
 * errors propagate; password-limited grant failures become a fixed error message.
 * @param {Diagnostics} diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {LoginScopeDependencies} dependencies - Injected external capabilities used by the command scope.
 * @returns {CreateLoginCommandScope} Factory that resolves an isolated dependency scope per invocation.
 */
export function createLoginCommandScopeFactory(
  diagnostics: Diagnostics,
  dependencies: LoginScopeDependencies = defaultDependencies,
): CreateLoginCommandScope {
  return async (invocation: LoginInvocation) =>
    await Promise.resolve(
      createLoginScope(invocation, diagnostics, dependencies),
    );
}

/**
 * Selects and validates the credential destination and returns deferred authentication
 * and write capabilities. Explicit output takes precedence over credentials; otherwise
 * auth-only scopes select the MCP credential file and other scopes select the CLI file.
 * @param {LoginInvocation} invocation - Normalized login options and destination preferences.
 * @param {Diagnostics} diagnostics - Diagnostic sink exposed by the returned scope.
 * @param {LoginScopeDependencies} dependencies - Authentication, output, and environment capabilities.
 * @returns {Awaited<ReturnType<CreateLoginCommandScope>>} Login capabilities without authenticating or writing credentials yet.
 * @throws {Error} If the format is unsupported or explicit YAML targets a default credential destination.
 */
function createLoginScope(
  invocation: LoginInvocation,
  diagnostics: Diagnostics,
  dependencies: LoginScopeDependencies,
): Awaited<ReturnType<CreateLoginCommandScope>> {
  const authOnly = invocation.scopes.length === 1;

  const destination =
    invocation.output ??
    invocation.credentials ??
    (authOnly ? defaultMcpCredentialsPath : defaultCredentialsPath);

  resolveTokenFormat(destination, invocation.format);
  if (
    !invocation.output &&
    !invocation.credentials &&
    invocation.format === "yaml"
  ) {
    throw new Error(
      "The shared credential file uses JSON. Pass --credentials with a .yaml path for YAML output.",
    );
  }

  return {
    authentication: {
      /**
       * Return the selected method's OAuth token without writing a credential file.
       * Browser login forwards the callback timeout in seconds and delegates browser
       * launch to the authentication dependency. Its failures propagate unchanged.
       *
       * Password-limited login requires nonempty client ID, client secret, username,
       * and password from the scoped environment. Trim the username but preserve the
       * password verbatim. Missing values reject before any grant attempt; otherwise
       * invoke authentication once, without retrying. Grant failures become a fixed
       * Error that omits the original cause. Browser options do not apply to this method.
       */
      async authenticate() {
        return authenticateInvocation(invocation, dependencies);
      },
    },
    credentials: {
      destination,

      /**
       * Persist the token, propagating writer failures. Unless force is set,
       * allow replacement for credential destinations but protect --output.
       */
      write(token) {
        return dependencies.writeOutput(token, {
          output: destination,
          format: invocation.format,
          force: invocation.force ?? !invocation.output,
        });
      },
    },
    diagnostics,
  };
}

/**
 * Runs the selected grant using the scoped environment without writing a credential file.
 * Browser authentication failures propagate unchanged. Password-limited login trims
 * the username, preserves the password, and replaces grant failures with a fixed error
 * that omits the original cause.
 * @param {LoginInvocation} invocation - Selected method, scopes, browser launch preference, and callback timeout in seconds.
 * @param {LoginScopeDependencies} dependencies - Authentication implementations and environment inputs.
 * @returns {Promise<OAuthTokenResponse>} Token returned by the selected authentication implementation.
 * @throws {Error} If password-limited credentials are missing or its grant fails; browser authentication errors propagate unchanged.
 */
async function authenticateInvocation(
  invocation: LoginInvocation,
  dependencies: LoginScopeDependencies,
) {
  const clientId = dependencies.environment.IRACING_AUTH_CLIENT ?? "";

  const clientSecret = nonempty(dependencies.environment.IRACING_AUTH_SECRET);

  if (invocation.method === "browser") {
    return await dependencies.authenticate({
      clientId,
      clientSecret,
      redirectUri: nonempty(dependencies.environment.IRACING_AUTH_REDIRECT_URI),
      scopes: invocation.scopes,
      open: invocation.open,
      timeoutSeconds: Number(invocation.timeoutSeconds),
    });
  }

  if (!clientId) {
    throw new Error(
      "Missing required environment variable: IRACING_AUTH_CLIENT",
    );
  }

  if (!clientSecret) {
    throw new Error(
      "Password-limited authentication requires IRACING_AUTH_SECRET for an eligible confidential client.",
    );
  }

  const username = dependencies.environment.IRACING_AUTH_USERNAME?.trim();

  const password = dependencies.environment.IRACING_AUTH_PASSWORD;

  if (!username) {
    throw new Error(
      "Password-limited authentication requires IRACING_AUTH_USERNAME.",
    );
  }

  if (!password) {
    throw new Error(
      "Password-limited authentication requires IRACING_AUTH_PASSWORD.",
    );
  }

  const authenticate =
    dependencies.authenticatePasswordLimited ?? authenticateWithPasswordLimited;

  try {
    return await authenticate({
      clientId,
      clientSecret,
      scopes: invocation.scopes,
      username,
      password,
    });
  } catch {
    throw new Error(
      "Password-limited OAuth authentication failed. Verify client eligibility, registered user access, credentials, and requested scope before trying again.",
    );
  }
}

function nonempty(value: string | undefined) {
  return value === "" ? undefined : value;
}
