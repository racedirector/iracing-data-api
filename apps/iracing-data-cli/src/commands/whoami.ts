import { Command } from "@commander-js/extra-typings";
import { OAuthProfileResponseSchema } from "@iracing-data/oauth-client";
import { resolveAccessToken, type CredentialOptions } from "../credentials.js";
import type { Diagnostics } from "../diagnostics.js";

export async function whoami(
  options: CredentialOptions & { fetcher?: typeof fetch } = {},
) {
  const token = await resolveAccessToken(options);
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(
      "https://oauth.iracing.com/oauth2/iracing/profile",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
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
  if (!response.ok)
    throw new Error(
      `Identity request failed: HTTP ${response.status}. Check token expiry and iracing.profile scope; run iracing-data auth login to obtain current credentials.`,
    );
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error("Identity response was not JSON. No response body logged.");
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
}

export function createWhoamiCommand(diagnostics: Diagnostics) {
  return new Command("whoami")
    .description(
      "Check active credentials and show the authenticated iRacing profile",
    )
    .option(
      "--credentials <path>",
      "Override the shared JSON or YAML credential file",
    )
    .action(async (options) => {
      const profile = await whoami(options);
      process.stdout.write(`${JSON.stringify(profile, null, 2)}\n`);
      diagnostics.info("iRacing identity verified.");
    });
}
