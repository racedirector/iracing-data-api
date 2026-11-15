import { StatsApi } from "@iracing-data/api-client-fetch";
import { ApplicationFailure, RecentRaceWindowSchema } from "@iracing-data/mcp";
import { z } from "zod";
import { mapFailure } from "../diagnostics/mapping.js";
import { readLinkedData } from "./linked-response.js";
import type { Configuration } from "@iracing-data/api-client-fetch";
import type { RecentRaceQueries } from "@iracing-data/mcp";

/** The generated payload includes nested track fields; the MCP contract does not. */
const SourceWindow = z.object({
  cust_id: z.int().positive(),
  races: z.array(
    z.looseObject({
      track: z
        .object({
          track_id: z.int().positive(),
          track_name: z.string().nullish(),
        })
        .nullish(),
    }),
  ),
});

/**
 * Concrete Fetch adapter for the authenticated member's recent-race window.
 * The caller chooses the client and OAuth configuration; nothing here is
 * constructed or imported by the MCP package itself.
 * @param {Configuration} configuration - Host-owned generated Fetch configuration with credentials and transport.
 * @returns {RecentRaceQueries} Queries for the bounded upstream recent-race window.
 */
export function createRecentRaceQueries(
  configuration: Configuration,
): RecentRaceQueries {
  const stats = new StatsApi(configuration);

  return {
    async getRecent({ custId, signal }) {
      signal.throwIfAborted();

      let raw: unknown;

      try {
        const envelope = await stats.getStatsMemberRecentRaces(
          custId === undefined ? {} : { cust_id: custId },
          { signal },
        );

        raw = await readLinkedData(envelope, signal, configuration.fetchApi);
      } catch (error) {
        throw mapFailure(error, { domain: "upstream" });
      }

      const source = SourceWindow.safeParse(raw);

      if (!source.success) {
        throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
      }

      // Source normalization is owned by this concrete adapter, not the tool.
      const window = RecentRaceWindowSchema.safeParse({
        cust_id: source.data.cust_id,
        races: source.data.races.map(({ track, ...race }) => ({
          ...race,
          track_id: track?.track_id ?? null,
          track_name: track?.track_name ?? null,
        })),
      });

      if (!window.success) {
        throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
      }

      if (custId !== undefined && window.data.cust_id !== custId) {
        throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
      }

      return window.data;
    },
  };
}
