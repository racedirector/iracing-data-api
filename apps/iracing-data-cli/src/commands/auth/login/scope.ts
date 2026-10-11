import { createInterface } from "node:readline/promises";
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
 * Injectable authentication, secret-input, output, and environment seams used to construct an
 * isolated login invocation scope.
 */
export interface LoginScopeDependencies {
  authenticate: typeof authenticateWithBrowser;
  writeOutput: typeof writeTokenOutput;
  environment: LoginEnvironment;
  authenticatePasswordLimited?: (
    options: PasswordLimitedAuthenticationOptions,
  ) => Promise<OAuthTokenResponse>;
  readPasswordLimitedCredentials?: () => Promise<PasswordLimitedCredentials>;
}

const defaultDependencies: LoginScopeDependencies = {
  authenticate: authenticateWithBrowser,
  writeOutput: writeTokenOutput,
  environment: process.env,
};

function requireInteractiveTerminal() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "Password-limited login requires an interactive terminal for credential input.",
    );
  }
}

async function readUsername(): Promise<string> {
  requireInteractiveTerminal();
  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  const controller = new AbortController();
  const cancel = () => controller.abort();
  process.once("SIGINT", cancel);

  try {
    const username = await terminal.question("iRacing username: ", {
      signal: controller.signal,
    });
    if (!username.trim()) {
      throw new Error("Username is required for password-limited authentication.");
    }
    return username.trim();
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Authentication cancelled.");
    }
    throw error;
  } finally {
    process.off("SIGINT", cancel);
    terminal.close();
  }
}

async function readHiddenPassword(): Promise<string> {
  requireInteractiveTerminal();
  if (typeof process.stdin.setRawMode !== "function") {
    throw new Error(
      "Password-limited login requires terminal support for hidden password input.",
    );
  }

  const wasRaw = process.stdin.isRaw;
  const wasPaused = process.stdin.isPaused();
  let password = "";
  process.stdout.write("iRacing password: ");
  process.stdin.setRawMode(true);
  process.stdin.resume();

  try {
    await new Promise<void>((resolve, reject) => {
      const onData = (chunk: Buffer | string) => {
        const input = typeof chunk === "string" ? chunk : chunk.toString("utf8");
        for (const character of input) {
          if (character === "\u0003" || character === "\u0004") {
            cleanup();
            reject(new Error("Authentication cancelled."));
            return;
          }
          if (character === "\r" || character === "\n") {
            cleanup();
            resolve();
            return;
          }
          if (character === "\u007f" || character === "\b") {
            password = password.slice(0, -1);
            continue;
          }
          if (character >= " ") password += character;
        }
      };
      const cleanup = () => process.stdin.off("data", onData);
      process.stdin.on("data", onData);
    });
  } finally {
    process.stdin.setRawMode(wasRaw);
    if (wasPaused) process.stdin.pause();
    process.stdout.write("\n");
  }

  if (!password) {
    throw new Error("Password is required for password-limited authentication.");
  }
  return password;
}

async function readPasswordLimitedCredentials(): Promise<PasswordLimitedCredentials> {
  const username = await readUsername();
  const password = await readHiddenPassword();
  return { username, password };
}

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
         * behavior. Password-limited login reads credentials only from the interactive secret
         * input seam and makes exactly one grant attempt.
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

          const readCredentials =
            dependencies.readPasswordLimitedCredentials ??
            readPasswordLimitedCredentials;
          const authenticate =
            dependencies.authenticatePasswordLimited ??
            authenticateWithPasswordLimited;
          let supplied: PasswordLimitedCredentials | undefined;

          try {
            supplied = await readCredentials();
            if (!supplied.username.trim()) {
              throw new Error(
                "Username is required for password-limited authentication.",
              );
            }
            if (!supplied.password) {
              throw new Error(
                "Password is required for password-limited authentication.",
              );
            }

            try {
              return await authenticate({
                clientId,
                clientSecret,
                scopes: invocation.scopes,
                username: supplied.username,
                password: supplied.password,
              });
            } catch {
              throw new Error(
                "Password-limited OAuth authentication failed. Verify client eligibility, registered user access, credentials, and requested scope before trying again.",
              );
            }
          } finally {
            supplied = undefined;
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
