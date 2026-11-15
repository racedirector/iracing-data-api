import {
  CarApi,
  CarclassApi,
  Configuration,
  MemberApi,
  ResultsApi,
  ResponseError,
  TrackApi,
} from "@iracing-data/api-client-fetch";
import {
  MemberAwardsResponseSchema,
  MemberAwardInstancesResponseSchema,
} from "@iracing-data/api-schema";
import { downloadCacheDocument } from "../../cache-document.js";
import { resolveAccessToken } from "../../credentials.js";
import type { CreateExecuteOptions, ImportOptions } from "./command.js";
import type { DisplayWriter } from "../../types.js";

/** Host transport and output. */
export interface ImportRuntime extends DisplayWriter {
  /** HTTP transport. */
  fetch: typeof fetch;
}

/**
 * Bind modeled API requests and credential-free cache downloads.
 * @param {ImportRuntime} runtime - Host dependencies.
 * @returns {CreateExecuteOptions} Command capabilities.
 */
// eslint-disable-next-line max-lines-per-function -- Keep staged safe diagnostics with the request/materialization boundary.
export function createImportService(
  runtime: ImportRuntime,
): CreateExecuteOptions {
  return {
    async fetchDocument(options) {
      const accessToken = await resolveAccessToken(options);

      const configuration = new Configuration({
        accessToken,
        fetchApi: runtime.fetch,
      });

      let stage = "API request";

      try {
        const responseDocument = await requestDocument(
          configuration,
          options.request,
        );

        stage = "response decoding";

        if (options.responseOnly) {
          return await responseDocument.raw.json();
        }

        if (
          ["member-awards", "member-award-instances"].includes(
            options.request.operation,
          )
        ) {
          const schema =
            options.request.operation === "member-awards"
              ? MemberAwardsResponseSchema
              : MemberAwardInstancesResponseSchema;

          const metadata = schema.parse(await responseDocument.raw.json());

          if (!metadata.data.success) {
            throw new Error("Member awards request unsuccessful.");
          }

          stage = "cache download or decoding";

          return await downloadCacheDocument(metadata.data_url, runtime.fetch);
        }

        const envelope: unknown = await responseDocument.raw.json();

        if (
          typeof envelope !== "object" ||
          envelope === null ||
          !("link" in envelope)
        ) {
          return envelope;
        }

        stage = "cache reference validation";
        if (typeof envelope.link !== "string") {
          throw new Error("Expected a string cache reference.");
        }

        stage = "cache download or decoding";

        return await downloadCacheDocument(envelope.link, runtime.fetch);
      } catch (error) {
        const status =
          error instanceof ResponseError
            ? ` (HTTP ${String(error.response.status)})`
            : "";

        // eslint-disable-next-line preserve-caught-error -- SDK causes may contain bearer credentials and signed URLs.
        throw new Error(`Import data request failed during ${stage}${status}.`);
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}

/**
 * Dispatch requests through the generated SDK.
 * @param {Configuration} configuration - Authenticated transport.
 * @param {ImportOptions["request"]} request - Validated operation.
 * @returns {Promise<unknown>} Cache envelope.
 */
function requestDocument(
  configuration: Configuration,
  request: ImportOptions["request"],
) {
  switch (request.operation) {
    case "member-awards":
      return new MemberApi(configuration).getMemberAwardsRaw(request.query);
    case "member-award-instances":
      return new MemberApi(configuration).getMemberAwardInstancesRaw(
        request.query,
      );
    case "member-chart-data":
      return new MemberApi(configuration).getMemberChartDataRaw(request.query);
    case "member-profile":
      return new MemberApi(configuration).getMemberProfileRaw(request.query);
    case "member-info":
      return new MemberApi(configuration).getMemberInfoRaw();
    case "member-participation-credits":
      return new MemberApi(configuration).getMemberParticipationCreditsRaw();
    case "member":
      return new MemberApi(configuration).getMemberRaw(request.query);
    case "search-hosted":
      return new ResultsApi(configuration).getResultsSearchHostedRaw({
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
    case "car":
      return new CarApi(configuration).getCarRaw();
    case "car-class":
      return new CarclassApi(configuration).getCarClassRaw();
    case "track":
      return new TrackApi(configuration).getTrackRaw();
    default:
      throw new Error("Unsupported import operation.");
  }
}
