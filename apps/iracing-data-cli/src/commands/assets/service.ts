import {
  CarApi,
  Configuration,
  SeriesApi,
  TrackApi,
} from "@iracing-data/api-client-fetch";
import { resolveAccessToken } from "../../credentials.js";
import { materializeReturnedDataApiLink } from "./returned-data-api-link.js";
import type { AssetsOptions, CreateExecuteOptions } from "./command.js";
import type { DisplayWriter } from "../../types.js";

/** Host-owned transport and script-safe output. */
export interface AssetsRuntime extends DisplayWriter {
  /** HTTP transport for modeled requests and cache materialization. */
  fetch: typeof fetch;
}

/**
 * Bind generated asset operations to the maintained asset materializer.
 * @param {AssetsRuntime} runtime - Host dependencies.
 * @returns {CreateExecuteOptions} Asset capabilities.
 */
export function createAssetsService(
  runtime: AssetsRuntime,
): CreateExecuteOptions {
  return {
    async fetchAssets(options) {
      const accessToken = await resolveAccessToken(options);

      const configuration = new Configuration({
        accessToken,
        fetchApi: runtime.fetch,
      });

      try {
        const envelope = await requestAssets(configuration, options.service);

        return await materializeReturnedDataApiLink(envelope.link, {
          fetch: runtime.fetch,
          timeoutMs: 15_000,
        });
      } catch {
        throw new Error(
          "Assets request failed. Check connectivity, token expiry, iracing.auth scope, and account access.",
        );
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}

/**
 * Dispatch only modeled asset operations.
 * @param {Configuration} configuration - Authenticated transport.
 * @param {AssetsOptions["service"]} service - Asset service.
 * @returns {Promise<unknown>} Cache envelope.
 */
function requestAssets(
  configuration: Configuration,
  service: AssetsOptions["service"],
) {
  switch (service) {
    case "car":
      return new CarApi(configuration).getCarAssets();
    case "series":
      return new SeriesApi(configuration).getSeriesAssets();
    case "track":
      return new TrackApi(configuration).getTrackAssets();
    default:
      throw new Error("Unsupported asset service.");
  }
}
