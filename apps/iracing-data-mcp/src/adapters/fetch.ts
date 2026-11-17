import { Configuration } from "@iracing-data/api-client-fetch";
import { McpServices } from "../composition.js";
import { createDriverQueries } from "./driver.js";
import { createRaceSearchQueries } from "./race-search.js";
import { createRecentRaceQueries } from "./recent-races.js";
import type { McpCapabilities } from "../composition.js";
import type { AccessTokenProvider } from "../token-provider.js";

/**
 * Bind the generated Fetch client and its tool-specific adapters to a
 * single credential provider. Configuration and adapters are memoized on first
 * selection; token values and request context are never cached by this composition.
 * @param {AccessTokenProvider} accessToken - Account-scoped token provider.
 * @returns {McpCapabilities} Tool-local queries backed by generated Fetch.
 */
export function createFetchQueries(
  accessToken: AccessTokenProvider,
): McpCapabilities {
  let configuration: Configuration | undefined;

  const getConfiguration = () =>
    (configuration ??= new Configuration({ accessToken }));

  return new McpServices({
    raceSearchQueries: () => createRaceSearchQueries(getConfiguration()),
    driverQueries: () => createDriverQueries(getConfiguration()),
    recentRaceQueries: () => createRecentRaceQueries(getConfiguration()),
  });
}
