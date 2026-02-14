import { createEndpoint } from "../utils";

export const getDoc = createEndpoint(
  "/data/doc",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getDocs();
  },
);

// Service docs
export const getCarClassDocs = createEndpoint(
  "/data/doc/carclass",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getCarClassDocs();
  },
);

export const getCarDocs = createEndpoint(
  "/data/doc/car",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getCarDocs();
  },
);

export const getConstantsDocs = createEndpoint(
  "/data/doc/constants",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getConstantsDocs();
  },
);

export const getDriverStatsByCategoryDocs = createEndpoint(
  "/data/doc/driver_stats_by_category",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getDriverStatsByCategoryDocs();
  },
);

export const getHostedDocs = createEndpoint(
  "/data/doc/hosted",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getHostedDocs();
  },
);

export const getLeagueDocs = createEndpoint(
  "/data/doc/league",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueDocs();
  },
);

export const getLookupDocs = createEndpoint(
  "/data/doc/lookup",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLookupDocs();
  },
);

export const getMemberDocs = createEndpoint(
  "/data/doc/member",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getMemberDocs();
  },
);

export const getResultsDocs = createEndpoint(
  "/data/doc/results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getResultsDocs();
  },
);

export const getSeasonDocs = createEndpoint(
  "/data/doc/season",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeasonDocs();
  },
);

export const getSeriesDocs = createEndpoint(
  "/data/doc/series",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeriesDocs();
  },
);

export const getStatsDocs = createEndpoint(
  "/data/doc/stats",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsDocs();
  },
);

export const getTeamDocs = createEndpoint(
  "/data/doc/team",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getTeamDocs();
  },
);

export const getTimeAttackDocs = createEndpoint(
  "/data/doc/time_attack",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getTimeAttackDocs();
  },
);

export const getTrackDocs = createEndpoint(
  "/data/doc/track",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getTrackDocs();
  },
);

// Service method docs (one-level deeper)
export const getCarClassGetDocs = createEndpoint(
  "/data/doc/carclass/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getCarClassGetDocs();
  },
);

export const getCarAssetsDocs = createEndpoint(
  "/data/doc/car/assets",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getCarAssetsDocs();
  },
);

export const getCarGetDocs = createEndpoint(
  "/data/doc/car/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getCarGetDocs();
  },
);

export const getConstantsCategoriesDocs = createEndpoint(
  "/data/doc/constants/categories",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getConstantsCategoriesDocs();
  },
);

export const getConstantsDivisionsDocs = createEndpoint(
  "/data/doc/constants/divisions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getConstantsDivisionsDocs();
  },
);

export const getConstantsEventTypesDocs = createEndpoint(
  "/data/doc/constants/event_types",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getConstantsEventTypesDocs();
  },
);

export const getDriverStatsByCategoryCategoryDocs = createEndpoint(
  "/data/doc/driver_stats_by_category/{category}",
  { method: "GET" },
  async ({ context: { iracing }, params }) => {
    return await iracing.doc.getDriverStatsByCategoryCategoryDocs({
      category: params?.category,
    });
  },
);

export const getHostedCombinedSessionsDocs = createEndpoint(
  "/data/doc/hosted/combined_sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getHostedCombinedSessionsDocs();
  },
);

export const getHostedSessionsDocs = createEndpoint(
  "/data/doc/hosted/sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getHostedSessionsDocs();
  },
);

export const getLeagueCustomerLeagueSessionsDocs = createEndpoint(
  "/data/doc/league/cust_league_sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueCustomerLeagueSessionsDocs();
  },
);

export const getLeagueDirectoryDocs = createEndpoint(
  "/data/doc/league/directory",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueDirectoryDocs();
  },
);

export const getLeagueGetDocs = createEndpoint(
  "/data/doc/league/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueGetDocs();
  },
);

export const getLeagueGetPointsSystemsDocs = createEndpoint(
  "/data/doc/league/get_points_systems",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueGetPointsSystemsDocs();
  },
);

export const getLeagueMembershipDocs = createEndpoint(
  "/data/doc/league/membership",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueMembershipDocs();
  },
);

export const getLeagueRosterDocs = createEndpoint(
  "/data/doc/league/roster",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueRosterDocs();
  },
);

export const getLeagueSeasonsDocs = createEndpoint(
  "/data/doc/league/seasons",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueSeasonsDocs();
  },
);

export const getLeagueSeasonStandingsDocs = createEndpoint(
  "/data/doc/league/season_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueSeasonStandingsDocs();
  },
);

export const getLeagueSeasonSessionsDocs = createEndpoint(
  "/data/doc/league/season_sessions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLeagueSeasonSessionsDocs();
  },
);

export const getLookupCountriesDocs = createEndpoint(
  "/data/doc/lookup/countries",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLookupCountriesDocs();
  },
);

export const getLookupDriversDocs = createEndpoint(
  "/data/doc/lookup/drivers",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLookupDriversDocs();
  },
);

export const getLookupFlairsDocs = createEndpoint(
  "/data/doc/lookup/flairs",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLookupFlairsDocs();
  },
);

export const getLookupGetDocs = createEndpoint(
  "/data/doc/lookup/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLookupGetDocs();
  },
);

export const getLookupLicensesDocs = createEndpoint(
  "/data/doc/lookup/licenses",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getLookupLicensesDocs();
  },
);

export const getMemberAwardsDocs = createEndpoint(
  "/data/doc/member/awards",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getMemberAwardsDocs();
  },
);

export const getMemberAwardInstancesDocs = createEndpoint(
  "/data/doc/member/award_instances",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getMemberAwardInstancesDocs();
  },
);

export const getMemberChartDataDocs = createEndpoint(
  "/data/doc/member/chart_data",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getMemberChartDataDocs();
  },
);

export const getMemberGetDocs = createEndpoint(
  "/data/doc/member/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getMemberGetDocs();
  },
);

export const getMemberInfoDocs = createEndpoint(
  "/data/doc/member/info",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getMemberInfoDocs();
  },
);

export const getMemberParticipationCreditsDocs = createEndpoint(
  "/data/doc/member/participation_credits",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getMemberParticipationCreditsDocs();
  },
);

export const getMemberProfileDocs = createEndpoint(
  "/data/doc/member/profile",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getMemberProfileDocs();
  },
);

export const getResultsGetDocs = createEndpoint(
  "/data/doc/results/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getResultsGetDocs();
  },
);

export const getResultsEventLogDocs = createEndpoint(
  "/data/doc/results/event_log",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getResultsEventLogDocs();
  },
);

export const getResultsLapChartDataDocs = createEndpoint(
  "/data/doc/results/lap_chart_data",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getResultsLapChartDataDocs();
  },
);

export const getResultsLapDataDocs = createEndpoint(
  "/data/doc/results/lap_data",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getResultsLapDataDocs();
  },
);

export const getResultsSearchHostedDocs = createEndpoint(
  "/data/doc/results/search_hosted",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getResultsSearchHostedDocs();
  },
);

export const getResultsSearchSeriesDocs = createEndpoint(
  "/data/doc/results/search_series",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getResultsSearchSeriesDocs();
  },
);

export const getResultsSeasonResultsDocs = createEndpoint(
  "/data/doc/results/season_results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getResultsSeasonResultsDocs();
  },
);

export const getSeasonListDocs = createEndpoint(
  "/data/doc/season/list",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeasonListDocs();
  },
);

export const getSeasonRaceGuideDocs = createEndpoint(
  "/data/doc/season/race_guide",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeasonRaceGuideDocs();
  },
);

export const getSeasonSpectatorSubsessionIdsDocs = createEndpoint(
  "/data/doc/season/spectator_subsessionids",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeasonSpectatorSubsessionIdsDocs();
  },
);

export const getSeasonSpectatorSubsessionIdsDetailDocs = createEndpoint(
  "/data/doc/season/spectator_subsessionids_detail",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeasonSpectatorSubsessionIdsDetailDocs();
  },
);

export const getSeriesAssetsDocs = createEndpoint(
  "/data/doc/series/assets",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeriesAssetsDocs();
  },
);

export const getSeriesGetDocs = createEndpoint(
  "/data/doc/series/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeriesGetDocs();
  },
);

export const getSeriesPastSeasonsDocs = createEndpoint(
  "/data/doc/series/past_seasons",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeriesPastSeasonsDocs();
  },
);

export const getSeriesSeasonsDocs = createEndpoint(
  "/data/doc/series/seasons",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeriesSeasonsDocs();
  },
);

export const getSeriesSeasonListDocs = createEndpoint(
  "/data/doc/series/season_list",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeriesSeasonListDocs();
  },
);

export const getSeriesSeasonScheduleDocs = createEndpoint(
  "/data/doc/series/season_schedule",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeriesSeasonScheduleDocs();
  },
);

export const getSeriesStatsSeriesDocs = createEndpoint(
  "/data/doc/series/stats_series",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getSeriesStatsSeriesDocs();
  },
);

export const getStatsMemberBestsDocs = createEndpoint(
  "/data/doc/stats/member_bests",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsMemberBestsDocs();
  },
);

export const getStatsMemberCareerDocs = createEndpoint(
  "/data/doc/stats/member_career",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsMemberCareerDocs();
  },
);

export const getStatsMemberDivisionDocs = createEndpoint(
  "/data/doc/stats/member_division",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsMemberDivisionDocs();
  },
);

export const getStatsMemberRecapDocs = createEndpoint(
  "/data/doc/stats/member_recap",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsMemberRecapDocs();
  },
);

export const getStatsMemberRecentRacesDocs = createEndpoint(
  "/data/doc/stats/member_recent_races",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsMemberRecentRacesDocs();
  },
);

export const getStatsMemberSummaryDocs = createEndpoint(
  "/data/doc/stats/member_summary",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsMemberSummaryDocs();
  },
);

export const getStatsMemberYearlyDocs = createEndpoint(
  "/data/doc/stats/member_yearly",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsMemberYearlyDocs();
  },
);

export const getStatsSeasonDriverStandingsDocs = createEndpoint(
  "/data/doc/stats/season_driver_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsSeasonDriverStandingsDocs();
  },
);

export const getStatsSeasonSupersessionStandingsDocs = createEndpoint(
  "/data/doc/stats/season_supersession_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsSeasonSupersessionStandingsDocs();
  },
);

export const getStatsSeasonTeamStandingsDocs = createEndpoint(
  "/data/doc/stats/season_team_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsSeasonTeamStandingsDocs();
  },
);

export const getStatsSeasonTTStandingsDocs = createEndpoint(
  "/data/doc/stats/season_tt_standings",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsSeasonTTStandingsDocs();
  },
);

export const getStatsSeasonTTResultsDocs = createEndpoint(
  "/data/doc/stats/season_tt_results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsSeasonTTResultsDocs();
  },
);

export const getStatsSeasonQualifyResultsDocs = createEndpoint(
  "/data/doc/stats/season_qualify_results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsSeasonQualifyResultsDocs();
  },
);

export const getStatsWorldRecordsDocs = createEndpoint(
  "/data/doc/stats/world_records",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getStatsWorldRecordsDocs();
  },
);

export const getTeamGetDocs = createEndpoint(
  "/data/doc/team/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getTeamGetDocs();
  },
);

export const getTeamMembershipDocs = createEndpoint(
  "/data/doc/team/membership",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getTeamMembershipDocs();
  },
);

export const getTimeAttackMemberSeasonResultsDocs = createEndpoint(
  "/data/doc/time_attack/member_season_results",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getTimeAttackMemberSeasonResultsDocs();
  },
);

export const getTrackAssetsDocs = createEndpoint(
  "/data/doc/track/assets",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getTrackAssetsDocs();
  },
);

export const getTrackGetDocs = createEndpoint(
  "/data/doc/track/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return await iracing.doc.getTrackGetDocs();
  },
);
