import {
  IRacingSeasonListParametersSchema,
  IRacingSeasonRaceGuideParametersSchema,
  IRacingSeasonSpectatorSubsessionidsParametersSchema,
  IRacingSeasonSpectatorSubsessionidsDetailParametersSchema,
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

export const spectatorSubsessionIds = createEndpoint(
  "/data/season/spectator_subsessionids",
  {
    method: "GET",
    query: IRacingSeasonSpectatorSubsessionidsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response =
      await iracing.season.getSeasonSpectatorSubsessionIds(query);
    return response.data;
  }
);

export const spectatorSubsessionIdsDetail = createEndpoint(
  "/data/season/spectator_subsessionids_detail",
  {
    method: "GET",
    query: IRacingSeasonSpectatorSubsessionidsDetailParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response =
      await iracing.season.getSeasonSpectatorSubsessionIdsDetail(query);
    return response.data;
  }
);
