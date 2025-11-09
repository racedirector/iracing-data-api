import { createEndpoint } from "../utils";
import { z } from "zod";

export const list = createEndpoint(
  "/data/season/list",
  {
    method: "GET",
    query: z.object({
      seasonYear: z.number(),
      seasonQuarter: z.number(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.season.list(query);
    return response.data;
  }
);

export const raceGuide = createEndpoint(
  "/data/season/race_guide",
  {
    method: "GET",
    query: z.object({
      from: z.date(),
      includeEndAfterFrom: z.boolean().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.season.raceGuide(query);
    return response.data;
  }
);

// TODO: Spectator subsessionIds
// TODO: Spectator subsessionIds detail
