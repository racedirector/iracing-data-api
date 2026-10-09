import { Command } from "@commander-js/extra-typings";
import {
  OAuthScopeListCodec,
  type OAuthScopeList,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { DEFAULT_SCOPES } from "../../../authenticate.js";
import type { Diagnostics } from "../../../diagnostics.js";

export type LoginOptions = {
  output?: string;
  credentials?: string;
  scope?: string[];
  format?: string;
  force?: boolean;
  open: boolean;
  timeoutSeconds: string;
};

export type LoginInvocation = Omit<LoginOptions, "scope"> & {
  scopes: OAuthScopeList;
};

export interface LoginCommandScope {
  authentication: {
    authenticate(): Promise<OAuthTokenResponse>;
  };
  credentials: {
    destination: string;
    write(token: OAuthTokenResponse): Promise<void>;
  };
  diagnostics: Diagnostics;
}

export type CreateLoginCommandScope = (
  invocation: LoginInvocation,
) => Promise<LoginCommandScope>;

export interface LoginCommandDependencies {
  createScope: CreateLoginCommandScope;
}

const INVALID_SCOPE_MESSAGE =
  "--scope must be either 'iracing.auth' or 'iracing.auth iracing.profile'.";

export function resolveLoginScopes(
  values: string[] | undefined,
): OAuthScopeList {
  if (!values) return DEFAULT_SCOPES;

  const parsed = OAuthScopeListCodec.safeParse(values.join(" "));
  if (!parsed.success) throw new Error(INVALID_SCOPE_MESSAGE);

  const scopes = parsed.data;
  const authOnly = scopes.length === 1 && scopes[0] === "iracing.auth";
  const authAndProfile =
    scopes.length === 2 &&
    scopes[0] === "iracing.auth" &&
    scopes[1] === "iracing.profile";

  if (!authOnly && !authAndProfile) throw new Error(INVALID_SCOPE_MESSAGE);
  return scopes;
}

export function createLoginCommand({ createScope }: LoginCommandDependencies) {
  return new Command("login")
    .description("Authenticate with iRacing using browser OAuth")
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

      const scopes = resolveLoginScopes(options.scope);
      const { authentication, credentials, diagnostics } = await createScope({
        ...options,
        scopes,
      });
      const token = await authentication.authenticate();
      await credentials.write(token);
      diagnostics.info(
        `OAuth authentication complete. Credentials updated: ${credentials.destination}`,
      );
    });
}
