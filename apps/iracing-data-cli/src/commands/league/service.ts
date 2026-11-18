import { Configuration, LeagueApi } from "@iracing-data/api-client-fetch";
import { LeagueRosterResponseSchema } from "@iracing-data/api-schema";
import { resolveAccessToken } from "../../credentials.js";
import type { DisplayWriter } from "../../types.js";
import type { CreateExecuteOptions } from "./command.js";
import type { LeagueRequest } from "./contracts.js";

/** Host-selected transport and output. */
export interface LeagueRuntime extends DisplayWriter {
  /** HTTP transport for API and cache requests. */
  fetch: typeof fetch;
}

/**
 * Bind authenticated league API access and unauthenticated cache downloads.
 * @param {LeagueRuntime} runtime - Host transport and output.
 * @returns {CreateExecuteOptions} Command-facing operations.
 */
export function createLeagueService(
  runtime: LeagueRuntime,
): CreateExecuteOptions {
  return {
    async fetchLeague(options) {
      const accessToken = await resolveAccessToken(options);

      const api = new LeagueApi(
        new Configuration({ accessToken, fetchApi: runtime.fetch }),
      );

      try {
        const envelope =
          options.request.operation === "roster"
            ? await rosterEnvelope(api, options.request.query)
            : await requestLeague(api, options.request);

        const url = new URL(envelope.link);

        if (url.protocol !== "https:" || url.username || url.password) {
          throw new Error("Invalid cache URL.");
        }

        const response = await runtime.fetch(url);

        if (!response.ok) {
          throw new Error("Cache download failed.");
        }

        return await response.json();
      } catch {
        throw new Error(
          "League request failed. Check connectivity, token expiry, iracing.auth scope, and league access.",
        );
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}

/**
 * Validate the typed roster response and select its download reference.
 * @param {LeagueApi} api - Authenticated generated client.
 * @param {Extract<LeagueRequest, { operation: "roster" }>["query"]} query - Canonical roster query.
 * @returns {Promise<{ link: string }>} Validated cache reference.
 */
async function rosterEnvelope(
  api: LeagueApi,
  query: Extract<LeagueRequest, { operation: "roster" }>["query"],
): Promise<{ link: string }> {
  const response = await api.getLeagueRoster(query);

  const body = LeagueRosterResponseSchema.parse({
    type: response.type,
    data: {
      success: response.data.success,
      subscribed: response.data.subscribed,
      roster_count: response.data.rosterCount,
      league_id: response.data.leagueId,
    },
    data_url: response.dataUrl,
  });

  if (!body.data.success) {
    throw new Error("Roster request unsuccessful.");
  }

  return { link: body.data_url };
}

/** Dispatch only modeled requests through the generated client. */
function requestLeague(api: LeagueApi, request: LeagueRequest) {
  switch (request.operation) {
    case "get":
      return api.getLeague(request.query);
    case "roster":
      return rosterEnvelope(api, request.query);
    case "seasons":
      return api.getLeagueSeasons(request.query);
    case "sessions":
      return api.getLeagueSeasonSessions(request.query);
    case "standings":
      return api.getLeagueSeasonStandings(request.query);
    case "points-systems":
      return api.getLeaguePointsSystems(request.query);
    case "membership":
      return api.getLeagueMembership(request.query);
    case "directory":
      return api.getLeagueDirectory(request.query);
    case "customer-sessions":
      return api.getLeagueCustomerLeagueSessions(request.query);
    default:
      throw new Error("Unsupported league operation.");
  }
}
