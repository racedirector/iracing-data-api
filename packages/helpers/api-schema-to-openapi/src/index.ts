import fs from "node:fs";
import path from "node:path";
import {
  IRacingAPIResponseSchema,
  IRacingDriverStatsByCategoryPathSchema,
  IRacingErrorResponseSchema,
  IRacingHostedCombinedSessionsParametersSchema,
  IRacingLeagueCustomerSessionsParametersSchema,
  IRacingLeagueDirectoryParametersSchema,
  IRacingLeagueGetParametersSchema,
  IRacingLeagueGetPointsSystemsParametersSchema,
  IRacingLeagueMembershipParametersSchema,
  IRacingLeagueRosterParametersSchema,
  IRacingLeagueSeasonSessionsParametersSchema,
  IRacingLeagueSeasonsParametersSchema,
  IRacingLeagueSeasonStandingsParametersSchema,
  IRacingLookupDriversParametersSchema,
  IRacingMaintenanceResponseSchema,
  IRacingMemberAwardInstancesParametersSchema,
  IRacingMemberAwardsParametersSchema,
  IRacingMemberChartDataParametersSchema,
  IRacingMemberGetParametersSchema,
  IRacingMemberProfileParametersSchema,
  IRacingRateLimitHeadersSchema,
  IRacingRateLimitLimitHeaderSchema,
  IRacingRateLimitRemainingHeaderSchema,
  IRacingRateLimitResetHeaderSchema,
  IRacingResultsEventLogParametersSchema,
  IRacingResultsGetParametersSchema,
  IRacingResultsLapChartDataParametersSchema,
  IRacingResultsLapDataParametersSchema,
  IRacingResultsSearchHostedParametersSchema,
  IRacingResultsSearchSeriesParametersSchema,
  IRacingResultsSeasonResultsParametersSchema,
  IRacingSeasonListParametersSchema,
  IRacingSeasonRaceGuideParametersSchema,
  IRacingSeriesPastSeasonsParametersSchema,
  IRacingSeriesSeasonListParametersSchema,
  IRacingSeriesSeasonScheduleParametersSchema,
  IRacingSeriesSeasonsParametersSchema,
  IRacingStatsMemberBestsParametersSchema,
  IRacingStatsMemberCareerParametersSchema,
  IRacingStatsMemberDivisionParametersSchema,
  IRacingStatsMemberRecapParametersSchema,
  IRacingStatsMemberRecentRacesParametersSchema,
  IRacingStatsMemberSummaryParametersSchema,
  IRacingStatsMemberYearlyParametersSchema,
  IRacingStatsSeasonDriverStandingsParametersSchema,
  IRacingStatsSeasonQualifyResultsParametersSchema,
  IRacingStatsSeasonSupersessionStandingsParametersSchema,
  IRacingStatsSeasonTeamStandingsParametersSchema,
  IRacingStatsSeasonTTResultsParametersSchema,
  IRacingStatsSeasonTTStandingsParametersSchema,
  IRacingStatsWorldRecordsParametersSchema,
  IRacingTeamGetParametersSchema,
  IRacingTimeAttackMemberSeasonResultsParametersSchema,
} from "@iracing-data/api-schema";
import { createDocument } from "zod-openapi";

export interface GenerateOpenAPISpecOptions {
  outputDir?: string;
  fileName?: string;
}

export async function generateOpenAPISpec({
  outputDir = __dirname,
  fileName = "openapi.json",
}: GenerateOpenAPISpecOptions) {
  const outputPath = path.join(outputDir, fileName);

  // Create the output dir if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const document = createDocument({
    openapi: "3.1.1",
    info: {
      title: "iRacing `/data` API",
      version: "0.0.1",
    },
    servers: [{ url: "https://members-ng.iracing.com/" }],
    components: {
      headers: {
        rateLimitLimit: IRacingRateLimitLimitHeaderSchema,
        rateLimitRemaining: IRacingRateLimitRemainingHeaderSchema,
        rateLimitReset: IRacingRateLimitResetHeaderSchema,
      },
      responses: {
        Success: {
          description: "Success",
          headers: IRacingRateLimitHeadersSchema,
          content: {
            "application/json": {
              schema: IRacingAPIResponseSchema,
            },
          },
        },
        RateLimited: {
          description: "Rate limited",
          headers: IRacingRateLimitHeadersSchema,
          content: {
            "application/json": {
              schema: IRacingErrorResponseSchema,
            },
          },
        },
        Maintenance: {
          description: "Maintenance",
          content: {
            "application/json": {
              schema: IRacingMaintenanceResponseSchema,
            },
          },
        },
        Unauthorized: {
          description: "Access token is missing or invalid.",
          content: {
            "application/json": {
              schema: IRacingErrorResponseSchema,
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authentication",
        },
        oAuth2: {
          type: "oauth2",
          description:
            "OAuth service for obtaining a JWT. For more information, see https://oauth.iracing.com/oauth2/book/introduction.html",
          flows: {
            authorizationCode: {
              authorizationUrl: "https://oauth.iracing.com/oauth2/authorize",
              tokenUrl: "https://oauth.iracing.com/oauth2/token",
              scopes: {
                "iracing.auth": "Authorization for iRacing services.",
                "iracing.profile": "Access to the iRacing profile.",
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "doc",
        description: "A documentation endpoint.",
      },
      {
        name: "car",
        description: "Car service endpoint.",
      },
      {
        name: "carclass",
        description: "Car class service endpoint.",
      },
      { name: "constants", description: "Constants service endpoint." },
      { name: "driver_stats", description: "Driver stats service endpoint." },
      { name: "hosted", description: "Hosted service endpoint." },
      { name: "league", description: "League service endpoint" },
      {
        name: "lookup",
        description:
          "Lookup endpoints for static reference data (countries, licenses, drivers, etc.)",
      },
      {
        name: "member",
        description:
          "Member profile and related endpoints (profile, awards, participation credits).",
      },
      {
        name: "results",
        description:
          "Race and session result endpoints (lap data, event logs, season results).",
      },
      {
        name: "season",
        description:
          "Season-related endpoints (season lists, race guides, schedules).",
      },
      {
        name: "series",
        description: "Series endpoints (series metadata, seasons, assets).",
      },
      {
        name: "stats",
        description:
          "Statistical endpoints and summaries for members and seasons.",
      },
      {
        name: "team",
        description: "Team endpoints (team details, membership).",
      },
      {
        name: "time_attack",
        description:
          "Time attack specific endpoints and member season results.",
      },
      { name: "track", description: "Track metadata and asset endpoints." },
    ],
    paths: {
      "/data/doc": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/carclass": {
        get: {
          tags: ["doc", "carclass"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/carclass/get": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/car": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/car/assets": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/car/get": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/constants": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/constants/categories": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/constants/divisions": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/constants/event_types": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/oval": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/sports_car": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/formula_car": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/road": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/dirt_oval": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/dirt_road": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/hosted": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/hosted/combined_sessions": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/hosted/sessions": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/cust_league_sessions": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/directory": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/get": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/get_points_systems": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/membership": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/roster": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/seasons": {
        get: {
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/season_standings": {
        get: {
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/season_sessions": {
        get: {
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/countries": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/drivers": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/flairs": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/get": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/licenses": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/awards": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/award_instances": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/chart_data": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/get": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/info": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/participation_credits": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/profile": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/get": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/event_log": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/lap_chart_data": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/lap_data": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/search_hosted": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/search_series": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/season_results": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/list": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/race_guide": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/spectator_subsessionids": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/spectator_subsessionids_detail": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/assets": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/get": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/past_seasons": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/seasons": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/season_list": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/season_schedule": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/stats_series": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_bests": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_career": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_division": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_recap": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_recent_races": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_summary": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_yearly": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_driver_standings": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_supersession_standings": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_team_standings": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_tt_standings": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_tt_results": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_qualify_results": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/world_records": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/team": {
        get: {
          tags: ["doc"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/team/get": {
        get: {
          tags: ["doc", "team"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/team/membership": {
        get: {
          tags: ["doc", "team"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/time_attack": {
        get: {
          tags: ["doc", "time_attack"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/time_attack/member_season_results": {
        get: {
          tags: ["doc", "time_attack"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/track": {
        get: {
          tags: ["doc", "track"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/track/assets": {
        get: {
          tags: ["doc", "track"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/track/get": {
        get: {
          tags: ["doc", "track"],
          responses: {
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/carclass/get": {
        get: {
          operationId: "getCarClass",
          summary: "Gets car classes.",
          tags: ["carclass"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/car/assets": {
        get: {
          description:
            "image paths are relative to https://images-static.iracing.com/",
          tags: ["car"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/car/get": {
        get: {
          tags: ["car"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/constants/categories": {
        get: {
          description: "Constant; returned directly as an array of objects",
          tags: ["constants"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/constants/divisions": {
        get: {
          description: "Constant; returned directly as an array of objects",
          tags: ["constants"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/constants/event_types": {
        get: {
          description: "Constant; returned directly as an array of objects",
          tags: ["constants"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/driver_stats_by_category/{category}": {
        get: {
          requestParams: {
            path: IRacingDriverStatsByCategoryPathSchema,
          },
          tags: ["driver_stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/hosted/combined_sessions": {
        get: {
          description:
            "Sessions that can be joined as a driver or spectator, and also includes non-league pending sessions for the user.",
          requestParams: {
            query: IRacingHostedCombinedSessionsParametersSchema,
          },
          tags: ["hosted"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/hosted/sessions": {
        get: {
          description:
            "Sessions that can be joined as a driver. Without spectator and non-league pending sessions for the user.",
          tags: ["hosted"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/league/cust_league_sessions": {
        get: {
          tags: ["league"],
          requestParams: {
            query: IRacingLeagueCustomerSessionsParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/league/directory": {
        get: {
          tags: ["league"],
          requestParams: {
            query: IRacingLeagueDirectoryParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/league/get": {
        get: {
          tags: ["league"],
          requestParams: {
            query: IRacingLeagueGetParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/league/get_points_systems": {
        get: {
          tags: ["league"],
          requestParams: {
            query: IRacingLeagueGetPointsSystemsParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/league/membership": {
        get: {
          tags: ["league"],
          requestParams: {
            query: IRacingLeagueMembershipParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/league/roster": {
        get: {
          tags: ["league"],
          requestParams: {
            query: IRacingLeagueRosterParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/league/seasons": {
        get: {
          tags: ["league"],
          requestParams: {
            query: IRacingLeagueSeasonsParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/league/season_standings": {
        get: {
          tags: ["league"],
          requestParams: {
            query: IRacingLeagueSeasonStandingsParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/league/season_sessions": {
        get: {
          tags: ["league"],
          requestParams: {
            query: IRacingLeagueSeasonSessionsParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/lookup/countries": {
        get: {
          tags: ["lookup"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/lookup/flairs": {
        get: {
          tags: ["lookup"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/lookup/licenses": {
        get: {
          tags: ["lookup"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/lookup/drivers": {
        get: {
          requestParams: {
            query: IRacingLookupDriversParametersSchema,
          },
          tags: ["lookup"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/lookup/get": {
        get: {
          // requestParams: {
          // query: z.record(z.string(), z.string()),
          // },
          tags: ["lookup"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/member/awards": {
        get: {
          requestParams: {
            query: IRacingMemberAwardsParametersSchema,
          },
          tags: ["member"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/member/award_instances": {
        get: {
          requestParams: {
            query: IRacingMemberAwardInstancesParametersSchema,
          },
          tags: ["member"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/member/chart_data": {
        get: {
          tags: ["member"],
          requestParams: {
            query: IRacingMemberChartDataParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/member/get": {
        get: {
          tags: ["member"],
          requestParams: {
            query: IRacingMemberGetParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/member/info": {
        get: {
          tags: ["member"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/member/participation_credits": {
        get: {
          tags: ["member"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/member/profile": {
        get: {
          operationId: "getProfile",
          summary: "Gets a requested user's profile.",
          requestParams: {
            query: IRacingMemberProfileParametersSchema,
          },
          tags: ["member"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/results/get": {
        get: {
          tags: ["results"],
          requestParams: {
            query: IRacingResultsGetParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/results/event_log": {
        get: {
          tags: ["results"],
          requestParams: {
            query: IRacingResultsEventLogParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/results/lap_chart_data": {
        get: {
          tags: ["results"],
          requestParams: {
            query: IRacingResultsLapChartDataParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/results/lap_data": {
        get: {
          tags: ["results"],
          requestParams: {
            query: IRacingResultsLapDataParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/results/search_hosted": {
        get: {
          tags: ["results"],
          requestParams: {
            query: IRacingResultsSearchHostedParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/results/search_series": {
        get: {
          tags: ["results"],
          requestParams: {
            query: IRacingResultsSearchSeriesParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/results/season_results": {
        get: {
          tags: ["results"],
          requestParams: {
            query: IRacingResultsSeasonResultsParametersSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/season/list": {
        get: {
          requestParams: {
            query: IRacingSeasonListParametersSchema,
          },
          tags: ["season"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/season/race_guide": {
        get: {
          requestParams: {
            query: IRacingSeasonRaceGuideParametersSchema,
          },
          tags: ["season"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/series/assets": {
        get: {
          tags: ["series"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/series/get": {
        get: {
          tags: ["series"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/series/past_seasons": {
        get: {
          requestParams: {
            query: IRacingSeriesPastSeasonsParametersSchema,
          },
          tags: ["series"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/series/seasons": {
        get: {
          requestParams: {
            query: IRacingSeriesSeasonsParametersSchema,
          },
          tags: ["series"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/series/season_list": {
        get: {
          requestParams: {
            query: IRacingSeriesSeasonListParametersSchema,
          },
          tags: ["series"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/series/season_schedule": {
        get: {
          requestParams: {
            query: IRacingSeriesSeasonScheduleParametersSchema,
          },
          tags: ["series"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/series/stats_series": {
        get: {
          tags: ["series"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/member_bests": {
        get: {
          requestParams: {
            query: IRacingStatsMemberBestsParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/member_career": {
        get: {
          requestParams: {
            query: IRacingStatsMemberCareerParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/member_division": {
        get: {
          requestParams: {
            query: IRacingStatsMemberDivisionParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/member_recap": {
        get: {
          requestParams: {
            query: IRacingStatsMemberRecapParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/member_recent_races": {
        get: {
          requestParams: {
            query: IRacingStatsMemberRecentRacesParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/member_summary": {
        get: {
          requestParams: {
            query: IRacingStatsMemberSummaryParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/member_yearly": {
        get: {
          requestParams: {
            query: IRacingStatsMemberYearlyParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/season_driver_standings": {
        get: {
          requestParams: {
            query: IRacingStatsSeasonDriverStandingsParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/season_supersession_standings": {
        get: {
          requestParams: {
            query: IRacingStatsSeasonSupersessionStandingsParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/season_team_standings": {
        get: {
          requestParams: {
            query: IRacingStatsSeasonTeamStandingsParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/season_time_trial_standings": {
        get: {
          requestParams: {
            query: IRacingStatsSeasonTTStandingsParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/season_time_trial_results": {
        get: {
          requestParams: {
            query: IRacingStatsSeasonTTResultsParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/season_qualify_results": {
        get: {
          requestParams: {
            query: IRacingStatsSeasonQualifyResultsParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/stats/world_records": {
        get: {
          requestParams: {
            query: IRacingStatsWorldRecordsParametersSchema,
          },
          tags: ["stats"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/team/get": {
        get: {
          requestParams: {
            query: IRacingTeamGetParametersSchema,
          },
          tags: ["team"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/team/membership": {
        get: {
          tags: ["team"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/time_attack/member_season_results": {
        get: {
          requestParams: {
            query: IRacingTimeAttackMemberSeasonResultsParametersSchema,
          },
          tags: ["time_attack"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/track/assets": {
        get: {
          tags: ["track"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
      "/data/track/get": {
        get: {
          tags: ["track"],
          responses: {
            200: { $ref: "#/components/responses/Success" },
            429: { $ref: "#/components/responses/RateLimited" },
            401: { $ref: "#/components/responses/Unauthorized" },
            503: { $ref: "#/components/responses/Maintenance" },
          },
        },
      },
    },
  });

  // Remove the existing file
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  // Write to file.
  console.log(`Writing to ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(document));
}
