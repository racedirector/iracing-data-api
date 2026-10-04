import {
  SeasonListParametersSchema,
  SeasonRaceGuideParametersSchema,
  SeasonSpectatorSubsessionidsParametersSchema,
  SeasonSpectatorSubsessionidsDetailParametersSchema,
} from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const list = createEndpoint(
  "/data/season/list",
  {
    method: "GET",
    query: SeasonListParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.season.getSeasonList(query);
  },
);

export const raceGuide = createEndpoint(
  "/data/season/race_guide",
  {
    method: "GET",
    query: SeasonRaceGuideParametersSchema,
  },
  async ({ context: { iracing }, query: { from, ...query } }) => {
    return await iracing.season.getSeasonRaceGuide({
      ...query,
      from: from ? new Date(from) : undefined,
    });
  },
);

export const spectatorSubsessionIds = createEndpoint(
  "/data/season/spectator_subsessionids",
  {
    method: "GET",
    query: SeasonSpectatorSubsessionidsParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.season.getSeasonSpectatorSubsessionIds(query);
  },
);

export const spectatorSubsessionIdsDetail = createEndpoint(
  "/data/season/spectator_subsessionids_detail",
  {
    method: "GET",
    query: SeasonSpectatorSubsessionidsDetailParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.season.getSeasonSpectatorSubsessionIdsDetail(query);
  },
);
