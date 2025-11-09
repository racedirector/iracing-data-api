import { createEndpoint } from "../utils";
import { z } from "zod";

export const seriesAssets = createEndpoint(
  "/data/series/assets",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.series.assets();
    return response.data;
  }
);

export const getSeries = createEndpoint(
  "/data/series/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.series.get();
    return response.data;
  }
);

export const pastSeasons = createEndpoint(
  "/data/series/past_seasons",
  {
    method: "GET",
    query: z.object({
      seriesId: z.number(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.series.pastSeasons(query);
    return response.data;
  }
);

export const seasons = createEndpoint(
  "/data/series/seasons",
  {
    method: "GET",
    query: z.object({
      includeSeries: z.boolean().optional(),
      seasonYear: z.number().optional(),
      seasonQuarter: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.series.seasons(query);
    return response.data;
  }
);

export const seasonList = createEndpoint(
  "/data/series/season_list",
  {
    method: "GET",
    query: z.object({
      includeSeries: z.boolean().optional(),
      seasonYear: z.number().optional(),
      seasonQuarter: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.series.seasonList(query);
    return response.data;
  }
);

export const seasonSchedule = createEndpoint(
  "/data/series/season_schedule",
  {
    method: "GET",
    query: z.object({
      seasonId: z.number(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.api.data.series.seasonSchedule(query);
    return response.data;
  }
);

export const statsSeries = createEndpoint(
  "/data/series/stats_series",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.series.statsSeries();
    return response.data;
  }
);
