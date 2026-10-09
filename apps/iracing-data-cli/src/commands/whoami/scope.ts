import { OAuthProfileResponseSchema } from "@iracing-data/oauth-client";
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
 * Bind a bearer token without its Bearer prefix to the OAuth profile endpoint.
 * Requests are deferred to getProfile; the endpoint requires iracing.profile.
 */
export function createFetchIdentityClient(
  accessToken: string,
  fetcher: typeof fetch = fetch,
): IdentityClient {
  return {
    /**
     * Fetch and validate the profile, returning only customer ID and name.
     * Each call rejects redirects and supplies a 30-second abort signal.
     * Request, JSON decoding, and schema failures become fixed errors;
     * unsuccessful HTTP statuses and non-JSON content types also reject.
     * Errors omit response bodies and original exception messages. Success
     * does not establish Data API access.
     */
    async getProfile(): Promise<WhoamiProfile> {
      let response: Response;
      try {
        response = await fetcher(
          "https://oauth.iracing.com/oauth2/iracing/profile",
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            redirect: "error",
            signal: AbortSignal.timeout(30000),
          },
        );
      } catch {
        throw new Error(
          "Identity request failed (network, timeout, or redirect). Check connectivity and retry.",
        );
      }

      if (!response.ok) {
        throw new Error(
          `Identity request failed: HTTP ${response.status}. The profile endpoint requires iracing.profile; auth-only credentials are valid for Data API access but cannot be used with whoami. Run iracing-data auth login --scope iracing.auth iracing.profile to obtain profile-capable credentials.`,
        );
      }

      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(
          "Identity response was not JSON. No response body logged.",
        );
      }

      try {
        const profile = OAuthProfileResponseSchema.parse(await response.json());
        return {
          iracing_cust_id: profile.iracing_cust_id,
          iracing_name: profile.iracing_name,
        };
      } catch {
        throw new Error(
          "Identity response did not match the expected profile. No response body logged.",
        );
      }
    },
  };
}

const defaultDependencies: WhoamiScopeDependencies = {
  resolveAccessToken,
  createIdentityClient: createFetchIdentityClient,
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
