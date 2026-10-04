import {
  SeriesPastSeasonsParametersSchema,
  SeriesSeasonListParametersSchema,
  SeriesSeasonScheduleParametersSchema,
  SeriesSeasonsParametersSchema,
} from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const seriesAssets = createEndpoint(
  "/data/series/assets",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.series.getSeriesAssets();
  },
);

export const getSeries = createEndpoint(
  "/data/series/get",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.series.getSeries();
  },
);

export const pastSeasons = createEndpoint(
  "/data/series/past_seasons",
  {
    method: "GET",
    query: SeriesPastSeasonsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.series.getSeriesPastSeasons(query);
  },
);

export const seasons = createEndpoint(
  "/data/series/seasons",
  {
    method: "GET",
    query: SeriesSeasonsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.series.getSeriesSeasons(query);
  },
);

export const seasonList = createEndpoint(
  "/data/series/season_list",
  {
    method: "GET",
    query: SeriesSeasonListParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.series.getSeriesSeasonList(query);
  },
);

export const seasonSchedule = createEndpoint(
  "/data/series/season_schedule",
  {
    method: "GET",
    query: SeriesSeasonScheduleParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.series.getSeriesSeasonSchedule(query);
  },
);

export const statsSeries = createEndpoint(
  "/data/series/stats_series",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.series.getSeriesStatsSeries();
  },
);
