import { createEndpoint } from "../utils";

export const getDoc = createEndpoint(
  "/data/doc",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getDocs();
    return response.data;
  }
);

// Service docs
export const getCarClassDocs = createEndpoint(
  "/data/doc/carclass",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getCarClassDocs();
    return response.data;
  }
);

export const getCarDocs = createEndpoint(
  "/data/doc/car",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getCarDocs();
    return response.data;
  }
);

export const getConstantsDocs = createEndpoint(
  "/data/doc/constants",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getConstantsDocs();
    return response.data;
  }
);

export const getDriverStatsByCategoryDocs = createEndpoint(
  "/data/doc/driver_stats_by_category",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getDriverStatsByCategoryDocs();
    return response.data;
  }
);

export const getHostedDocs = createEndpoint(
  "/data/doc/hosted",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getHostedDocs();
    return response.data;
  }
);

export const getLeagueDocs = createEndpoint(
  "/data/doc/league",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueDocs();
    return response.data;
  }
);

export const getLookupDocs = createEndpoint(
  "/data/doc/lookup",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLookupDocs();
    return response.data;
  }
);

export const getMemberDocs = createEndpoint(
  "/data/doc/member",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getMemberDocs();
    return response.data;
  }
);

export const getResultsDocs = createEndpoint(
  "/data/doc/results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getResultsDocs();
    return response.data;
  }
);

export const getSeasonDocs = createEndpoint(
  "/data/doc/season",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeasonDocs();
    return response.data;
  }
);

export const getSeriesDocs = createEndpoint(
  "/data/doc/series",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeriesDocs();
    return response.data;
  }
);

export const getStatsDocs = createEndpoint(
  "/data/doc/stats",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsDocs();
    return response.data;
  }
);

export const getTeamDocs = createEndpoint(
  "/data/doc/team",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getTeamDocs();
    return response.data;
  }
);

export const getTimeAttackDocs = createEndpoint(
  "/data/doc/time_attack",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getTimeAttackDocs();
    return response.data;
  }
);

export const getTrackDocs = createEndpoint(
  "/data/doc/track",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getTrackDocs();
    return response.data;
  }
);

// Service method docs (one-level deeper)
export const getCarClassGetDocs = createEndpoint(
  "/data/doc/carclass/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getCarClassGetDocs();
    return response.data;
  }
);

export const getCarAssetsDocs = createEndpoint(
  "/data/doc/car/assets",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getCarAssetsDocs();
    return response.data;
  }
);

export const getCarGetDocs = createEndpoint(
  "/data/doc/car/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getCarGetDocs();
    return response.data;
  }
);

export const getConstantsCategoriesDocs = createEndpoint(
  "/data/doc/constants/categories",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getConstantsCategoriesDocs();
    return response.data;
  }
);

export const getConstantsDivisionsDocs = createEndpoint(
  "/data/doc/constants/divisions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getConstantsDivisionsDocs();
    return response.data;
  }
);

export const getConstantsEventTypesDocs = createEndpoint(
  "/data/doc/constants/event_types",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getConstantsEventTypesDocs();
    return response.data;
  }
);

export const getDriverStatsByCategoryCategoryDocs = createEndpoint(
  "/data/doc/driver_stats_by_category/{category}",
  { method: "GET" },
  async ({ context: { iracing }, params }) => {
    const response = await iracing.doc.getDriverStatsByCategoryCategoryDocs({
      category: params?.category,
    });
    return response.data;
  }
);

export const getHostedCombinedSessionsDocs = createEndpoint(
  "/data/doc/hosted/combined_sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getHostedCombinedSessionsDocs();
    return response.data;
  }
);

export const getHostedSessionsDocs = createEndpoint(
  "/data/doc/hosted/sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getHostedSessionsDocs();
    return response.data;
  }
);

export const getLeagueCustomerLeagueSessionsDocs = createEndpoint(
  "/data/doc/league/cust_league_sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueCustomerLeagueSessionsDocs();
    return response.data;
  }
);

export const getLeagueDirectoryDocs = createEndpoint(
  "/data/doc/league/directory",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueDirectoryDocs();
    return response.data;
  }
);

export const getLeagueGetDocs = createEndpoint(
  "/data/doc/league/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueGetDocs();
    return response.data;
  }
);

export const getLeagueGetPointsSystemsDocs = createEndpoint(
  "/data/doc/league/get_points_systems",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueGetPointsSystemsDocs();
    return response.data;
  }
);

export const getLeagueMembershipDocs = createEndpoint(
  "/data/doc/league/membership",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueMembershipDocs();
    return response.data;
  }
);

export const getLeagueRosterDocs = createEndpoint(
  "/data/doc/league/roster",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueRosterDocs();
    return response.data;
  }
);

export const getLeagueSeasonsDocs = createEndpoint(
  "/data/doc/league/seasons",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueSeasonsDocs();
    return response.data;
  }
);

export const getLeagueSeasonStandingsDocs = createEndpoint(
  "/data/doc/league/season_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueSeasonStandingsDocs();
    return response.data;
  }
);

export const getLeagueSeasonSessionsDocs = createEndpoint(
  "/data/doc/league/season_sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLeagueSeasonSessionsDocs();
    return response.data;
  }
);

export const getLookupCountriesDocs = createEndpoint(
  "/data/doc/lookup/countries",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLookupCountriesDocs();
    return response.data;
  }
);

export const getLookupDriversDocs = createEndpoint(
  "/data/doc/lookup/drivers",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLookupDriversDocs();
    return response.data;
  }
);

export const getLookupFlairsDocs = createEndpoint(
  "/data/doc/lookup/flairs",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLookupFlairsDocs();
    return response.data;
  }
);

export const getLookupGetDocs = createEndpoint(
  "/data/doc/lookup/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLookupGetDocs();
    return response.data;
  }
);

export const getLookupLicensesDocs = createEndpoint(
  "/data/doc/lookup/licenses",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getLookupLicensesDocs();
    return response.data;
  }
);

export const getMemberAwardsDocs = createEndpoint(
  "/data/doc/member/awards",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getMemberAwardsDocs();
    return response.data;
  }
);

export const getMemberAwardInstancesDocs = createEndpoint(
  "/data/doc/member/award_instances",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getMemberAwardInstancesDocs();
    return response.data;
  }
);

export const getMemberChartDataDocs = createEndpoint(
  "/data/doc/member/chart_data",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getMemberChartDataDocs();
    return response.data;
  }
);

export const getMemberGetDocs = createEndpoint(
  "/data/doc/member/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getMemberGetDocs();
    return response.data;
  }
);

export const getMemberInfoDocs = createEndpoint(
  "/data/doc/member/info",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getMemberInfoDocs();
    return response.data;
  }
);

export const getMemberParticipationCreditsDocs = createEndpoint(
  "/data/doc/member/participation_credits",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getMemberParticipationCreditsDocs();
    return response.data;
  }
);

export const getMemberProfileDocs = createEndpoint(
  "/data/doc/member/profile",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getMemberProfileDocs();
    return response.data;
  }
);

export const getResultsGetDocs = createEndpoint(
  "/data/doc/results/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getResultsGetDocs();
    return response.data;
  }
);

export const getResultsEventLogDocs = createEndpoint(
  "/data/doc/results/event_log",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getResultsEventLogDocs();
    return response.data;
  }
);

export const getResultsLapChartDataDocs = createEndpoint(
  "/data/doc/results/lap_chart_data",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getResultsLapChartDataDocs();
    return response.data;
  }
);

export const getResultsLapDataDocs = createEndpoint(
  "/data/doc/results/lap_data",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getResultsLapDataDocs();
    return response.data;
  }
);

export const getResultsSearchHostedDocs = createEndpoint(
  "/data/doc/results/search_hosted",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getResultsSearchHostedDocs();
    return response.data;
  }
);

export const getResultsSearchSeriesDocs = createEndpoint(
  "/data/doc/results/search_series",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getResultsSearchSeriesDocs();
    return response.data;
  }
);

export const getResultsSeasonResultsDocs = createEndpoint(
  "/data/doc/results/season_results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getResultsSeasonResultsDocs();
    return response.data;
  }
);

export const getSeasonListDocs = createEndpoint(
  "/data/doc/season/list",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeasonListDocs();
    return response.data;
  }
);

export const getSeasonRaceGuideDocs = createEndpoint(
  "/data/doc/season/race_guide",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeasonRaceGuideDocs();
    return response.data;
  }
);

export const getSeasonSpectatorSubsessionIdsDocs = createEndpoint(
  "/data/doc/season/spectator_subsessionids",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeasonSpectatorSubsessionIdsDocs();
    return response.data;
  }
);

export const getSeasonSpectatorSubsessionIdsDetailDocs = createEndpoint(
  "/data/doc/season/spectator_subsessionids_detail",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response =
      await iracing.doc.getSeasonSpectatorSubsessionIdsDetailDocs();
    return response.data;
  }
);

export const getSeriesAssetsDocs = createEndpoint(
  "/data/doc/series/assets",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeriesAssetsDocs();
    return response.data;
  }
);

export const getSeriesGetDocs = createEndpoint(
  "/data/doc/series/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeriesGetDocs();
    return response.data;
  }
);

export const getSeriesPastSeasonsDocs = createEndpoint(
  "/data/doc/series/past_seasons",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeriesPastSeasonsDocs();
    return response.data;
  }
);

export const getSeriesSeasonsDocs = createEndpoint(
  "/data/doc/series/seasons",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeriesSeasonsDocs();
    return response.data;
  }
);

export const getSeriesSeasonListDocs = createEndpoint(
  "/data/doc/series/season_list",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeriesSeasonListDocs();
    return response.data;
  }
);

export const getSeriesSeasonScheduleDocs = createEndpoint(
  "/data/doc/series/season_schedule",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeriesSeasonScheduleDocs();
    return response.data;
  }
);

export const getSeriesStatsSeriesDocs = createEndpoint(
  "/data/doc/series/stats_series",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getSeriesStatsSeriesDocs();
    return response.data;
  }
);

export const getStatsMemberBestsDocs = createEndpoint(
  "/data/doc/stats/member_bests",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsMemberBestsDocs();
    return response.data;
  }
);

export const getStatsMemberCareerDocs = createEndpoint(
  "/data/doc/stats/member_career",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsMemberCareerDocs();
    return response.data;
  }
);

export const getStatsMemberDivisionDocs = createEndpoint(
  "/data/doc/stats/member_division",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsMemberDivisionDocs();
    return response.data;
  }
);

export const getStatsMemberRecapDocs = createEndpoint(
  "/data/doc/stats/member_recap",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsMemberRecapDocs();
    return response.data;
  }
);

export const getStatsMemberRecentRacesDocs = createEndpoint(
  "/data/doc/stats/member_recent_races",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsMemberRecentRacesDocs();
    return response.data;
  }
);

export const getStatsMemberSummaryDocs = createEndpoint(
  "/data/doc/stats/member_summary",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsMemberSummaryDocs();
    return response.data;
  }
);

export const getStatsMemberYearlyDocs = createEndpoint(
  "/data/doc/stats/member_yearly",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsMemberYearlyDocs();
    return response.data;
  }
);

export const getStatsSeasonDriverStandingsDocs = createEndpoint(
  "/data/doc/stats/season_driver_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsSeasonDriverStandingsDocs();
    return response.data;
  }
);

export const getStatsSeasonSupersessionStandingsDocs = createEndpoint(
  "/data/doc/stats/season_supersession_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response =
      await iracing.doc.getStatsSeasonSupersessionStandingsDocs();
    return response.data;
  }
);

export const getStatsSeasonTeamStandingsDocs = createEndpoint(
  "/data/doc/stats/season_team_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsSeasonTeamStandingsDocs();
    return response.data;
  }
);

export const getStatsSeasonTTStandingsDocs = createEndpoint(
  "/data/doc/stats/season_tt_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsSeasonTTStandingsDocs();
    return response.data;
  }
);

export const getStatsSeasonTTResultsDocs = createEndpoint(
  "/data/doc/stats/season_tt_results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsSeasonTTResultsDocs();
    return response.data;
  }
);

export const getStatsSeasonQualifyResultsDocs = createEndpoint(
  "/data/doc/stats/season_qualify_results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsSeasonQualifyResultsDocs();
    return response.data;
  }
);

export const getStatsWorldRecordsDocs = createEndpoint(
  "/data/doc/stats/world_records",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getStatsWorldRecordsDocs();
    return response.data;
  }
);

export const getTeamGetDocs = createEndpoint(
  "/data/doc/team/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getTeamGetDocs();
    return response.data;
  }
);

export const getTeamMembershipDocs = createEndpoint(
  "/data/doc/team/membership",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getTeamMembershipDocs();
    return response.data;
  }
);

export const getTimeAttackMemberSeasonResultsDocs = createEndpoint(
  "/data/doc/time_attack/member_season_results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getTimeAttackMemberSeasonResultsDocs();
    return response.data;
  }
);

export const getTrackAssetsDocs = createEndpoint(
  "/data/doc/track/assets",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getTrackAssetsDocs();
    return response.data;
  }
);

export const getTrackGetDocs = createEndpoint(
  "/data/doc/track/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getTrackGetDocs();
    return response.data;
  }
);
