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
  IRacingServiceDocsResponseSchema,
  IRacingServiceMethodDocsResponseSchema,
  IRacingServicesDocsResponseSchema,
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
    externalDocs: {
      url: "/data/doc",
      description:
        "Find more information on available services here. Requires authentication.",
    },
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
        Docs: {
          description: "Success",
          content: {
            "application/json": { schema: IRacingServicesDocsResponseSchema },
          },
        },
        ServiceDocs: {
          description: "Success",
          content: {
            "application/json": { schema: IRacingServiceDocsResponseSchema },
          },
        },
        ServiceMethodDocs: {
          description: "Success",
          content: {
            "application/json": {
              schema: IRacingServiceMethodDocsResponseSchema,
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
              schema: IRacingErrorResponseSchema,
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
          operationId: "getDocs",
          tags: ["doc"],
          responses: {
            200: { $ref: "#/components/responses/Docs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/carclass": {
        get: {
          operationId: "getCarClassDocs",
          tags: ["doc", "carclass"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/carclass/get": {
        get: {
          operationId: "getCarClassGetDocs",
          tags: ["doc", "carclass"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/car": {
        get: {
          operationId: "getCarDocs",
          tags: ["doc", "car"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/car/assets": {
        get: {
          operationId: "getCarAssetsDocs",
          tags: ["doc", "car"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/car/get": {
        get: {
          operationId: "getCarGetDocs",
          tags: ["doc", "car"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/constants": {
        get: {
          operationId: "getConstantsDocs",
          tags: ["doc", "constants"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/constants/categories": {
        get: {
          operationId: "getConstantsCategoriesDocs",
          tags: ["doc", "constants"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/constants/divisions": {
        get: {
          operationId: "getConstantsDivisionsDocs",
          tags: ["doc", "constants"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/constants/event_types": {
        get: {
          operationId: "getConstantsEventTypesDocs",
          tags: ["doc", "constants"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category": {
        get: {
          operationId: "getDriverStatsByCategoryDocs",
          tags: ["doc", "driver_stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/{category}": {
        get: {
          operationId: "getDriverStatsByCategoryCategoryDocs",
          tags: ["doc", "driver_stats"],
          requestParams: {
            path: IRacingDriverStatsByCategoryPathSchema,
          },
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/oval": {
        get: {
          tags: ["doc", "driver_stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/sports_car": {
        get: {
          tags: ["doc", "driver_stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/formula_car": {
        get: {
          tags: ["doc", "driver_stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/road": {
        get: {
          tags: ["doc", "driver_stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/dirt_oval": {
        get: {
          tags: ["doc", "driver_stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/driver_stats_by_category/dirt_road": {
        get: {
          tags: ["doc", "driver_stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/hosted": {
        get: {
          tags: ["doc", "hosted"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/hosted/combined_sessions": {
        get: {
          tags: ["doc", "hosted"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/hosted/sessions": {
        get: {
          tags: ["doc", "hosted"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/cust_league_sessions": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/directory": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/get": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/get_points_systems": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/membership": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/roster": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/seasons": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/season_standings": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/season_sessions": {
        get: {
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup": {
        get: {
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/countries": {
        get: {
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/drivers": {
        get: {
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/flairs": {
        get: {
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/get": {
        get: {
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/licenses": {
        get: {
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member": {
        get: {
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/awards": {
        get: {
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/award_instances": {
        get: {
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/chart_data": {
        get: {
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/get": {
        get: {
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/info": {
        get: {
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/participation_credits": {
        get: {
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/profile": {
        get: {
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results": {
        get: {
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/get": {
        get: {
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/event_log": {
        get: {
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/lap_chart_data": {
        get: {
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/lap_data": {
        get: {
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/search_hosted": {
        get: {
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/search_series": {
        get: {
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/season_results": {
        get: {
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season": {
        get: {
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/list": {
        get: {
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/race_guide": {
        get: {
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/spectator_subsessionids": {
        get: {
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/spectator_subsessionids_detail": {
        get: {
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series": {
        get: {
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/assets": {
        get: {
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/get": {
        get: {
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/past_seasons": {
        get: {
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/seasons": {
        get: {
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/season_list": {
        get: {
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/season_schedule": {
        get: {
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/stats_series": {
        get: {
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_bests": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_career": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_division": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_recap": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_recent_races": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_summary": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_yearly": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_driver_standings": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_supersession_standings": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_team_standings": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_tt_standings": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_tt_results": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_qualify_results": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/world_records": {
        get: {
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/team": {
        get: {
          tags: ["doc", "team"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/team/get": {
        get: {
          tags: ["doc", "team"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/team/membership": {
        get: {
          tags: ["doc", "team"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/time_attack": {
        get: {
          tags: ["doc", "time_attack"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/time_attack/member_season_results": {
        get: {
          tags: ["doc", "time_attack"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/track": {
        get: {
          tags: ["doc", "track"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/track/assets": {
        get: {
          tags: ["doc", "track"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/track/get": {
        get: {
          tags: ["doc", "track"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
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
          operationId: "getCarAssets",
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
          operationId: "getCar",
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
          operationId: "getConstantsCategories",
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
          operationId: "getConstantsDivisions",
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
          operationId: "getConstantsEventTypes",
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
          operationId: "getDriverStatsByCategory",
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
          operationId: "getHostedCombinedSessions",
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
          operationId: "getHostedSessions",
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
          operationId: "getLeagueCustomerLeagueSessions",
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
          operationId: "getLeagueDirectory",
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
          operationId: "getLeague",
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
          operationId: "getLeaguePointsSystems",
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
          operationId: "getLeagueMembership",
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
          operationId: "getLeagueRoster",
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
          operationId: "getLeagueSeasons",
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
          operationId: "getLeagueSeasonStandings",
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
          operationId: "getLeagueSeasonSessions",
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
          operationId: "getLookupCountries",
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
          operationId: "getLookupFlairs",
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
          operationId: "getLookupLicenses",
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
          operationId: "getLookupDrivers",
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
          operationId: "getLookup",
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
          operationId: "getMemberAwards",
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
          operationId: "getMemberAwardInstances",
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
          operationId: "getMemberChartData",
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
          operationId: "getMember",
          tags: ["member"],
          externalDocs: {
            url: "/data/doc/member/get",
          },
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
          operationId: "getMemberInfo",
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
          operationId: "getMemberParticipationCredits",
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
          operationId: "getMemberProfile",
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
          operationId: "getResults",
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
          operationId: "getResultsEventLog",
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
          operationId: "getResultsLapChartData",
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
          operationId: "getResultsLapData",
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
          operationId: "getResultsSearchHosted",
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
          operationId: "getResultsSearchSeries",
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
          operationId: "getResultsSeasonResults",
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
          operationId: "getSeasonList",
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
          operationId: "getSeasonRaceGuide",
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
          operationId: "getSeriesAssets",
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
          operationId: "getSeries",
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
          operationId: "getSeriesPastSeasons",
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
          operationId: "getSeriesSeasons",
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
          operationId: "getSeriesSeasonList",
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
          operationId: "getSeriesSeasonSchedule",
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
          operationId: "getSeriesStatsSeries",
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
          operationId: "getStatsMemberBests",
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
          operationId: "getStatsMemberCareer",
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
          operationId: "getStatsMemberDivision",
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
          operationId: "getStatsMemberRecap",
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
          operationId: "getStatsMemberRecentRaces",
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
          operationId: "getStatsMemberSummary",
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
          operationId: "getStatsMemberYearly",
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
          operationId: "getStatsSeasonDriverStandings",
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
          operationId: "getStatsSeasonSupersessionStandings",
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
          operationId: "getStatsSeasonTeamStandings",
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
          operationId: "getStatsSeasonTimeTrialStandings",
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
          operationId: "getStatsSeasonTimeTrialResults",
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
          operationId: "getStatsSeasonQualifyResults",
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
          operationId: "getStatsWorldRecords",
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
          operationId: "getTeam",
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
          operationId: "getTeamMembership",
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
          operationId: "getTimeAttackMemberSeasonResults",
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
          operationId: "getTrackAssets",
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
          operationId: "getTrack",
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
