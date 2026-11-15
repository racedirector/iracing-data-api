import { Configuration } from "@iracing-data/api-client-fetch";
import { createDriverQueries } from "./driver.js";
import { createRecentRaceQueries } from "./recent-races.js";
import type { McpCapabilities } from "../composition.js";

/**
 * Bind the generated Fetch client and its tool-specific adapters to a
 * single credential provider. The token callback remains with its owner.
 * @param {() => Promise<string>} accessToken - Actor-owned token provider.
 * @returns {McpActorDependencies} Tool-local queries backed by generated Fetch.
 */
export function createFetchQueries(
  accessToken: () => Promise<string>,
): McpCapabilities {
  const configuration = new Configuration({ accessToken });

  return {
    driverQueries: createDriverQueries(configuration),
    recentRaceQueries: createRecentRaceQueries(configuration),
  };
}
