import {
  EventType,
  IRacingAPIResponse,
  NetworkClientProvider,
} from "../../types";

export class SeasonAPI extends NetworkClientProvider {
  list({
    seasonYear,
    seasonQuarter,
  }: {
    seasonYear: number;
    seasonQuarter: number;
  }) {
    return this.client.get<IRacingAPIResponse>("/data/season/list", {
      params: { season_year: seasonYear, season_quarter: seasonQuarter },
    });
  }

  raceGuide({
    from,
    includeEndAfterFrom,
  }: {
    from?: Date;
    includeEndAfterFrom?: boolean;
  }) {
    return this.client.get<IRacingAPIResponse>("/data/season/race_guide", {
      params: { from, include_end_after_from: includeEndAfterFrom },
    });
  }

  spectatorSubsessionIds({ eventTypes }: { eventTypes?: EventType[] }) {
    return this.client.get<IRacingAPIResponse>(
      "/data/season/spectator_subsessionids",
      {
        params: { event_types: eventTypes },
      }
    );
  }

  spectatorSubsessionIdsDetail({
    eventTypes,
    seasonIds,
  }: {
    eventTypes?: EventType[];
    seasonIds?: number[];
  }) {
    return this.client.get<IRacingAPIResponse>(
      "/data/season/spectator_subsessionids_detail",
      {
        params: { event_types: eventTypes, season_ids: seasonIds },
      }
    );
  }
}

export default SeasonAPI;
