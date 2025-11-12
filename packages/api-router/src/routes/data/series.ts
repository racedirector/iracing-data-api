import {
  IRacingSeriesPastSeasonsParametersSchema,
  IRacingSeriesSeasonListParametersSchema,
  IRacingSeriesSeasonScheduleParametersSchema,
  IRacingSeriesSeasonsParametersSchema,
} from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const seriesAssets = createEndpoint(
  "/data/series/assets",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.series.getSeriesAssets();
    return response.data;
  }
);

export const getSeries = createEndpoint(
  "/data/series/get",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.series.getSeries();
    return response.data;
  }
);

export const pastSeasons = createEndpoint(
  "/data/series/past_seasons",
  {
    method: "GET",
    query: IRacingSeriesPastSeasonsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.series.getSeriesPastSeasons(query);
    return response.data;
  }
);

export const seasons = createEndpoint(
  "/data/series/seasons",
  {
    method: "GET",
    query: IRacingSeriesSeasonsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.series.getSeriesSeasons(query);
    return response.data;
  }
);

export const seasonList = createEndpoint(
  "/data/series/season_list",
  {
    method: "GET",
    query: IRacingSeriesSeasonListParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.series.getSeriesSeasonList(query);
    return response.data;
  }
);

export const seasonSchedule = createEndpoint(
  "/data/series/season_schedule",
  {
    method: "GET",
    query: IRacingSeriesSeasonScheduleParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.series.getSeriesSeasonSchedule(query);
    return response.data;
  }
);

export const statsSeries = createEndpoint(
  "/data/series/stats_series",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.series.getSeriesStatsSeries();
    return response.data;
  }
);
