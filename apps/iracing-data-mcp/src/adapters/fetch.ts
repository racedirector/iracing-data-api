import { Configuration } from "@iracing-data/api-client-fetch";
import { createDriverQueries } from "./driver.js";
import { createRaceSearchQueries } from "./race-search.js";
import { createRecentRaceQueries } from "./recent-races.js";
import type { McpCapabilities } from "../composition.js";
import type { AccessTokenProvider } from "../token-provider.js";

/**
 * Bind the generated Fetch client and its tool-specific adapters to a
 * single credential provider. The token callback remains with its owner.
 * @param {AccessTokenProvider} accessToken - Account-scoped token provider.
 * @returns {McpCapabilities} Tool-local queries backed by generated Fetch.
 */
export function createFetchQueries(
  accessToken: AccessTokenProvider,
): McpCapabilities {
  const configuration = new Configuration({ accessToken });

  return {
    raceSearchQueries: createRaceSearchQueries(configuration),
    driverQueries: createDriverQueries(configuration),
    recentRaceQueries: createRecentRaceQueries(configuration),
  };
}
