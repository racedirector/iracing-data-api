import {
  IRacingResultsGetParametersSchema,
  IRacingResultsEventLogParametersSchema,
  IRacingResultsLapChartDataParametersSchema,
  IRacingResultsLapDataParametersSchema,
  IRacingResultsSearchHostedParametersSchema,
  IRacingResultsSearchSeriesParametersSchema,
  IRacingResultsSeasonResultsParametersSchema,
} from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const getResults = createEndpoint(
  "/data/results/get",
  { method: "GET", query: IRacingResultsGetParametersSchema },
  async ({ context: { iracing }, query }) => {
    return await iracing.results.getResults(query);
  },
);

export const eventLog = createEndpoint(
  "/data/results/event_log",
  { method: "GET", query: IRacingResultsEventLogParametersSchema },
  async ({ context: { iracing }, query }) => {
    return await iracing.results.getResultsEventLog(query);
  },
);

export const lapChartData = createEndpoint(
  "/data/results/lap_chart_data",
  { method: "GET", query: IRacingResultsLapChartDataParametersSchema },
  async ({ context: { iracing }, query }) => {
    return await iracing.results.getResultsLapChartData(query);
  },
);

export const lapData = createEndpoint(
  "/data/results/lap_data",
  { method: "GET", query: IRacingResultsLapDataParametersSchema },
  async ({ context: { iracing }, query }) => {
    return await iracing.results.getResultsLapData(query);
  },
);

export const searchHosted = createEndpoint(
  "/data/results/search_hosted",
  { method: "GET", query: IRacingResultsSearchHostedParametersSchema },
  async ({
    context: { iracing },
    query: {
      start_range_begin,
      start_range_end,
      finish_range_begin,
      finish_range_end,
      ...query
    },
  }) => {
    return await iracing.results.getResultsSearchHosted({
      ...query,
      start_range_begin: start_range_begin
        ? new Date(start_range_begin)
        : undefined,
      start_range_end: start_range_end ? new Date(start_range_end) : undefined,
      finish_range_begin: finish_range_begin
        ? new Date(finish_range_begin)
        : undefined,
      finish_range_end: finish_range_end
        ? new Date(finish_range_end)
        : undefined,
    });
  },
);

export const searchSeries = createEndpoint(
  "/data/results/search_series",
  { method: "GET", query: IRacingResultsSearchSeriesParametersSchema },
  async ({
    context: { iracing },
    query: {
      start_range_begin,
      start_range_end,
      finish_range_begin,
      finish_range_end,
      ...query
    },
  }) => {
    return await iracing.results.getResultsSearchSeries({
      ...query,
      start_range_begin: start_range_begin
        ? new Date(start_range_begin)
        : undefined,
      start_range_end: start_range_end ? new Date(start_range_end) : undefined,
      finish_range_begin: finish_range_begin
        ? new Date(finish_range_begin)
        : undefined,
      finish_range_end: finish_range_end
        ? new Date(finish_range_end)
        : undefined,
    });
  },
);

export const seasonResults = createEndpoint(
  "/data/results/season_results",
  { method: "GET", query: IRacingResultsSeasonResultsParametersSchema },
  async ({ context: { iracing }, query }) => {
    return await iracing.results.getResultsSeasonResults(query);
  },
);
