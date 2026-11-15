import { Configuration, StatsApi } from "@iracing-data/api-client-fetch";
import { StatsWorldRecordsResponseSchema } from "@iracing-data/api-schema";
import { downloadCacheDocument } from "../../cache-document.js";
import { resolveAccessToken } from "../../credentials.js";
import type { CreateExecuteOptions, StatsOptions } from "./command.js";
import type { DisplayWriter } from "../../types.js";

/** Host-owned HTTP transport and script-safe display. */
export interface StatsRuntime extends DisplayWriter {
  /** HTTP transport for modeled requests and cache downloads. */
  fetch: typeof fetch;
}

/**
 * Bind generated statistics requests to credential-free cache downloads.
 * @param {StatsRuntime} runtime - Host dependencies.
 * @returns {CreateExecuteOptions} Statistics capabilities.
 */
export function createStatsService(
  runtime: StatsRuntime,
): CreateExecuteOptions {
  return {
    async fetchStats(options) {
      const accessToken = await resolveAccessToken(options);

      const api = new StatsApi(
        new Configuration({ accessToken, fetchApi: runtime.fetch }),
      );

      try {
        const document = await requestStats(api, options.request);

        if (options.responseOnly) {
          return await document.raw.json();
        }

        if (options.request.operation === "world-records") {
          const wire: unknown = await document.raw.json();

          StatsWorldRecordsResponseSchema.parse(wire);

          return wire;
        }

        const envelope = await document.value();

        if (!("link" in envelope)) {
          throw new Error("Expected a cache reference.");
        }

        return await downloadCacheDocument(envelope.link, runtime.fetch);
      } catch {
        throw new Error(
          "Statistics request failed. Check connectivity, token expiry, iracing.auth scope, and account access.",
        );
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}

/**
 * Dispatch validated requests through the generated statistics API.
 * @param {StatsApi} api - Authenticated generated client.
 * @param {StatsOptions["request"]} request - Validated operation.
 * @returns {Promise<unknown>} Modeled response.
 */
function requestStats(api: StatsApi, request: StatsOptions["request"]) {
  switch (request.operation) {
    case "member-bests":
      return api.getStatsMemberBestsRaw(request.query);
    case "member-career":
      return api.getStatsMemberCareerRaw(request.query);
    case "member-division":
      return api.getStatsMemberDivisionRaw(request.query);
    case "member-recap":
      return api.getStatsMemberRecapRaw(request.query);
    case "member-recent-races":
      return api.getStatsMemberRecentRacesRaw(request.query);
    case "member-summary":
      return api.getStatsMemberSummaryRaw(request.query);
    case "member-yearly":
      return api.getStatsMemberYearlyRaw(request.query);
    case "season-driver-standings":
      return api.getStatsSeasonDriverStandingsRaw(request.query);
    case "season-supersession-standings":
      return api.getStatsSeasonSupersessionStandingsRaw(request.query);
    case "season-team-standings":
      return api.getStatsSeasonTeamStandingsRaw(request.query);
    case "season-tt-standings":
      return api.getStatsSeasonTimeTrialStandingsRaw(request.query);
    case "season-tt-results":
      return api.getStatsSeasonTimeTrialResultsRaw(request.query);
    case "season-qualify-results":
      return api.getStatsSeasonQualifyResultsRaw(request.query);
    case "world-records":
      return api.getStatsWorldRecordsRaw(request.query);
    default:
      throw new Error("Unsupported statistics operation.");
  }
}
