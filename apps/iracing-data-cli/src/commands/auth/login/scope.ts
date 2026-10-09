import { authenticateWithBrowser } from "../../../authenticate.js";
import {
  defaultCredentialsPath,
  defaultMcpCredentialsPath,
} from "../../../credentials.js";
import { resolveTokenFormat, writeTokenOutput } from "../../../token-output.js";
import type { CreateLoginCommandScope, LoginInvocation } from "./command.js";
import type { Diagnostics } from "../../../diagnostics.js";

export interface LoginEnvironment {
  IRACING_AUTH_CLIENT?: string;
  IRACING_AUTH_SECRET?: string;
  IRACING_AUTH_REDIRECT_URI?: string;
}

export interface LoginScopeDependencies {
  authenticate: typeof authenticateWithBrowser;
  writeOutput: typeof writeTokenOutput;
  environment: LoginEnvironment;
}

const defaultDependencies: LoginScopeDependencies = {
  authenticate: authenticateWithBrowser,
  writeOutput: writeTokenOutput,
  environment: process.env,
};

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
         * Authenticate using the current supplied environment and invocation's
         * callback timeout in seconds. The default flow may open a browser and
         * rejects configuration, callback, timeout, and cancellation failures;
         * browser-opening failure permits manual completion.
         */
        authenticate() {
          return dependencies.authenticate({
            clientId: dependencies.environment.IRACING_AUTH_CLIENT ?? "",
            clientSecret:
              dependencies.environment.IRACING_AUTH_SECRET || undefined,
            redirectUri:
              dependencies.environment.IRACING_AUTH_REDIRECT_URI || undefined,
            scopes: invocation.scopes,
            timeoutSeconds: Number(invocation.timeoutSeconds),
            openBrowser: invocation.open,
            diagnostics,
          });
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
