/** Series-specific generated request selection over shared request execution. */
import { IRacingAPI } from "../../../api.js";
import type { DocumentRequestService } from "../../../services/request.js";
import type { MaterializeReturnedDataApiLink } from "../returned-data-api-link.js";
import type { Options } from "./schema.js";

/** Independently callable series-assets execution contract. */
export interface SeriesAssetsService {
  /**
   * Fetch and publish the series-assets document.
   * @param {Options} options - Validated command options.
   * @returns {Promise<void>} Completion after output publication.
   */
  execute(options: Options): Promise<void>;
}

/**
 * Bind the series method and injected returned-link materializer.
 * @param {DocumentRequestService} requests - Shared authenticated executor.
 * @param {MaterializeReturnedDataApiLink} materialize - Injected HTTPS link transport.
 * @returns {SeriesAssetsService} Series-assets command service.
 */
export function makeSeriesAssetsService(
  requests: DocumentRequestService,
  materialize: MaterializeReturnedDataApiLink,
): SeriesAssetsService {
  return {
    execute(options) {
      return requests.execute({
        input: options,
        fetch: (accessToken) =>
          IRacingAPI.withAccessToken(accessToken).series.getSeriesAssets(),
        materialize: (envelope) => materialize(envelope.link),
        operation: "series assets",
        requiredScope: "iracing.auth",
        outputLabel: "Assets",
        successMessage: "Series assets fetched.",
      });
    },
  };
}
