import {
  Configuration,
  DriverStatsApi,
  ResultsApi,
  SessionApi,
  TimeAttackApi,
} from "@iracing-data/api-client-fetch";
import { ResultsSearchSeriesResponseSchema } from "@iracing-data/api-schema";
import { parse } from "csv-parse/sync";
import {
  downloadCacheDocument,
  downloadCacheText,
} from "../../cache-document.js";
import { resolveAccessToken } from "../../credentials.js";
import type { DisplayWriter } from "../../types.js";
import type { CreateExecuteOptions, ActivityOptions } from "./command.js";

/** Host-owned transport and JSON output. */
export interface ActivityRuntime extends DisplayWriter {
  /** HTTP transport for API and cache requests. */
  fetch: typeof fetch;
}

/**
 * Bind typed activity requests and credential-free cache resolution.
 * @param {ActivityRuntime} runtime - Host dependencies.
 * @returns {CreateExecuteOptions} Activity capabilities.
 */
export function createActivityService(
  runtime: ActivityRuntime,
): CreateExecuteOptions {
  return {
    async fetchActivity(options) {
      const accessToken = await resolveAccessToken(options);

      const configuration = new Configuration({
        accessToken,
        fetchApi: runtime.fetch,
      });

      try {
        const response = await requestActivity(configuration, options.request);

        if (options.responseOnly) {
          return await response.raw.json();
        }

        if (options.request.operation === "search-series") {
          const wire: unknown = await response.raw.json();

          ResultsSearchSeriesResponseSchema.parse(wire);

          return wire;
        }

        const envelope = await response.value();

        if (!("link" in envelope)) {
          throw new Error("Expected a cache reference.");
        }

        if (options.request.operation === "driver-stats") {
          const text = await downloadCacheText(envelope.link, runtime.fetch);

          const records: unknown = parse(text, {
            columns: true,
            skip_empty_lines: true,
            bom: true,
          });

          return records;
        }

        return await downloadCacheDocument(envelope.link, runtime.fetch);
      } catch {
        throw new Error(
          "Activity request failed. Check connectivity, token expiry, iracing.auth scope, and account access.",
        );
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}

/**
 * Dispatch canonical activity requests through generated clients.
 * @param {Configuration} configuration - Authenticated transport.
 * @param {ActivityOptions["request"]} request - Validated request.
 * @returns {Promise<unknown>} Modeled API response.
 */
function requestActivity(
  configuration: Configuration,
  request: ActivityOptions["request"],
) {
  const results = new ResultsApi(configuration);

  switch (request.operation) {
    case "event-log":
      return results.getResultsEventLogRaw(request.query);
    case "lap-chart-data":
      return results.getResultsLapChartDataRaw(request.query);
    case "lap-data":
      return results.getResultsLapDataRaw(request.query);
    case "season-results":
      return results.getResultsSeasonResultsRaw(request.query);
    case "search-series":
      return results.getResultsSearchSeriesRaw({
        ...request.query,
        start_range_begin: request.query.start_range_begin
          ? new Date(request.query.start_range_begin)
          : undefined,
        start_range_end: request.query.start_range_end
          ? new Date(request.query.start_range_end)
          : undefined,
        finish_range_begin: request.query.finish_range_begin
          ? new Date(request.query.finish_range_begin)
          : undefined,
        finish_range_end: request.query.finish_range_end
          ? new Date(request.query.finish_range_end)
          : undefined,
      });
    case "driver-stats":
      return new DriverStatsApi(configuration).getDriverStatsByCategoryRaw(
        request.query,
      );
    case "registered-drivers":
      return new SessionApi(configuration).getSessionRegisteredDriversRaw(
        request.query,
      );
    case "time-attack":
      return new TimeAttackApi(
        configuration,
      ).getTimeAttackMemberSeasonResultsRaw(request.query);
    default:
      throw new Error("Unsupported activity operation.");
  }
}
