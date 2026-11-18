import { Configuration, TeamApi } from "@iracing-data/api-client-fetch";
import { resolveAccessToken } from "../../credentials.js";
import type { DisplayWriter } from "../../types.js";
import type { CreateExecuteOptions } from "./command.js";

/** Host-selected transport and JSON output. */
export interface TeamRuntime extends DisplayWriter {
  /** HTTP transport for API and cache requests. */
  fetch: typeof fetch;
}

/**
 * Bind authenticated team requests and credential-free cache downloads.
 * @param {TeamRuntime} runtime - Host transport and output.
 * @returns {CreateExecuteOptions} Command-facing operations.
 */
export function createTeamService(runtime: TeamRuntime): CreateExecuteOptions {
  return {
    async fetchTeam(options) {
      const accessToken = await resolveAccessToken(options);

      const api = new TeamApi(
        new Configuration({ accessToken, fetchApi: runtime.fetch }),
      );

      try {
        const envelope =
          options.request.operation === "get"
            ? await api.getTeam(options.request.query)
            : await api.getTeamMembership();

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
          "Team request failed. Check connectivity, token expiry, iracing.auth scope, and team access.",
        );
      }
    },
    present(document) {
      runtime.display(document);
    },
  };
}
