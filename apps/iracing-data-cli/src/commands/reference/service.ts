import {
  Configuration,
  SeasonApi,
  SeriesApi,
} from "@iracing-data/api-client-fetch";
import { downloadCacheDocument } from "../../cache-document.js";
import { resolveAccessToken } from "../../credentials.js";
import type { DisplayWriter } from "../../types.js";
import type { CreateExecuteOptions, ReferenceOptions } from "./command.js";

/** Host-owned transport and output. */
export interface ReferenceRuntime extends DisplayWriter {
  /** HTTP transport for modeled requests and cache downloads. */
  fetch: typeof fetch;
}

/**
 * Bind generated reference requests and credential-free downloads.
 * @param {ReferenceRuntime} runtime - Host dependencies.
 * @returns {CreateExecuteOptions} Reference capabilities.
 */
export function createReferenceService(
  runtime: ReferenceRuntime,
): CreateExecuteOptions {
  return {
    async fetchReference(options) {
      const accessToken = await resolveAccessToken(options);

      const configuration = new Configuration({
        accessToken,
        fetchApi: runtime.fetch,
      });

      try {
        const document = await requestReference(configuration, options.request);

        if (options.responseOnly) {
          return await document.raw.json();
        }

        const envelope = await document.value();

        return await downloadCacheDocument(envelope.link, runtime.fetch);
      } catch {
        throw new Error(
          "Reference request failed. Check connectivity, token expiry, iracing.auth scope, and account access.",
        );
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}

/**
 * Dispatch validated requests through the generated SDK.
 * @param {Configuration} configuration - Authenticated transport.
 * @param {ReferenceOptions["request"]} request - Validated operation.
 * @returns {Promise<unknown>} Modeled API response.
 */
function requestReference(
  configuration: Configuration,
  request: ReferenceOptions["request"],
) {
  const season = new SeasonApi(configuration);

  const series = new SeriesApi(configuration);

  switch (request.operation) {
    case "season-list":
      return season.getSeasonListRaw(request.query);
    case "race-guide":
      return season.getSeasonRaceGuideRaw({
        ...request.query,
        from: request.query.from ? new Date(request.query.from) : undefined,
      });
    case "spectator-subsessionids":
      return season.getSeasonSpectatorSubsessionIdsRaw(request.query);
    case "spectator-subsessionids-detail":
      return season.getSeasonSpectatorSubsessionIdsDetailRaw(request.query);
    case "series-get":
      return series.getSeriesRaw();
    case "series-assets":
      return series.getSeriesAssetsRaw();
    case "stats-series":
      return series.getSeriesStatsSeriesRaw();
    case "past-seasons":
      return series.getSeriesPastSeasonsRaw(request.query);
    case "seasons":
      return series.getSeriesSeasonsRaw(request.query);
    case "series-season-list":
      return series.getSeriesSeasonListRaw(request.query);
    case "season-schedule":
      return series.getSeriesSeasonScheduleRaw(request.query);
    default:
      throw new Error("Unsupported reference operation.");
  }
}
