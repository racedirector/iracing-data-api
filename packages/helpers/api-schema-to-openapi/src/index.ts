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
      "/data/doc/hosted": {
        get: {
          operationId: "getHostedDocs",
          tags: ["doc", "hosted"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/hosted/combined_sessions": {
        get: {
          operationId: "getHostedCombinedSessionsDocs",
          tags: ["doc", "hosted"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/hosted/sessions": {
        get: {
          operationId: "getHostedSessionsDocs",
          tags: ["doc", "hosted"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league": {
        get: {
          operationId: "getLeagueDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/cust_league_sessions": {
        get: {
          operationId: "getLeagueCustomerLeagueSessionsDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/directory": {
        get: {
          operationId: "getLeagueDirectoryDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/get": {
        get: {
          operationId: "getLeagueGetDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/get_points_systems": {
        get: {
          operationId: "getLeagueGetPointsSystemsDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/membership": {
        get: {
          operationId: "getLeagueMembershipDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/roster": {
        get: {
          operationId: "getLeagueRosterDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/seasons": {
        get: {
          operationId: "getLeagueSeasonsDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/season_standings": {
        get: {
          operationId: "getLeagueSeasonStandingsDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/league/season_sessions": {
        get: {
          operationId: "getLeagueSeasonSessionsDocs",
          tags: ["doc", "league"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup": {
        get: {
          operationId: "getLookupDocs",
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/countries": {
        get: {
          operationId: "getLookupCountriesDocs",
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/drivers": {
        get: {
          operationId: "getLookupDriversDocs",
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/flairs": {
        get: {
          operationId: "getLookupFlairsDocs",
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/get": {
        get: {
          operationId: "getLookupGetDocs",
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/lookup/licenses": {
        get: {
          operationId: "getLookupLicensesDocs",
          tags: ["doc", "lookup"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member": {
        get: {
          operationId: "getMemberDocs",
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/awards": {
        get: {
          operationId: "getMemberAwardsDocs",
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/award_instances": {
        get: {
          operationId: "getMemberAwardInstancesDocs",
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/chart_data": {
        get: {
          operationId: "getMemberChartDataDocs",
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/get": {
        get: {
          operationId: "getMemberGetDocs",
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/info": {
        get: {
          operationId: "getMemberInfoDocs",
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/participation_credits": {
        get: {
          operationId: "getMemberParticipationCreditsDocs",
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/member/profile": {
        get: {
          operationId: "getMemberProfileDocs",
          tags: ["doc", "member"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results": {
        get: {
          operationId: "getResultsDocs",
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/get": {
        get: {
          operationId: "getResultsGetDocs",
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/event_log": {
        get: {
          operationId: "getResultsEventLogDocs",
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/lap_chart_data": {
        get: {
          operationId: "getResultsLapChartDataDocs",
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/lap_data": {
        get: {
          operationId: "getResultsLapDataDocs",
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/search_hosted": {
        get: {
          operationId: "getResultsSearchHostedDocs",
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/search_series": {
        get: {
          operationId: "getResultsSearchSeriesDocs",
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/results/season_results": {
        get: {
          operationId: "getResultsSeasonResultsDocs",
          tags: ["doc", "results"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season": {
        get: {
          operationId: "getSeasonDocs",
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/list": {
        get: {
          operationId: "getSeasonListDocs",
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/race_guide": {
        get: {
          operationId: "getSeasonRaceGuideDocs",
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/spectator_subsessionids": {
        get: {
          operationId: "getSeasonSpectatorSubsessionIdsDocs",
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/season/spectator_subsessionids_detail": {
        get: {
          operationId: "getSeasonSpectatorSubsessionIdsDetailDocs",
          tags: ["doc", "season"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series": {
        get: {
          operationId: "getSeriesDocs",
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/assets": {
        get: {
          operationId: "getSeriesAssetsDocs",
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/get": {
        get: {
          operationId: "getSeriesGetDocs",
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/past_seasons": {
        get: {
          operationId: "getSeriesPastSeasonsDocs",
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/seasons": {
        get: {
          operationId: "getSeriesSeasonsDocs",
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/season_list": {
        get: {
          operationId: "getSeriesSeasonListDocs",
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/season_schedule": {
        get: {
          operationId: "getSeriesSeasonScheduleDocs",
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/series/stats_series": {
        get: {
          operationId: "getSeriesStatsSeriesDocs",
          tags: ["doc", "series"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats": {
        get: {
          operationId: "getStatsDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_bests": {
        get: {
          operationId: "getStatsMemberBestsDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_career": {
        get: {
          operationId: "getStatsMemberCareerDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_division": {
        get: {
          operationId: "getStatsMemberDivisionDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_recap": {
        get: {
          operationId: "getStatsMemberRecapDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_recent_races": {
        get: {
          operationId: "getStatsMemberRecentRacesDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_summary": {
        get: {
          operationId: "getStatsMemberSummaryDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/member_yearly": {
        get: {
          operationId: "getStatsMemberYearlyDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_driver_standings": {
        get: {
          operationId: "getStatsSeasonDriverStandingsDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_supersession_standings": {
        get: {
          operationId: "getStatsSeasonSupersessionStandingsDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_team_standings": {
        get: {
          operationId: "getStatsSeasonTeamStandingsDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_tt_standings": {
        get: {
          operationId: "getStatsSeasonTTStandingsDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_tt_results": {
        get: {
          operationId: "getStatsSeasonTTResultsDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/season_qualify_results": {
        get: {
          operationId: "getStatsSeasonQualifyResultsDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/stats/world_records": {
        get: {
          operationId: "getStatsWorldRecordsDocs",
          tags: ["doc", "stats"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/team": {
        get: {
          operationId: "getTeamDocs",
          tags: ["doc", "team"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/team/get": {
        get: {
          operationId: "getTeamGetDocs",
          tags: ["doc", "team"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/team/membership": {
        get: {
          operationId: "getTeamMembershipDocs",
          tags: ["doc", "team"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/time_attack": {
        get: {
          operationId: "getTimeAttackDocs",
          tags: ["doc", "time_attack"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/time_attack/member_season_results": {
        get: {
          operationId: "getTimeAttackMemberSeasonResultsDocs",
          tags: ["doc", "time_attack"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/track": {
        get: {
          operationId: "getTrackDocs",
          tags: ["doc", "track"],
          responses: {
            200: { $ref: "#/components/responses/ServiceDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/track/assets": {
        get: {
          operationId: "getTrackAssetsDocs",
          tags: ["doc", "track"],
          responses: {
            200: { $ref: "#/components/responses/ServiceMethodDocs" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/data/doc/track/get": {
        get: {
          operationId: "getTrackGetDocs",
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
          externalDocs: {
            url: "/data/doc/carclass/get",
          },
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
          externalDocs: {
            url: "/data/doc/car/assets",
          },
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
          externalDocs: {
            url: "/data/doc/car/get",
          },
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
          externalDocs: {
            url: "/data/doc/constants/categories",
          },
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
          externalDocs: {
            url: "/data/doc/constants/divisions",
          },
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
          externalDocs: {
            url: "/data/doc/constants/event_types",
          },
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
          externalDocs: {
            url: "/data/doc/driver_stats_by_category/{category}",
          },
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
          externalDocs: {
            url: "/data/doc/hosted/combined_sessions",
          },
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
          externalDocs: {
            url: "/data/doc/hosted/sessions",
          },
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
          externalDocs: {
            url: "/data/doc/league/cust_league_sessions",
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
          externalDocs: {
            url: "/data/doc/league/directory",
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
          externalDocs: {
            url: "/data/doc/league/get",
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
          externalDocs: {
            url: "/data/doc/league/get_points_systems",
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
          externalDocs: {
            url: "/data/doc/league/membership",
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
          externalDocs: {
            url: "/data/doc/league/roster",
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
          externalDocs: {
            url: "/data/doc/league/seasons",
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
          externalDocs: {
            url: "/data/doc/league/season_standings",
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
          externalDocs: {
            url: "/data/doc/league/season_sessions",
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
          externalDocs: {
            url: "/data/doc/lookup/countries",
          },
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
          externalDocs: {
            url: "/data/doc/lookup/flairs",
          },
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
          externalDocs: {
            url: "/data/doc/lookup/licenses",
          },
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
          externalDocs: {
            url: "/data/doc/lookup/drivers",
          },
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
          externalDocs: {
            url: "/data/doc/lookup/get",
          },
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
          externalDocs: {
            url: "/data/doc/member/awards",
          },
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
          externalDocs: {
            url: "/data/doc/member/award_instances",
          },
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
          externalDocs: {
            url: "/data/doc/member/chart_data",
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
          externalDocs: {
            url: "/data/doc/member/info",
          },
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
          externalDocs: {
            url: "/data/doc/member/participation_credits",
          },
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
          externalDocs: {
            url: "/data/doc/member/profile",
          },
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
          externalDocs: {
            url: "/data/doc/results/get",
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
          externalDocs: {
            url: "/data/doc/results/event_log",
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
          externalDocs: {
            url: "/data/doc/results/lap_chart_data",
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
          externalDocs: {
            url: "/data/doc/results/lap_data",
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
          externalDocs: {
            url: "/data/doc/results/search_hosted",
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
          externalDocs: {
            url: "/data/doc/results/search_series",
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
          externalDocs: {
            url: "/data/doc/results/season_results",
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
          externalDocs: {
            url: "/data/doc/season/list",
          },
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
          externalDocs: {
            url: "/data/doc/season/race_guide",
          },
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
          externalDocs: {
            url: "/data/doc/series/assets",
          },
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
          externalDocs: {
            url: "/data/doc/series/get",
          },
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
          externalDocs: {
            url: "/data/doc/series/past_seasons",
          },
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
          externalDocs: {
            url: "/data/doc/series/seasons",
          },
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
          externalDocs: {
            url: "/data/doc/series/season_list",
          },
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
          externalDocs: {
            url: "/data/doc/series/season_schedule",
          },
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
          externalDocs: {
            url: "/data/doc/series/stats_series",
          },
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
          externalDocs: {
            url: "/data/doc/stats/member_bests",
          },
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
          externalDocs: {
            url: "/data/doc/stats/member_career",
          },
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
          externalDocs: {
            url: "/data/doc/stats/member_division",
          },
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
          externalDocs: {
            url: "/data/doc/stats/member_recap",
          },
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
          externalDocs: {
            url: "/data/doc/stats/member_recent_races",
          },
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
          externalDocs: {
            url: "/data/doc/stats/member_summary",
          },
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
          externalDocs: {
            url: "/data/doc/stats/member_yearly",
          },
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
          externalDocs: {
            url: "/data/doc/stats/season_driver_standings",
          },
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
          externalDocs: {
            url: "/data/doc/stats/season_supersession_standings",
          },
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
          externalDocs: {
            url: "/data/doc/stats/season_team_standings",
          },
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
          externalDocs: {
            url: "/data/doc/stats/season_time_trial_standings",
          },
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
          externalDocs: {
            url: "/data/doc/stats/season_time_trial_results",
          },
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
          externalDocs: {
            url: "/data/doc/stats/season_qualify_results",
          },
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
          externalDocs: {
            url: "/data/doc/stats/world_records",
          },
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
          externalDocs: {
            url: "/data/doc/team/get",
          },
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
          externalDocs: {
            url: "/data/doc/team/membership",
          },
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
          externalDocs: {
            url: "/data/doc/time_attack/member_season_results",
          },
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
          externalDocs: {
            url: "/data/doc/track/assets",
          },
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
          externalDocs: {
            url: "/data/doc/track/get",
          },
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
