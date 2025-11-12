import {
  CarApi,
  CarclassApi,
  Configuration,
  ConstantsApi,
  DocApi,
  DriverStatsApi,
  HostedApi,
  LeagueApi,
  LookupApi,
  MemberApi,
  ResultsApi,
  SeasonApi,
  SeriesApi,
  StatsApi,
  TeamApi,
  TimeAttackApi,
  TrackApi,
} from "@iracing-data/api-client";
import { createMiddleware } from "better-call";

/**
 * ???: Should this handle token refreshing?
 */
export const iracingClientMiddleware = createMiddleware(
  {
    requireHeaders: true,
    metadata: {
      openapi: {
        parameters: [
          {
            in: "header",
            name: "X-IRACING-ACCESS-TOKEN",
            schema: {
              type: "string",
            },
            required: true,
            description: "The JWT token to sign the request with.",
          },
        ],
      },
    },
  },
  async ({ getHeader }) => {
    const accessToken = getHeader("X-IRACING-ACCESS-TOKEN");
    const config = new Configuration({ accessToken: accessToken || undefined });

    return {
      iracing: {
        car: new CarApi(config),
        carClass: new CarclassApi(config),
        constants: new ConstantsApi(config),
        doc: new DocApi(config),
        driverStats: new DriverStatsApi(config),
        hosted: new HostedApi(config),
        league: new LeagueApi(config),
        lookup: new LookupApi(config),
        member: new MemberApi(config),
        results: new ResultsApi(config),
        season: new SeasonApi(config),
        series: new SeriesApi(config),
        stats: new StatsApi(config),
        team: new TeamApi(config),
        timeAttack: new TimeAttackApi(config),
        track: new TrackApi(config),
      },
    };
  }
);
