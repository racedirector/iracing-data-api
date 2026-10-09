import {
  OAuthApiClient,
  OAuthApiContractError,
  OAuthApiHttpError,
  type OAuthProfileApi,
} from "@iracing-data/oauth-client";
import {
  resolveAccessToken,
  type CredentialOptions,
} from "../../credentials.js";
import type {
  CreateWhoamiCommandScope,
  WhoamiOptions,
  WhoamiProfile,
} from "./command.js";
import type { Diagnostics } from "../../diagnostics.js";

interface IdentityClient {
  getProfile(): Promise<WhoamiProfile>;
}

export interface WhoamiScopeDependencies {
  resolveAccessToken(options: CredentialOptions): Promise<string>;
  createIdentityClient(accessToken: string): IdentityClient;
  writeStdout(value: string): void;
}

/**
 * Project the typed OAuth API into the narrow identity capability and translate
 * its safe failures into CLI diagnostics. The generated client owns the request.
 */
export function createOAuthIdentityClient(
  accessToken: string,
  api: OAuthProfileApi = new OAuthApiClient({ accessToken }),
): IdentityClient {
  return {
    async getProfile(): Promise<WhoamiProfile> {
      let profile;
      try {
        profile = await api.getProfile();
      } catch (error) {
        if (error instanceof OAuthApiHttpError) {
          throw new Error(
            `Identity request failed: HTTP ${error.response.status}. The profile endpoint requires iracing.profile; auth-only credentials are valid for Data API access but cannot be used with whoami. Run iracing-data auth login --scope iracing.auth iracing.profile to obtain profile-capable credentials.`,
          );
        }

        if (error instanceof OAuthApiContractError) {
          if (error.kind === "transport") {
            throw new Error(
              "Identity request failed (network, timeout, or redirect). Check connectivity and retry.",
            );
          }
          if (error.kind === "not_json") {
            throw new Error(
              "Identity response was not JSON. No response body logged.",
            );
          }
          throw new Error(
            "Identity response did not match the expected profile. No response body logged.",
          );
        }

        throw error;
      }

      return {
        iracing_cust_id: profile.iracing_cust_id,
        iracing_name: profile.iracing_name,
      };
    },
  };
}

const defaultDependencies: WhoamiScopeDependencies = {
  resolveAccessToken,
  createIdentityClient: createOAuthIdentityClient,
  writeStdout(value) {
    process.stdout.write(value);
  },
};

/**
 * Return a factory that resolves credentials and binds an identity client per
 * invocation, propagating resolution and construction failures. The default
 * resolver prioritizes an explicit credential file over injected/environment
 * tokens, then uses the default file when no token is selected.
 * Profile retrieval and output are deferred to the returned capabilities.
 */
export function createWhoamiCommandScopeFactory(
  diagnostics: Diagnostics,
  dependencies: WhoamiScopeDependencies = defaultDependencies,
): CreateWhoamiCommandScope {
  return async (options: WhoamiOptions) => {
    const accessToken = await dependencies.resolveAccessToken(options);
    const identity = dependencies.createIdentityClient(accessToken);

    return {
      identity,
      output: {
        /** Write indented JSON with a trailing newline, propagating writer errors. */
        write(profile) {
          dependencies.writeStdout(`${JSON.stringify(profile, null, 2)}\n`);
        },
      },
      diagnostics,
    };
  };
}
