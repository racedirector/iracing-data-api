import {
  IRacingSeasonListParametersSchema,
  IRacingSeasonRaceGuideParametersSchema,
} from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const list = createEndpoint(
  "/data/season/list",
  {
    method: "GET",
    query: IRacingSeasonListParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.season.getSeasonList(query);
    return response.data;
  }
);

export const raceGuide = createEndpoint(
  "/data/season/race_guide",
  {
    method: "GET",
    query: IRacingSeasonRaceGuideParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.season.getSeasonRaceGuide(query);
    return response.data;
  }
);

// TODO: Spectator subsessionIds
// TODO: Spectator subsessionIds detail
