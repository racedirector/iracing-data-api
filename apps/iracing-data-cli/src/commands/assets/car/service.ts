/** Opinionated car-assets fetch operation over the shared request lifecycle. */
import { IRacingAPI } from "../../../api.js";
import type { DocumentRequestService } from "../../../services/request.js";
import type { MaterializeReturnedDataApiLink } from "../returned-data-api-link.js";
import type { Options } from "./schema.js";

/** Independently callable car-assets execution contract. */
export interface CarAssetsService {
  /**
   * Fetch and publish the car-assets document.
   * @param {Options} options - Validated command options.
   * @returns {Promise<void>} Completion after output publication.
   */
  execute(options: Options): Promise<void>;
}

/**
 * Select the generated car operation without coupling request execution to the SDK.
 * @param {DocumentRequestService} requests - Shared authenticated executor.
 * @param {MaterializeReturnedDataApiLink} materialize - Injected HTTPS link transport.
 * @returns {CarAssetsService} Car-assets command service.
 */
export function makeCarAssetsService(
  requests: DocumentRequestService,
  materialize: MaterializeReturnedDataApiLink,
): CarAssetsService {
  return {
    execute(options) {
      return requests.execute({
        input: options,
        fetch: (accessToken) =>
          IRacingAPI.withAccessToken(accessToken).car.getCarAssets(),
        materialize: (envelope) => materialize(envelope.link),
        operation: "car assets",
        requiredScope: "iracing.auth",
        outputLabel: "Assets",
        successMessage: "Car assets fetched.",
      });
    },
  };
}
