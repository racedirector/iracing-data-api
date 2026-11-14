import { Configuration, ResultsApi } from "@iracing-data/api-client-fetch";
import { resolveAccessToken } from "../../credentials.js";
import type { CreateExecuteOptions } from "./command.js";

/** Host-selected transport and output. */
export interface ResultsRuntime {
  /** HTTP transport. */
  fetch: typeof fetch;

  /**
   * JSON document output sink.
   * @param {unknown} document - Downloaded JSON.
   */
  display(document: unknown): void;
}

/**
 * Bind authenticated API access and unauthenticated cache downloads.
 * @param {ResultsRuntime} runtime - Explicit host transport and output.
 * @returns {CreateExecuteOptions} Command-facing operations.
 */
export function createResultsService(
  runtime: ResultsRuntime,
): CreateExecuteOptions {
  return {
    async fetchResults(options) {
      const accessToken = await resolveAccessToken(options);

      const api = new ResultsApi(
        new Configuration({ accessToken, fetchApi: runtime.fetch }),
      );

      try {
        const envelope = await api.getResults(options.query);

        const url = new URL(envelope.link);

        if (url.protocol !== "https:") {
          throw new Error("Invalid cache protocol.");
        }

        const response = await runtime.fetch(url);

        if (!response.ok) {
          throw new Error("Cache download failed.");
        }

        return await response.json();
      } catch {
        throw new Error(
          "Results request failed. Check connectivity, token expiry, iracing.auth scope, and subsession access.",
        );
      }
    },
    present: (document) => {
      runtime.display(document);
    },
  };
}
