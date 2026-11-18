import { Configuration, HostedApi } from "@iracing-data/api-client-fetch";
import { resolveAccessToken } from "../../credentials.js";
import type { DisplayWriter } from "../../types.js";
import type { CreateExecuteOptions } from "./command.js";

/** Host transport and JSON output. */
export interface HostedRuntime extends DisplayWriter {
  /** HTTP transport for API and cache requests. */
  fetch: typeof fetch;
}

/**
 * Bind modeled hosted requests and credential-free cache downloads.
 * @param {HostedRuntime} runtime - Host dependencies.
 * @returns {CreateExecuteOptions} Command capabilities.
 */
export function createHostedService(
  runtime: HostedRuntime,
): CreateExecuteOptions {
  return {
    async fetchHosted(options) {
      const accessToken = await resolveAccessToken(options);

      const api = new HostedApi(
        new Configuration({ accessToken, fetchApi: runtime.fetch }),
      );

      try {
        const envelope =
          options.request.operation === "combined-sessions"
            ? await api.getHostedCombinedSessions(options.request.query)
            : await api.getHostedSessions();

        const url = new URL(envelope.link);

        if (url.protocol !== "https:" || url.username || url.password) {
          throw new Error("Invalid cache URL.");
        }

        const response = await runtime.fetch(url);

        if (!response.ok) {
          throw new Error("Cache download failed.");
        }

        return await response.json();
      } catch {
        throw new Error(
          "Hosted request failed. Check connectivity, token expiry, iracing.auth scope, and account access.",
        );
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}
