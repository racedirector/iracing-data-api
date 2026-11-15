import {
  Configuration,
  LookupApi,
  ResponseError,
} from "@iracing-data/api-client-fetch";
import { downloadCacheDocument } from "../../cache-document.js";
import { resolveAccessToken } from "../../credentials.js";
import type { CreateExecuteOptions, LookupOptions } from "./command.js";
import type { DisplayWriter } from "../../types.js";

/** Host-owned lookup transport and JSON output. */
export interface LookupRuntime extends DisplayWriter {
  /** HTTP transport for API and opaque cache URLs. */
  fetch: typeof fetch;
}

/**
 * Bind generated lookup operations and credential-free cache resolution.
 * @param {LookupRuntime} runtime - Host dependencies.
 * @returns {CreateExecuteOptions} Lookup capabilities.
 */
export function createLookupService(
  runtime: LookupRuntime,
): CreateExecuteOptions {
  return {
    async fetchLookup(options) {
      const accessToken = await resolveAccessToken(options);

      const api = new LookupApi(
        new Configuration({ accessToken, fetchApi: runtime.fetch }),
      );

      try {
        const envelope = await requestLookup(api, options.request);

        return await downloadCacheDocument(envelope.link, runtime.fetch);
      } catch (error) {
        const status =
          error instanceof ResponseError
            ? ` (HTTP ${String(error.response.status)})`
            : "";

        // eslint-disable-next-line preserve-caught-error -- SDK causes may contain bearer headers and signed URLs.
        throw new Error(
          `Lookup request failed${status}. Check connectivity, token expiry, iracing.auth scope, and account access.`,
        );
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}

/**
 * Dispatch typed lookup requests through generated operations.
 * @param {LookupApi} api - Authenticated generated client.
 * @param {LookupOptions["request"]} request - Validated request.
 * @returns {Promise<unknown>} Lookup response.
 */
function requestLookup(api: LookupApi, request: LookupOptions["request"]) {
  switch (request.operation) {
    case "countries":
      return api.getLookupCountries();
    case "current-season":
      return api.getLookupCurrentSeason();
    case "flairs":
      return api.getLookupFlairs();
    case "licenses":
      return api.getLookupLicenses();
    case "get":
      return api.getLookup(request.query);
    case "drivers":
      return api.getLookupDrivers(request.query);
    default:
      throw new Error("Unsupported lookup operation.");
  }
}
