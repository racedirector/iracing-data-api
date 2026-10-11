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
  IRACING_AUTH_CLIENT?: string;
  IRACING_AUTH_SECRET?: string;
  IRACING_AUTH_REDIRECT_URI?: string;
  IRACING_AUTH_USERNAME?: string;
  IRACING_AUTH_PASSWORD?: string;
}

type PasswordLimitedCredentials = {
  username: string;
  password: string;
};

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
  authenticate: typeof authenticateWithBrowser;
  writeOutput: typeof writeTokenOutput;
  environment: LoginEnvironment;
  authenticatePasswordLimited?: (
    options: PasswordLimitedAuthenticationOptions,
  ) => Promise<OAuthTokenResponse>;
}

const defaultDependencies: LoginScopeDependencies = {
  authenticate: authenticateWithBrowser,
  writeOutput: writeTokenOutput,
  environment: process.env,
};

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
 * are deferred to the returned capabilities, which propagate dependency errors.
 */
export function createLoginCommandScopeFactory(
  diagnostics: Diagnostics,
  dependencies: LoginScopeDependencies = defaultDependencies,
): CreateLoginCommandScope {
  return async (invocation: LoginInvocation) => {
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
         * Authenticate using the selected method. Browser login retains its existing callback
         * behavior. Password-limited login reads its acquisition credentials from the scoped
         * environment only and makes exactly one grant attempt.
         */
        async authenticate() {
          const clientId = dependencies.environment.IRACING_AUTH_CLIENT ?? "";
          const clientSecret =
            dependencies.environment.IRACING_AUTH_SECRET || undefined;

          if (invocation.method === "browser") {
            return await dependencies.authenticate({
              clientId,
              clientSecret,
              redirectUri:
                dependencies.environment.IRACING_AUTH_REDIRECT_URI || undefined,
              scopes: invocation.scopes,
              timeoutSeconds: Number(invocation.timeoutSeconds),
              openBrowser: invocation.open,
              diagnostics,
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
            dependencies.authenticatePasswordLimited ??
            authenticateWithPasswordLimited;

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
  };
}
