import { Configuration, ConstantsApi } from "@iracing-data/api-client-fetch";
import { ConstantsResponseSchema } from "@iracing-data/api-schema";
import { resolveAccessToken } from "../../credentials.js";
import type { DisplayWriter } from "../../types.js";
import type { CreateExecuteOptions } from "./command.js";

/** Host-owned transport and script-safe output. */
export interface ConstantsRuntime extends DisplayWriter {
  /** HTTP transport for modeled requests. */
  fetch: typeof fetch;
}

/**
 * Fetch direct arrays without treating them as cache-link envelopes.
 * @param {ConstantsRuntime} runtime - Host transport and output.
 * @returns {CreateExecuteOptions} Command-facing operations.
 */
export function createConstantsService(
  runtime: ConstantsRuntime,
): CreateExecuteOptions {
  return {
    async fetchConstants(options) {
      const accessToken = await resolveAccessToken(options);

      const api = new ConstantsApi(
        new Configuration({ accessToken, fetchApi: runtime.fetch }),
      );

      try {
        const document = await requestConstants(api, options.operation);

        return ConstantsResponseSchema.parse(document);
      } catch {
        throw new Error(
          "Constants request failed. Check connectivity, token expiry, and iracing.auth scope.",
        );
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}

/** Dispatch the generated client's modeled constant operations. */
function requestConstants(
  api: ConstantsApi,
  operation: "categories" | "divisions" | "event-types",
) {
  switch (operation) {
    case "categories":
      return api.getConstantsCategories();
    case "divisions":
      return api.getConstantsDivisions();
    case "event-types":
      return api.getConstantsEventTypes();
    default:
      throw new Error("Unsupported constants operation.");
  }
}
