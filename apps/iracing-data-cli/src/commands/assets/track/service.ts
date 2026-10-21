/** Track-specific generated request selection over shared request execution. */
import { IRacingAPI } from "../../../api.js";
import type { DocumentRequestService } from "../../../services/request.js";
import type { MaterializeReturnedDataApiLink } from "../returned-data-api-link.js";
import type { Options } from "./schema.js";

/** Independently callable track-assets execution contract. */
export interface TrackAssetsService {
  /**
   * Fetch and publish the track-assets document.
   * @param {Options} options - Validated command options.
   * @returns {Promise<void>} Completion after output publication.
   */
  execute(options: Options): Promise<void>;
}

/**
 * Bind the track method and injected returned-link materializer.
 * @param {DocumentRequestService} requests - Shared authenticated executor.
 * @param {MaterializeReturnedDataApiLink} materialize - Injected HTTPS link transport.
 * @returns {TrackAssetsService} Track-assets command service.
 */
export function makeTrackAssetsService(
  requests: DocumentRequestService,
  materialize: MaterializeReturnedDataApiLink,
): TrackAssetsService {
  return {
    execute(options) {
      return requests.execute({
        input: options,
        fetch: (accessToken) =>
          IRacingAPI.withAccessToken(accessToken).track.getTrackAssets(),
        materialize: (envelope) => materialize(envelope.link),
        operation: "track assets",
        requiredScope: "iracing.auth",
        outputLabel: "Assets",
        successMessage: "Track assets fetched.",
      });
    },
  };
}
