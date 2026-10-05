import {
  CommaSeparatedNumberString,
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

// Decode HTTP CSV at the boundary; the client receives the typed array values.
const csvNumbers = CommaSeparatedNumberString.transform((value) =>
  value.split(",").map(Number),
);
const spectatorQuery = SeasonSpectatorSubsessionidsParametersSchema.extend({
  event_types: csvNumbers
    .pipe(
      SeasonSpectatorSubsessionidsParametersSchema.shape.event_types.unwrap(),
    )
    .optional(),
});
const spectatorDetailQuery =
  SeasonSpectatorSubsessionidsDetailParametersSchema.extend({
    event_types: spectatorQuery.shape.event_types,
    season_ids: csvNumbers
      .pipe(
        SeasonSpectatorSubsessionidsDetailParametersSchema.shape.season_ids.unwrap(),
      )
      .optional(),
  });

export const spectatorSubsessionIds = createEndpoint(
  "/data/season/spectator_subsessionids",
  {
    method: "GET",
    query: spectatorQuery,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.season.getSeasonSpectatorSubsessionIds(query);
  },
);

export const spectatorSubsessionIdsDetail = createEndpoint(
  "/data/season/spectator_subsessionids_detail",
  {
    method: "GET",
    query: spectatorDetailQuery,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.season.getSeasonSpectatorSubsessionIdsDetail(query);
  },
);
