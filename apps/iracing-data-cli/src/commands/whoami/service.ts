import {
  OAuthApiClient,
  OAuthApiContractError,
  OAuthApiHttpError,
  type OAuthProfileApi,
} from "@iracing-data/oauth-client";
import { resolveAccessToken } from "../../credentials.js";
import type { Diagnostics } from "../../diagnostics.js";
import type { DisplayWriter } from "../../display.js";
import type { CreateExecuteOptions, WhoamiProfile } from "./command.js";

/** Host-owned HTTP transport, stdout and completion diagnostics. */
export interface WhoamiRuntime extends DisplayWriter {
  /** HTTP transport used by the maintained OAuth client. */
  fetch: typeof fetch;

  /** Secret-safe completion diagnostics. */
  diagnostics: Diagnostics;
}

/**
 * Bind credential resolution, profile projection and JSON presentation.
 * @param {WhoamiRuntime} runtime - Host transport, stdout and diagnostics.
 * @returns {CreateExecuteOptions} Command-facing operations.
 */
export function createWhoamiService(
  runtime: WhoamiRuntime,
): CreateExecuteOptions {
  return {
    async getProfile(options) {
      const accessToken = await resolveAccessToken(options);

      const api = new OAuthApiClient({ accessToken, fetchApi: runtime.fetch });

      return await readProfile(api);
    },
    present(profile) {
      runtime.display(profile);
      runtime.diagnostics.info("iRacing identity verified.");
    },
  };
}

/** Read only the two display fields and translate safe typed OAuth failures. */
async function readProfile(api: OAuthProfileApi): Promise<WhoamiProfile> {
  let profile: Awaited<ReturnType<OAuthProfileApi["getProfile"]>>;

  try {
    profile = await api.getProfile();
  } catch (error) {
    if (error instanceof OAuthApiHttpError) {
      // eslint-disable-next-line preserve-caught-error -- Identity diagnostics intentionally discard upstream response objects to avoid retaining secrets.
      throw new Error(
        `Identity request failed: HTTP ${String(error.response.status)}. The profile endpoint requires iracing.profile; auth-only credentials are valid for Data API access but cannot be used with whoami. Run iracing-data auth login --scope iracing.auth iracing.profile to obtain profile-capable credentials.`,
      );
    }

    if (error instanceof OAuthApiContractError) {
      if (error.kind === "transport") {
        // eslint-disable-next-line preserve-caught-error -- Identity diagnostics intentionally discard upstream response objects to avoid retaining secrets.
        throw new Error(
          "Identity request failed (network, timeout, or redirect). Check connectivity and retry.",
        );
      }

      if (error.kind === "not_json") {
        // eslint-disable-next-line preserve-caught-error -- Identity diagnostics intentionally discard upstream response objects to avoid retaining secrets.
        throw new Error(
          "Identity response was not JSON. No response body logged.",
        );
      }

      // eslint-disable-next-line preserve-caught-error -- Identity diagnostics intentionally discard upstream response objects to avoid retaining secrets.
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
