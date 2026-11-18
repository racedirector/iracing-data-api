import {
  InMemoryStore,
  OAuthClient,
  type InternalState,
  type OAuthScopeList,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import {
  defaultCredentialsPath,
  defaultMcpCredentialsPath,
} from "../../../credentials.js";
import { resolveTokenFormat } from "../../../token-output.js";
import type { authenticateWithBrowser } from "../../../authenticate.js";
import type { Diagnostics } from "../../../diagnostics.js";
import type { writeTokenOutput } from "../../../token-output.js";
import type { CreateExecuteOptions } from "./command.js";
import type { Options as LoginInvocation } from "./schema.js";

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
 * Host-owned authentication, persistence and diagnostics.
 */
export interface LoginRuntime {
  /** Injected loopback browser authorization implementation. */
  authenticate: typeof authenticateWithBrowser;

  /** Injected credential-document writer. */
  writeOutput: typeof writeTokenOutput;

  /** Secret-safe completion diagnostics. */
  diagnostics: Diagnostics;

  /**
   * Optional implementation of the password-limited grant.
   * @param {PasswordLimitedAuthenticationOptions} options - Configuration and injected capabilities for this operation.
   * @returns {Promise<OAuthTokenResponse>} OAuth credentials obtained by the password-limited grant.
   */
  authenticatePasswordLimited?: (
    options: PasswordLimitedAuthenticationOptions,
  ) => Promise<OAuthTokenResponse>;
}

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
 * Bind destination validation, authentication and persistence in execution order.
 * @param {LoginRuntime} runtime - Host authentication, writer and diagnostics.
 * @returns {CreateExecuteOptions} Command-facing login and presentation operations.
 */
export function createLoginService(
  runtime: LoginRuntime,
): CreateExecuteOptions {
  return {
    async login(invocation) {
      const destination = resolveDestination(invocation);

      const token = await authenticateInvocation(invocation, runtime);

      await runtime.writeOutput(token, {
        output: destination,
        format: invocation.format,
        force: invocation.force,
      });

      return destination;
    },
    present(destination) {
      runtime.diagnostics.info(
        `OAuth authentication complete. Credentials updated: ${destination}`,
      );
    },
  };
}

/**
 * Select and validate the destination before starting authentication.
 * @param {LoginInvocation} invocation - Normalized login options and destination preferences.
 * @returns {string} Credential document destination.
 * @throws {Error} If the format is unsupported or explicit YAML targets a default credential destination.
 */
function resolveDestination(invocation: LoginInvocation): string {
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

  return destination;
}

/**
 * Run the selected grant using parsed inputs without writing credentials.
 * Browser authentication failures propagate unchanged. Password-limited login trims
 * the username, preserves the password, and replaces grant failures with a fixed error
 * that omits the original cause.
 * @param {LoginInvocation} invocation - Selected method, scopes, browser launch preference, and callback timeout in seconds.
 * @param {LoginRuntime} dependencies - Host authentication implementations.
 * @returns {Promise<OAuthTokenResponse>} Token returned by the selected authentication implementation.
 * @throws {Error} If password-limited credentials are missing or its grant fails; browser authentication errors propagate unchanged.
 */
async function authenticateInvocation(
  invocation: LoginInvocation,
  dependencies: LoginRuntime,
) {
  const clientId = invocation.clientId ?? "";

  const clientSecret = nonempty(invocation.clientSecret);

  const redirectUri = nonempty(invocation.redirectUri);

  const username = invocation.username?.trim();

  const password = invocation.password;

  if (invocation.method === "browser") {
    return await dependencies.authenticate({
      clientId,
      clientSecret,
      redirectUri,
      scopes: invocation.scopes,
      open: invocation.open,
      timeoutSeconds: invocation.timeoutSeconds,
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
