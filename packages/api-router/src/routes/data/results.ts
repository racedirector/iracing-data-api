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
    const response = await iracing.results.getResults(query);
    return response.data;
  }
);

export const eventLog = createEndpoint(
  "/data/results/event_log",
  { method: "GET", query: IRacingResultsEventLogParametersSchema },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.results.getResultsEventLog(query);
    return response.data;
  }
);

export const lapChartData = createEndpoint(
  "/data/results/lap_chart_data",
  { method: "GET", query: IRacingResultsLapChartDataParametersSchema },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.results.getResultsLapChartData(query);
    return response.data;
  }
);

export const lapData = createEndpoint(
  "/data/results/lap_data",
  { method: "GET", query: IRacingResultsLapDataParametersSchema },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.results.getResultsLapData(query);
    return response.data;
  }
);

export const searchHosted = createEndpoint(
  "/data/results/search_hosted",
  { method: "GET", query: IRacingResultsSearchHostedParametersSchema },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.results.getResultsSearchHosted(query);
    return response.data;
  }
);

export const searchSeries = createEndpoint(
  "/data/results/search_series",
  { method: "GET", query: IRacingResultsSearchSeriesParametersSchema },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.results.getResultsSearchSeries(query);
    return response.data;
  }
);

export const seasonResults = createEndpoint(
  "/data/results/season_results",
  { method: "GET", query: IRacingResultsSeasonResultsParametersSchema },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.results.getResultsSeasonResults(query);
    return response.data;
  }
);
