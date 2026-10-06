import { Command } from "@commander-js/extra-typings";
import {
  OAuthApiClient,
  OAuthApiContractError,
  OAuthApiHttpError,
  type OAuthProfileApi,
} from "@iracing-data/oauth-client";
import { resolveAccessToken, type CredentialOptions } from "../credentials.js";
import type { Diagnostics } from "../diagnostics.js";

export type WhoamiDependencies = {
  createOAuthApi(accessToken: string): OAuthProfileApi;
};

const defaultDependencies: WhoamiDependencies = {
  createOAuthApi(accessToken) {
    return new OAuthApiClient({ accessToken });
  },
};

export async function whoami(
  options: CredentialOptions = {},
  dependencies: WhoamiDependencies = defaultDependencies,
) {
  const token = await resolveAccessToken(options);

  let profile;
  try {
    profile = await dependencies.createOAuthApi(token).getProfile();
  } catch (error) {
    if (error instanceof OAuthApiHttpError) {
      throw new Error(
        `Identity request failed: HTTP ${error.response.status}. The profile endpoint requires iracing.profile; auth-only credentials are valid for Data API access but cannot be used with whoami. Run iracing-data auth login --scope iracing.auth iracing.profile to obtain profile-capable credentials.`,
      );
    }

    if (error instanceof OAuthApiContractError) {
      if (error.message.includes("before a response was received")) {
        throw new Error(
          "Identity request failed (network, timeout, or redirect). Check connectivity and retry.",
        );
      }
      if (error.message.includes("not JSON")) {
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
}

export function createWhoamiCommand(
  diagnostics: Diagnostics,
  dependencies: WhoamiDependencies = defaultDependencies,
) {
  return new Command("whoami")
    .description(
      "Check active credentials and show the authenticated iRacing profile",
    )
    .option(
      "--credentials <path>",
      "Override the shared JSON or YAML credential file",
    )
    .action(async (options) => {
      const profile = await whoami(options, dependencies);
      process.stdout.write(`${JSON.stringify(profile, null, 2)}\n`);
      diagnostics.info("iRacing identity verified.");
    });
}
