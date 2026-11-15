import { Configuration, MemberApi } from "@iracing-data/api-client-fetch";
import { ApplicationFailure, DriverProjection } from "@iracing-data/mcp";
import { mapFailure } from "../diagnostics/mapping.js";
import { readLinkedData } from "./linked-response.js";
import type { DriverQueries } from "@iracing-data/mcp";

/**
 * Concrete Fetch adapter. The host owns the configuration, including its
 * OAuth access-token callback. Neither tokens nor the SDK enter MCP contracts.
 */
export function createDriverQueries(configuration: Configuration): DriverQueries {
  const member = new MemberApi(configuration);

  return {
    async getCurrent({ signal }) {
      signal.throwIfAborted();
      let raw: unknown;

      try {
        const envelope = await member.getMemberInfo({ signal });
        raw = await readLinkedData(envelope, signal, configuration.fetchApi);
      } catch (error) {
        throw mapFailure(error, { domain: "upstream" });
      }

      const projection = DriverProjection.safeParse(raw);
      if (!projection.success) {
        throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
      }

      return projection.data;
    },
  };
}
