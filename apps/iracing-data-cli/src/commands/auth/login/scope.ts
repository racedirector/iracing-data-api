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
