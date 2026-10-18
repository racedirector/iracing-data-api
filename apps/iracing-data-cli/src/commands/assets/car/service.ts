/** Opinionated car-assets fetch operation over the shared request lifecycle. */
import { IRacingAPI } from "../../../api.js";
import type { DocumentRequestService } from "../../../services/request.js";
import type { MaterializeReturnedDataApiLink } from "../returned-data-api-link.js";
import type { Options } from "./schema.js";

export interface CarAssetsService {
  execute(options: Options): Promise<void>;
}

/**
 * Select the generated car operation here, not in Commander or the registrar.
 * The returned-link transport remains an injected external effect.
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
