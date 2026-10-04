import type { z } from "../../packages/oauth/schema/node_modules/zod";
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;
export type Pair0 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingAuthParametersSchema,
    typeof import("../../packages/api/schema/dist").AuthParametersSchema
  >
>;
export type input0 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingAuthParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").AuthParametersSchema
    >
  >
>;
export type output0 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingAuthParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").AuthParametersSchema
    >
  >
>;
export type Pair1 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingDriverStatsByCategoryPathSchema,
    typeof import("../../packages/api/schema/dist").DriverStatsByCategoryPathSchema
  >
>;
export type input1 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingDriverStatsByCategoryPathSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").DriverStatsByCategoryPathSchema
    >
  >
>;
export type output1 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingDriverStatsByCategoryPathSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").DriverStatsByCategoryPathSchema
    >
  >
>;
export type Pair2 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingHostedCombinedSessionsParametersSchema,
    typeof import("../../packages/api/schema/dist").HostedCombinedSessionsParametersSchema
  >
>;
export type input2 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingHostedCombinedSessionsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").HostedCombinedSessionsParametersSchema
    >
  >
>;
export type output2 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingHostedCombinedSessionsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").HostedCombinedSessionsParametersSchema
    >
  >
>;
export type Pair3 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueCustomerSessionsParametersSchema,
    typeof import("../../packages/api/schema/dist").LeagueCustomerSessionsParametersSchema
  >
>;
export type input3 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueCustomerSessionsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LeagueCustomerSessionsParametersSchema
    >
  >
>;
export type output3 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueCustomerSessionsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LeagueCustomerSessionsParametersSchema
    >
  >
>;
export type Pair4 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueDirectoryParametersSchema,
    typeof import("../../packages/api/schema/dist").LeagueDirectoryParametersSchema
  >
>;
export type input4 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueDirectoryParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LeagueDirectoryParametersSchema
    >
  >
>;
export type output4 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueDirectoryParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LeagueDirectoryParametersSchema
    >
  >
>;
export type Pair5 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueGetParametersSchema,
    typeof import("../../packages/api/schema/dist").LeagueGetParametersSchema
  >
>;
export type input5 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueGetParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LeagueGetParametersSchema
    >
  >
>;
export type output5 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueGetParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LeagueGetParametersSchema
    >
  >
>;
export type Pair6 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueGetPointsSystemsParametersSchema,
    typeof import("../../packages/api/schema/dist").LeagueGetPointsSystemsParametersSchema
  >
>;
export type input6 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueGetPointsSystemsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LeagueGetPointsSystemsParametersSchema
    >
  >
>;
export type output6 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueGetPointsSystemsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LeagueGetPointsSystemsParametersSchema
    >
  >
>;
export type Pair7 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueMembershipParametersSchema,
    typeof import("../../packages/api/schema/dist").LeagueMembershipParametersSchema
  >
>;
export type input7 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueMembershipParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LeagueMembershipParametersSchema
    >
  >
>;
export type output7 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueMembershipParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LeagueMembershipParametersSchema
    >
  >
>;
export type Pair8 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueRosterParametersSchema,
    typeof import("../../packages/api/schema/dist").LeagueRosterParametersSchema
  >
>;
export type input8 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueRosterParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LeagueRosterParametersSchema
    >
  >
>;
export type output8 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueRosterParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LeagueRosterParametersSchema
    >
  >
>;
export type Pair9 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonsParametersSchema,
    typeof import("../../packages/api/schema/dist").LeagueSeasonsParametersSchema
  >
>;
export type input9 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LeagueSeasonsParametersSchema
    >
  >
>;
export type output9 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LeagueSeasonsParametersSchema
    >
  >
>;
export type Pair10 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonStandingsParametersSchema,
    typeof import("../../packages/api/schema/dist").LeagueSeasonStandingsParametersSchema
  >
>;
export type input10 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonStandingsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LeagueSeasonStandingsParametersSchema
    >
  >
>;
export type output10 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonStandingsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LeagueSeasonStandingsParametersSchema
    >
  >
>;
export type Pair11 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonSessionsParametersSchema,
    typeof import("../../packages/api/schema/dist").LeagueSeasonSessionsParametersSchema
  >
>;
export type input11 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonSessionsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LeagueSeasonSessionsParametersSchema
    >
  >
>;
export type output11 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonSessionsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LeagueSeasonSessionsParametersSchema
    >
  >
>;
export type Pair12 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLookupDriversParametersSchema,
    typeof import("../../packages/api/schema/dist").LookupDriversParametersSchema
  >
>;
export type input12 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLookupDriversParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").LookupDriversParametersSchema
    >
  >
>;
export type output12 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingLookupDriversParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").LookupDriversParametersSchema
    >
  >
>;
export type Pair13 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberAwardsParametersSchema,
    typeof import("../../packages/api/schema/dist").MemberAwardsParametersSchema
  >
>;
export type input13 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberAwardsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").MemberAwardsParametersSchema
    >
  >
>;
export type output13 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberAwardsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").MemberAwardsParametersSchema
    >
  >
>;
export type Pair14 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberAwardInstancesParametersSchema,
    typeof import("../../packages/api/schema/dist").MemberAwardInstancesParametersSchema
  >
>;
export type input14 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberAwardInstancesParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").MemberAwardInstancesParametersSchema
    >
  >
>;
export type output14 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberAwardInstancesParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").MemberAwardInstancesParametersSchema
    >
  >
>;
export type Pair15 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberChartDataParametersSchema,
    typeof import("../../packages/api/schema/dist").MemberChartDataParametersSchema
  >
>;
export type input15 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberChartDataParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").MemberChartDataParametersSchema
    >
  >
>;
export type output15 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberChartDataParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").MemberChartDataParametersSchema
    >
  >
>;
export type Pair16 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberGetParametersSchema,
    typeof import("../../packages/api/schema/dist").MemberGetParametersSchema
  >
>;
export type input16 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberGetParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").MemberGetParametersSchema
    >
  >
>;
export type output16 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberGetParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").MemberGetParametersSchema
    >
  >
>;
export type Pair17 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberProfileParametersSchema,
    typeof import("../../packages/api/schema/dist").MemberProfileParametersSchema
  >
>;
export type input17 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberProfileParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").MemberProfileParametersSchema
    >
  >
>;
export type output17 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingMemberProfileParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").MemberProfileParametersSchema
    >
  >
>;
export type Pair18 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsGetParametersSchema,
    typeof import("../../packages/api/schema/dist").ResultsGetParametersSchema
  >
>;
export type input18 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsGetParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ResultsGetParametersSchema
    >
  >
>;
export type output18 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsGetParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ResultsGetParametersSchema
    >
  >
>;
export type Pair19 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsEventLogParametersSchema,
    typeof import("../../packages/api/schema/dist").ResultsEventLogParametersSchema
  >
>;
export type input19 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsEventLogParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ResultsEventLogParametersSchema
    >
  >
>;
export type output19 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsEventLogParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ResultsEventLogParametersSchema
    >
  >
>;
export type Pair20 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsLapChartDataParametersSchema,
    typeof import("../../packages/api/schema/dist").ResultsLapChartDataParametersSchema
  >
>;
export type input20 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsLapChartDataParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ResultsLapChartDataParametersSchema
    >
  >
>;
export type output20 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsLapChartDataParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ResultsLapChartDataParametersSchema
    >
  >
>;
export type Pair21 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsLapDataParametersSchema,
    typeof import("../../packages/api/schema/dist").ResultsLapDataParametersSchema
  >
>;
export type input21 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsLapDataParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ResultsLapDataParametersSchema
    >
  >
>;
export type output21 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsLapDataParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ResultsLapDataParametersSchema
    >
  >
>;
export type Pair22 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSearchHostedParametersSchema,
    typeof import("../../packages/api/schema/dist").ResultsSearchHostedParametersSchema
  >
>;
export type input22 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSearchHostedParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ResultsSearchHostedParametersSchema
    >
  >
>;
export type output22 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSearchHostedParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ResultsSearchHostedParametersSchema
    >
  >
>;
export type Pair23 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSearchSeriesParametersSchema,
    typeof import("../../packages/api/schema/dist").ResultsSearchSeriesParametersSchema
  >
>;
export type input23 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSearchSeriesParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ResultsSearchSeriesParametersSchema
    >
  >
>;
export type output23 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSearchSeriesParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ResultsSearchSeriesParametersSchema
    >
  >
>;
export type Pair24 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSeasonResultsParametersSchema,
    typeof import("../../packages/api/schema/dist").ResultsSeasonResultsParametersSchema
  >
>;
export type input24 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSeasonResultsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ResultsSeasonResultsParametersSchema
    >
  >
>;
export type output24 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSeasonResultsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ResultsSeasonResultsParametersSchema
    >
  >
>;
export type Pair25 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonListParametersSchema,
    typeof import("../../packages/api/schema/dist").SeasonListParametersSchema
  >
>;
export type input25 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonListParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").SeasonListParametersSchema
    >
  >
>;
export type output25 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonListParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").SeasonListParametersSchema
    >
  >
>;
export type Pair26 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonRaceGuideParametersSchema,
    typeof import("../../packages/api/schema/dist").SeasonRaceGuideParametersSchema
  >
>;
export type input26 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonRaceGuideParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").SeasonRaceGuideParametersSchema
    >
  >
>;
export type output26 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonRaceGuideParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").SeasonRaceGuideParametersSchema
    >
  >
>;
export type Pair27 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonSpectatorSubsessionidsParametersSchema,
    typeof import("../../packages/api/schema/dist").SeasonSpectatorSubsessionidsParametersSchema
  >
>;
export type input27 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonSpectatorSubsessionidsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").SeasonSpectatorSubsessionidsParametersSchema
    >
  >
>;
export type output27 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonSpectatorSubsessionidsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").SeasonSpectatorSubsessionidsParametersSchema
    >
  >
>;
export type Pair28 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonSpectatorSubsessionidsDetailParametersSchema,
    typeof import("../../packages/api/schema/dist").SeasonSpectatorSubsessionidsDetailParametersSchema
  >
>;
export type input28 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonSpectatorSubsessionidsDetailParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").SeasonSpectatorSubsessionidsDetailParametersSchema
    >
  >
>;
export type output28 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonSpectatorSubsessionidsDetailParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").SeasonSpectatorSubsessionidsDetailParametersSchema
    >
  >
>;
export type Pair29 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesPastSeasonsParametersSchema,
    typeof import("../../packages/api/schema/dist").SeriesPastSeasonsParametersSchema
  >
>;
export type input29 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesPastSeasonsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").SeriesPastSeasonsParametersSchema
    >
  >
>;
export type output29 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesPastSeasonsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").SeriesPastSeasonsParametersSchema
    >
  >
>;
export type Pair30 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonsParametersSchema,
    typeof import("../../packages/api/schema/dist").SeriesSeasonsParametersSchema
  >
>;
export type input30 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").SeriesSeasonsParametersSchema
    >
  >
>;
export type output30 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").SeriesSeasonsParametersSchema
    >
  >
>;
export type Pair31 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonListParametersSchema,
    typeof import("../../packages/api/schema/dist").SeriesSeasonListParametersSchema
  >
>;
export type input31 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonListParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").SeriesSeasonListParametersSchema
    >
  >
>;
export type output31 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonListParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").SeriesSeasonListParametersSchema
    >
  >
>;
export type Pair32 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonScheduleParametersSchema,
    typeof import("../../packages/api/schema/dist").SeriesSeasonScheduleParametersSchema
  >
>;
export type input32 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonScheduleParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").SeriesSeasonScheduleParametersSchema
    >
  >
>;
export type output32 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonScheduleParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").SeriesSeasonScheduleParametersSchema
    >
  >
>;
export type Pair33 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberBestsParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsMemberBestsParametersSchema
  >
>;
export type input33 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberBestsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsMemberBestsParametersSchema
    >
  >
>;
export type output33 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberBestsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsMemberBestsParametersSchema
    >
  >
>;
export type Pair34 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberCareerParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsMemberCareerParametersSchema
  >
>;
export type input34 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberCareerParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsMemberCareerParametersSchema
    >
  >
>;
export type output34 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberCareerParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsMemberCareerParametersSchema
    >
  >
>;
export type Pair35 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberDivisionParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsMemberDivisionParametersSchema
  >
>;
export type input35 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberDivisionParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsMemberDivisionParametersSchema
    >
  >
>;
export type output35 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberDivisionParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsMemberDivisionParametersSchema
    >
  >
>;
export type Pair36 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberRecapParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsMemberRecapParametersSchema
  >
>;
export type input36 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberRecapParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsMemberRecapParametersSchema
    >
  >
>;
export type output36 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberRecapParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsMemberRecapParametersSchema
    >
  >
>;
export type Pair37 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberRecentRacesParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsMemberRecentRacesParametersSchema
  >
>;
export type input37 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberRecentRacesParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsMemberRecentRacesParametersSchema
    >
  >
>;
export type output37 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberRecentRacesParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsMemberRecentRacesParametersSchema
    >
  >
>;
export type Pair38 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberSummaryParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsMemberSummaryParametersSchema
  >
>;
export type input38 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberSummaryParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsMemberSummaryParametersSchema
    >
  >
>;
export type output38 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberSummaryParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsMemberSummaryParametersSchema
    >
  >
>;
export type Pair39 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberYearlyParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsMemberYearlyParametersSchema
  >
>;
export type input39 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberYearlyParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsMemberYearlyParametersSchema
    >
  >
>;
export type output39 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberYearlyParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsMemberYearlyParametersSchema
    >
  >
>;
export type Pair40 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonDriverStandingsParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsSeasonDriverStandingsParametersSchema
  >
>;
export type input40 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonDriverStandingsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsSeasonDriverStandingsParametersSchema
    >
  >
>;
export type output40 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonDriverStandingsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsSeasonDriverStandingsParametersSchema
    >
  >
>;
export type Pair41 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonSupersessionStandingsParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsSeasonSupersessionStandingsParametersSchema
  >
>;
export type input41 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonSupersessionStandingsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsSeasonSupersessionStandingsParametersSchema
    >
  >
>;
export type output41 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonSupersessionStandingsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsSeasonSupersessionStandingsParametersSchema
    >
  >
>;
export type Pair42 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTeamStandingsParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsSeasonTeamStandingsParametersSchema
  >
>;
export type input42 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTeamStandingsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsSeasonTeamStandingsParametersSchema
    >
  >
>;
export type output42 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTeamStandingsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsSeasonTeamStandingsParametersSchema
    >
  >
>;
export type Pair43 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTTStandingsParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsSeasonTTStandingsParametersSchema
  >
>;
export type input43 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTTStandingsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsSeasonTTStandingsParametersSchema
    >
  >
>;
export type output43 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTTStandingsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsSeasonTTStandingsParametersSchema
    >
  >
>;
export type Pair44 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTTResultsParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsSeasonTTResultsParametersSchema
  >
>;
export type input44 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTTResultsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsSeasonTTResultsParametersSchema
    >
  >
>;
export type output44 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTTResultsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsSeasonTTResultsParametersSchema
    >
  >
>;
export type Pair45 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonQualifyResultsParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsSeasonQualifyResultsParametersSchema
  >
>;
export type input45 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonQualifyResultsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsSeasonQualifyResultsParametersSchema
    >
  >
>;
export type output45 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonQualifyResultsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsSeasonQualifyResultsParametersSchema
    >
  >
>;
export type Pair46 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsWorldRecordsParametersSchema,
    typeof import("../../packages/api/schema/dist").StatsWorldRecordsParametersSchema
  >
>;
export type input46 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsWorldRecordsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").StatsWorldRecordsParametersSchema
    >
  >
>;
export type output46 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingStatsWorldRecordsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").StatsWorldRecordsParametersSchema
    >
  >
>;
export type Pair47 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingTeamGetParametersSchema,
    typeof import("../../packages/api/schema/dist").TeamGetParametersSchema
  >
>;
export type input47 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingTeamGetParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").TeamGetParametersSchema
    >
  >
>;
export type output47 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingTeamGetParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").TeamGetParametersSchema
    >
  >
>;
export type Pair48 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/parameters").IRacingTimeAttackMemberSeasonResultsParametersSchema,
    typeof import("../../packages/api/schema/dist").TimeAttackMemberSeasonResultsParametersSchema
  >
>;
export type input48 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingTimeAttackMemberSeasonResultsParametersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").TimeAttackMemberSeasonResultsParametersSchema
    >
  >
>;
export type output48 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/parameters").IRacingTimeAttackMemberSeasonResultsParametersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").TimeAttackMemberSeasonResultsParametersSchema
    >
  >
>;
export type Pair49 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingDriverStatsByCategoryPath,
    import("../../packages/api/schema/dist").DriverStatsByCategoryPath
  >
>;
export type Pair50 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingHostedCombinedSessionsParameters,
    import("../../packages/api/schema/dist").HostedCombinedSessionsParameters
  >
>;
export type Pair51 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueCustomerSessionsParameters,
    import("../../packages/api/schema/dist").LeagueCustomerSessionsParameters
  >
>;
export type Pair52 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueDirectoryParameters,
    import("../../packages/api/schema/dist").LeagueDirectoryParameters
  >
>;
export type Pair53 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueGetParameters,
    import("../../packages/api/schema/dist").LeagueGetParameters
  >
>;
export type Pair54 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueGetPointsSystemsParameters,
    import("../../packages/api/schema/dist").LeagueGetPointsSystemsParameters
  >
>;
export type Pair55 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueMembershipParameters,
    import("../../packages/api/schema/dist").LeagueMembershipParameters
  >
>;
export type Pair56 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueRosterParameters,
    import("../../packages/api/schema/dist").LeagueRosterParameters
  >
>;
export type Pair57 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonsParameters,
    import("../../packages/api/schema/dist").LeagueSeasonsParameters
  >
>;
export type Pair58 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonStandingsParameters,
    import("../../packages/api/schema/dist").LeagueSeasonStandingsParameters
  >
>;
export type Pair59 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLeagueSeasonSessionsParameters,
    import("../../packages/api/schema/dist").LeagueSeasonSessionsParameters
  >
>;
export type Pair60 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingLookupDriversParameters,
    import("../../packages/api/schema/dist").LookupDriversParameters
  >
>;
export type Pair61 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingMemberAwardsParameters,
    import("../../packages/api/schema/dist").MemberAwardsParameters
  >
>;
export type Pair62 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingMemberAwardInstancesParameters,
    import("../../packages/api/schema/dist").MemberAwardInstancesParameters
  >
>;
export type Pair63 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingMemberChartDataParameters,
    import("../../packages/api/schema/dist").MemberChartDataParameters
  >
>;
export type Pair64 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingMemberGetParameters,
    import("../../packages/api/schema/dist").MemberGetParameters
  >
>;
export type Pair65 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingMemberProfileParameters,
    import("../../packages/api/schema/dist").MemberProfileParameters
  >
>;
export type Pair66 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingResultsGetParameters,
    import("../../packages/api/schema/dist").ResultsGetParameters
  >
>;
export type Pair67 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingResultsEventLogParameters,
    import("../../packages/api/schema/dist").ResultsEventLogParameters
  >
>;
export type Pair68 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingResultsLapChartDataParameters,
    import("../../packages/api/schema/dist").ResultsLapChartDataParameters
  >
>;
export type Pair69 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingResultsLapDataParameters,
    import("../../packages/api/schema/dist").ResultsLapDataParameters
  >
>;
export type Pair70 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSearchHostedParameters,
    import("../../packages/api/schema/dist").ResultsSearchHostedParameters
  >
>;
export type Pair71 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSearchSeriesParameters,
    import("../../packages/api/schema/dist").ResultsSearchSeriesParameters
  >
>;
export type Pair72 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingResultsSeasonResultsParameters,
    import("../../packages/api/schema/dist").ResultsSeasonResultsParameters
  >
>;
export type Pair73 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonListParameters,
    import("../../packages/api/schema/dist").SeasonListParameters
  >
>;
export type Pair74 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonRaceGuideParameters,
    import("../../packages/api/schema/dist").SeasonRaceGuideParameters
  >
>;
export type Pair75 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonSpectatorSubsessionidsParameters,
    import("../../packages/api/schema/dist").SeasonSpectatorSubsessionidsParameters
  >
>;
export type Pair76 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingSeasonSpectatorSubsessionidsDetailParameters,
    import("../../packages/api/schema/dist").SeasonSpectatorSubsessionidsDetailParameters
  >
>;
export type Pair77 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesPastSeasonsParameters,
    import("../../packages/api/schema/dist").SeriesPastSeasonsParameters
  >
>;
export type Pair78 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonsParameters,
    import("../../packages/api/schema/dist").SeriesSeasonsParameters
  >
>;
export type Pair79 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonListParameters,
    import("../../packages/api/schema/dist").SeriesSeasonListParameters
  >
>;
export type Pair80 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingSeriesSeasonScheduleParameters,
    import("../../packages/api/schema/dist").SeriesSeasonScheduleParameters
  >
>;
export type Pair81 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberBestsParameters,
    import("../../packages/api/schema/dist").StatsMemberBestsParameters
  >
>;
export type Pair82 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberCareerParameters,
    import("../../packages/api/schema/dist").StatsMemberCareerParameters
  >
>;
export type Pair83 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberDivisionParameters,
    import("../../packages/api/schema/dist").StatsMemberDivisionParameters
  >
>;
export type Pair84 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberRecapParameters,
    import("../../packages/api/schema/dist").StatsMemberRecapParameters
  >
>;
export type Pair85 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberRecentRacesParameters,
    import("../../packages/api/schema/dist").StatsMemberRecentRacesParameters
  >
>;
export type Pair86 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberSummaryParameters,
    import("../../packages/api/schema/dist").StatsMemberSummaryParameters
  >
>;
export type Pair87 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsMemberYearlyParameters,
    import("../../packages/api/schema/dist").StatsMemberYearlyParameters
  >
>;
export type Pair88 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonDriverStandingsParameters,
    import("../../packages/api/schema/dist").StatsSeasonDriverStandingsParameters
  >
>;
export type Pair89 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonSupersessionStandingsParameters,
    import("../../packages/api/schema/dist").StatsSeasonSupersessionStandingsParameters
  >
>;
export type Pair90 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTeamStandingsParameters,
    import("../../packages/api/schema/dist").StatsSeasonTeamStandingsParameters
  >
>;
export type Pair91 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTTStandingsParameters,
    import("../../packages/api/schema/dist").StatsSeasonTTStandingsParameters
  >
>;
export type Pair92 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonTTResultsParameters,
    import("../../packages/api/schema/dist").StatsSeasonTTResultsParameters
  >
>;
export type Pair93 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsSeasonQualifyResultsParameters,
    import("../../packages/api/schema/dist").StatsSeasonQualifyResultsParameters
  >
>;
export type Pair94 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingStatsWorldRecordsParameters,
    import("../../packages/api/schema/dist").StatsWorldRecordsParameters
  >
>;
export type Pair95 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingTeamGetParameters,
    import("../../packages/api/schema/dist").TeamGetParameters
  >
>;
export type Pair96 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/parameters").IRacingTimeAttackMemberSeasonResultsParameters,
    import("../../packages/api/schema/dist").TimeAttackMemberSeasonResultsParameters
  >
>;
export type Pair97 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingAccessTokenSchema,
    typeof import("../../packages/api/schema/dist").AccessTokenSchema
  >
>;
export type input97 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingAccessTokenSchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").AccessTokenSchema>
  >
>;
export type output97 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingAccessTokenSchema
    >,
    z.output<typeof import("../../packages/api/schema/dist").AccessTokenSchema>
  >
>;
export type Pair98 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitLimitHeaderKey,
    typeof import("../../packages/api/schema/dist").RateLimitLimitHeaderKey
  >
>;
export type Pair99 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitLimitHeaderSchema,
    typeof import("../../packages/api/schema/dist").RateLimitLimitHeaderSchema
  >
>;
export type input99 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitLimitHeaderSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").RateLimitLimitHeaderSchema
    >
  >
>;
export type output99 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitLimitHeaderSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").RateLimitLimitHeaderSchema
    >
  >
>;
export type Pair100 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitRemainingHeaderKey,
    typeof import("../../packages/api/schema/dist").RateLimitRemainingHeaderKey
  >
>;
export type Pair101 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitRemainingHeaderSchema,
    typeof import("../../packages/api/schema/dist").RateLimitRemainingHeaderSchema
  >
>;
export type input101 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitRemainingHeaderSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").RateLimitRemainingHeaderSchema
    >
  >
>;
export type output101 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitRemainingHeaderSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").RateLimitRemainingHeaderSchema
    >
  >
>;
export type Pair102 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitResetHeaderKey,
    typeof import("../../packages/api/schema/dist").RateLimitResetHeaderKey
  >
>;
export type Pair103 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitResetHeaderSchema,
    typeof import("../../packages/api/schema/dist").RateLimitResetHeaderSchema
  >
>;
export type input103 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitResetHeaderSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").RateLimitResetHeaderSchema
    >
  >
>;
export type output103 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitResetHeaderSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").RateLimitResetHeaderSchema
    >
  >
>;
export type Pair104 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitHeadersSchema,
    typeof import("../../packages/api/schema/dist").RateLimitHeadersSchema
  >
>;
export type input104 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitHeadersSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").RateLimitHeadersSchema
    >
  >
>;
export type output104 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitHeadersSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").RateLimitHeadersSchema
    >
  >
>;
export type Pair105 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCustomerIdSchema,
    typeof import("../../packages/api/schema/dist").CustomerIdSchema
  >
>;
export type input105 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCustomerIdSchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").CustomerIdSchema>
  >
>;
export type output105 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCustomerIdSchema
    >,
    z.output<typeof import("../../packages/api/schema/dist").CustomerIdSchema>
  >
>;
export type Pair106 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypePracticeSchema,
    typeof import("../../packages/api/schema/dist").EventTypePracticeSchema
  >
>;
export type input106 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypePracticeSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").EventTypePracticeSchema
    >
  >
>;
export type output106 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypePracticeSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").EventTypePracticeSchema
    >
  >
>;
export type Pair107 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeQualifyingSchema,
    typeof import("../../packages/api/schema/dist").EventTypeQualifyingSchema
  >
>;
export type input107 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeQualifyingSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").EventTypeQualifyingSchema
    >
  >
>;
export type output107 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeQualifyingSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").EventTypeQualifyingSchema
    >
  >
>;
export type Pair108 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeTimeTrialSchema,
    typeof import("../../packages/api/schema/dist").EventTypeTimeTrialSchema
  >
>;
export type input108 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeTimeTrialSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").EventTypeTimeTrialSchema
    >
  >
>;
export type output108 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeTimeTrialSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").EventTypeTimeTrialSchema
    >
  >
>;
export type Pair109 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeRaceSchema,
    typeof import("../../packages/api/schema/dist").EventTypeRaceSchema
  >
>;
export type input109 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeRaceSchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").EventTypeRaceSchema>
  >
>;
export type output109 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeRaceSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").EventTypeRaceSchema
    >
  >
>;
export type Pair110 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeSchema,
    typeof import("../../packages/api/schema/dist").EventTypeSchema
  >
>;
export type input110 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeSchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").EventTypeSchema>
  >
>;
export type output110 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeSchema
    >,
    z.output<typeof import("../../packages/api/schema/dist").EventTypeSchema>
  >
>;
export type Pair111 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingChartTypeSchema,
    typeof import("../../packages/api/schema/dist").ChartTypeSchema
  >
>;
export type input111 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingChartTypeSchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").ChartTypeSchema>
  >
>;
export type output111 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingChartTypeSchema
    >,
    z.output<typeof import("../../packages/api/schema/dist").ChartTypeSchema>
  >
>;
export type Pair112 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingChartTypeParameterSchema,
    typeof import("../../packages/api/schema/dist").ChartTypeParameterSchema
  >
>;
export type input112 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingChartTypeParameterSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ChartTypeParameterSchema
    >
  >
>;
export type output112 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingChartTypeParameterSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ChartTypeParameterSchema
    >
  >
>;
export type Pair113 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCategorySchema,
    typeof import("../../packages/api/schema/dist").CategorySchema
  >
>;
export type input113 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCategorySchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").CategorySchema>
  >
>;
export type output113 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCategorySchema
    >,
    z.output<typeof import("../../packages/api/schema/dist").CategorySchema>
  >
>;
export type Pair114 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCategoryIdSchema,
    typeof import("../../packages/api/schema/dist").CategoryIdSchema
  >
>;
export type input114 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCategoryIdSchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").CategoryIdSchema>
  >
>;
export type output114 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCategoryIdSchema
    >,
    z.output<typeof import("../../packages/api/schema/dist").CategoryIdSchema>
  >
>;
export type Pair115 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCategoryIdParameterSchema,
    typeof import("../../packages/api/schema/dist").CategoryIdParameterSchema
  >
>;
export type input115 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCategoryIdParameterSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").CategoryIdParameterSchema
    >
  >
>;
export type output115 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingCategoryIdParameterSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").CategoryIdParameterSchema
    >
  >
>;
export type Pair116 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/primitives").IRacingDivisionSchema,
    typeof import("../../packages/api/schema/dist").DivisionSchema
  >
>;
export type input116 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingDivisionSchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").DivisionSchema>
  >
>;
export type output116 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/primitives").IRacingDivisionSchema
    >,
    z.output<typeof import("../../packages/api/schema/dist").DivisionSchema>
  >
>;
export type Pair117 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingAccessToken,
    import("../../packages/api/schema/dist").AccessToken
  >
>;
export type Pair118 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitLimitHeader,
    import("../../packages/api/schema/dist").RateLimitLimitHeader
  >
>;
export type Pair119 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitRemainingHeader,
    import("../../packages/api/schema/dist").RateLimitRemainingHeader
  >
>;
export type Pair120 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitResetHeader,
    import("../../packages/api/schema/dist").RateLimitResetHeader
  >
>;
export type Pair121 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingRateLimitHeaders,
    import("../../packages/api/schema/dist").RateLimitHeaders
  >
>;
export type Pair122 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingCustomerId,
    import("../../packages/api/schema/dist").CustomerId
  >
>;
export type Pair123 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingCategory,
    import("../../packages/api/schema/dist").Category
  >
>;
export type Pair124 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingDivision,
    import("../../packages/api/schema/dist").Division
  >
>;
export type Pair125 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypePractice,
    import("../../packages/api/schema/dist").EventTypePractice
  >
>;
export type Pair126 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeQualifying,
    import("../../packages/api/schema/dist").EventTypeQualifying
  >
>;
export type Pair127 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeTimeTrial,
    import("../../packages/api/schema/dist").EventTypeTimeTrial
  >
>;
export type Pair128 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingEventTypeRace,
    import("../../packages/api/schema/dist").EventTypeRace
  >
>;
export type Pair129 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingEventType,
    import("../../packages/api/schema/dist").EventType
  >
>;
export type Pair130 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/primitives").IRacingChartType,
    import("../../packages/api/schema/dist").ChartType
  >
>;
export type Pair131 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingErrorResponseSchema,
    typeof import("../../packages/api/schema/dist").ErrorResponseSchema
  >
>;
export type input131 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingErrorResponseSchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").ErrorResponseSchema>
  >
>;
export type output131 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingErrorResponseSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ErrorResponseSchema
    >
  >
>;
export type Pair132 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingAPIResponseSchema,
    typeof import("../../packages/api/schema/dist").APIResponseSchema
  >
>;
export type input132 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingAPIResponseSchema
    >,
    z.input<typeof import("../../packages/api/schema/dist").APIResponseSchema>
  >
>;
export type output132 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingAPIResponseSchema
    >,
    z.output<typeof import("../../packages/api/schema/dist").APIResponseSchema>
  >
>;
export type Pair133 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingServiceMethodParametersDocsResponseSchema,
    typeof import("../../packages/api/schema/dist").ServiceMethodParametersDocsResponseSchema
  >
>;
export type input133 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingServiceMethodParametersDocsResponseSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ServiceMethodParametersDocsResponseSchema
    >
  >
>;
export type output133 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingServiceMethodParametersDocsResponseSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ServiceMethodParametersDocsResponseSchema
    >
  >
>;
export type Pair134 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingServiceMethodDocsResponseSchema,
    typeof import("../../packages/api/schema/dist").ServiceMethodDocsResponseSchema
  >
>;
export type input134 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingServiceMethodDocsResponseSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ServiceMethodDocsResponseSchema
    >
  >
>;
export type output134 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingServiceMethodDocsResponseSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ServiceMethodDocsResponseSchema
    >
  >
>;
export type Pair135 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingServiceDocsResponseSchema,
    typeof import("../../packages/api/schema/dist").ServiceDocsResponseSchema
  >
>;
export type input135 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingServiceDocsResponseSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ServiceDocsResponseSchema
    >
  >
>;
export type output135 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingServiceDocsResponseSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ServiceDocsResponseSchema
    >
  >
>;
export type Pair136 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingServicesDocsResponseSchema,
    typeof import("../../packages/api/schema/dist").ServicesDocsResponseSchema
  >
>;
export type input136 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingServicesDocsResponseSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").ServicesDocsResponseSchema
    >
  >
>;
export type output136 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingServicesDocsResponseSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").ServicesDocsResponseSchema
    >
  >
>;
export type Pair137 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetCarAssetsResponseSchema,
    typeof import("../../packages/api/schema/dist").GetCarAssetsResponseSchema
  >
>;
export type input137 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetCarAssetsResponseSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").GetCarAssetsResponseSchema
    >
  >
>;
export type output137 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetCarAssetsResponseSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").GetCarAssetsResponseSchema
    >
  >
>;
export type Pair138 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetCarResponseSchema,
    typeof import("../../packages/api/schema/dist").GetCarResponseSchema
  >
>;
export type input138 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetCarResponseSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").GetCarResponseSchema
    >
  >
>;
export type output138 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetCarResponseSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").GetCarResponseSchema
    >
  >
>;
export type Pair139 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetTrackAssetsResponseSchema,
    typeof import("../../packages/api/schema/dist").GetTrackAssetsResponseSchema
  >
>;
export type input139 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetTrackAssetsResponseSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").GetTrackAssetsResponseSchema
    >
  >
>;
export type output139 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetTrackAssetsResponseSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").GetTrackAssetsResponseSchema
    >
  >
>;
export type Pair140 = Assert<
  Equal<
    typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetTrackResponseSchema,
    typeof import("../../packages/api/schema/dist").GetTrackResponseSchema
  >
>;
export type input140 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetTrackResponseSchema
    >,
    z.input<
      typeof import("../../packages/api/schema/dist").GetTrackResponseSchema
    >
  >
>;
export type output140 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/api/schema/dist/schema/responses").IRacingGetTrackResponseSchema
    >,
    z.output<
      typeof import("../../packages/api/schema/dist").GetTrackResponseSchema
    >
  >
>;
export type Pair141 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingErrorResponse,
    import("../../packages/api/schema/dist").ErrorResponse
  >
>;
export type Pair142 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingAPIResponse,
    import("../../packages/api/schema/dist").APIResponse
  >
>;
export type Pair143 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingServiceMethodParametersDocsResponse,
    import("../../packages/api/schema/dist").ServiceMethodParametersDocsResponse
  >
>;
export type Pair144 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingServiceMethodDocsResponse,
    import("../../packages/api/schema/dist").ServiceMethodDocsResponse
  >
>;
export type Pair145 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingServiceDocsResponse,
    import("../../packages/api/schema/dist").ServiceDocsResponse
  >
>;
export type Pair146 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingServicesDocsResponse,
    import("../../packages/api/schema/dist").ServicesDocsResponse
  >
>;
export type Pair147 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingGetCarAssetsResponse,
    import("../../packages/api/schema/dist").GetCarAssetsResponse
  >
>;
export type Pair148 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingGetCarResponse,
    import("../../packages/api/schema/dist").GetCarResponse
  >
>;
export type Pair149 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingGetTrackAssetsResponse,
    import("../../packages/api/schema/dist").GetTrackAssetsResponse
  >
>;
export type Pair150 = Assert<
  Equal<
    import("../../packages/api/schema/dist/schema/responses").IRacingGetTrackResponse,
    import("../../packages/api/schema/dist").GetTrackResponse
  >
>;
export type Pair151 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthClientIdSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthClientIdSchema
  >
>;
export type input151 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthClientIdSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthClientIdSchema
    >
  >
>;
export type output151 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthClientIdSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthClientIdSchema
    >
  >
>;
export type Client151 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthClientIdSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthClientIdSchema
  >
>;
export type Pair152 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthClientSecretSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthClientSecretSchema
  >
>;
export type input152 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthClientSecretSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthClientSecretSchema
    >
  >
>;
export type output152 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthClientSecretSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthClientSecretSchema
    >
  >
>;
export type Client152 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthClientSecretSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthClientSecretSchema
  >
>;
export type Pair153 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopeAuthSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthScopeAuthSchema
  >
>;
export type input153 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopeAuthSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthScopeAuthSchema
    >
  >
>;
export type output153 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopeAuthSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthScopeAuthSchema
    >
  >
>;
export type Client153 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthScopeAuthSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthScopeAuthSchema
  >
>;
export type Pair154 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopeProfileSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthScopeProfileSchema
  >
>;
export type input154 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopeProfileSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthScopeProfileSchema
    >
  >
>;
export type output154 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopeProfileSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthScopeProfileSchema
    >
  >
>;
export type Client154 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthScopeProfileSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthScopeProfileSchema
  >
>;
export type Pair155 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopesSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthScopesSchema
  >
>;
export type input155 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopesSchema
    >,
    z.input<typeof import("../../packages/oauth/schema/dist").OAuthScopesSchema>
  >
>;
export type output155 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopesSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthScopesSchema
    >
  >
>;
export type Client155 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthScopesSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthScopesSchema
  >
>;
export type Pair156 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopesStringSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthScopesStringSchema
  >
>;
export type input156 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopesStringSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthScopesStringSchema
    >
  >
>;
export type output156 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopesStringSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthScopesStringSchema
    >
  >
>;
export type Client156 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthScopesStringSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthScopesStringSchema
  >
>;
export type Pair157 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRequestIdHeaderKey,
    typeof import("../../packages/oauth/schema/dist").OAuthRequestIdHeaderKey
  >
>;
export type Client157 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthRequestIdHeaderKey,
    typeof import("../../packages/oauth/schema/dist").OAuthRequestIdHeaderKey
  >
>;
export type Pair158 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRequestIdHeaderSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthRequestIdHeaderSchema
  >
>;
export type input158 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRequestIdHeaderSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthRequestIdHeaderSchema
    >
  >
>;
export type output158 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRequestIdHeaderSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthRequestIdHeaderSchema
    >
  >
>;
export type Client158 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthRequestIdHeaderSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthRequestIdHeaderSchema
  >
>;
export type Pair159 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthHeadersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthHeadersSchema
  >
>;
export type input159 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthHeadersSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthHeadersSchema
    >
  >
>;
export type output159 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthHeadersSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthHeadersSchema
    >
  >
>;
export type Client159 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthHeadersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthHeadersSchema
  >
>;
export type Pair160 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthErrorResponseSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthErrorResponseSchema
  >
>;
export type input160 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthErrorResponseSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthErrorResponseSchema
    >
  >
>;
export type output160 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthErrorResponseSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthErrorResponseSchema
    >
  >
>;
export type Client160 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthErrorResponseSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthErrorResponseSchema
  >
>;
export type Pair161 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthAuthorizeParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthAuthorizeParametersSchema
  >
>;
export type input161 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthAuthorizeParametersSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthAuthorizeParametersSchema
    >
  >
>;
export type output161 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthAuthorizeParametersSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthAuthorizeParametersSchema
    >
  >
>;
export type Client161 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthAuthorizeParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthAuthorizeParametersSchema
  >
>;
export type Pair162 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthCllbackParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthCallbackParametersSchema
  >
>;
export type input162 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthCllbackParametersSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthCallbackParametersSchema
    >
  >
>;
export type output162 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthCllbackParametersSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthCallbackParametersSchema
    >
  >
>;
export type Client162 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthCllbackParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthCallbackParametersSchema
  >
>;
export type Pair163 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenAuthorizationCodeGrantParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthTokenAuthorizationCodeGrantParametersSchema
  >
>;
export type input163 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenAuthorizationCodeGrantParametersSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthTokenAuthorizationCodeGrantParametersSchema
    >
  >
>;
export type output163 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenAuthorizationCodeGrantParametersSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthTokenAuthorizationCodeGrantParametersSchema
    >
  >
>;
export type Client163 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthTokenAuthorizationCodeGrantParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthTokenAuthorizationCodeGrantParametersSchema
  >
>;
export type Pair164 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenRefreshGrantParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthTokenRefreshGrantParametersSchema
  >
>;
export type input164 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenRefreshGrantParametersSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthTokenRefreshGrantParametersSchema
    >
  >
>;
export type output164 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenRefreshGrantParametersSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthTokenRefreshGrantParametersSchema
    >
  >
>;
export type Client164 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthTokenRefreshGrantParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthTokenRefreshGrantParametersSchema
  >
>;
export type Pair165 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthPasswordLimitedGrantParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthPasswordLimitedGrantParametersSchema
  >
>;
export type input165 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthPasswordLimitedGrantParametersSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthPasswordLimitedGrantParametersSchema
    >
  >
>;
export type output165 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthPasswordLimitedGrantParametersSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthPasswordLimitedGrantParametersSchema
    >
  >
>;
export type Client165 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthPasswordLimitedGrantParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthPasswordLimitedGrantParametersSchema
  >
>;
export type Pair166 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthTokenParametersSchema
  >
>;
export type input166 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenParametersSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthTokenParametersSchema
    >
  >
>;
export type output166 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenParametersSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthTokenParametersSchema
    >
  >
>;
export type Client166 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthTokenParametersSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthTokenParametersSchema
  >
>;
export type Pair167 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenResponseSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthTokenResponseSchema
  >
>;
export type input167 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenResponseSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthTokenResponseSchema
    >
  >
>;
export type output167 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenResponseSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthTokenResponseSchema
    >
  >
>;
export type Client167 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthTokenResponseSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthTokenResponseSchema
  >
>;
export type Pair168 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenAlgorithmValues,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenAlgorithmValues
  >
>;
export type Client168 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthJWTAccessTokenAlgorithmValues,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenAlgorithmValues
  >
>;
export type Pair169 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenAlgorithmSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenAlgorithmSchema
  >
>;
export type input169 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenAlgorithmSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenAlgorithmSchema
    >
  >
>;
export type output169 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenAlgorithmSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenAlgorithmSchema
    >
  >
>;
export type Client169 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthJWTAccessTokenAlgorithmSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenAlgorithmSchema
  >
>;
export type Pair170 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenHeaderSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenHeaderSchema
  >
>;
export type input170 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenHeaderSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenHeaderSchema
    >
  >
>;
export type output170 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenHeaderSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenHeaderSchema
    >
  >
>;
export type Client170 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthJWTAccessTokenHeaderSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenHeaderSchema
  >
>;
export type Pair171 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenPayloadSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenPayloadSchema
  >
>;
export type input171 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenPayloadSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenPayloadSchema
    >
  >
>;
export type output171 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenPayloadSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenPayloadSchema
    >
  >
>;
export type Client171 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthJWTAccessTokenPayloadSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenPayloadSchema
  >
>;
export type Pair172 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenSchema
  >
>;
export type input172 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenSchema
    >
  >
>;
export type output172 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenSchema
    >
  >
>;
export type Client172 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthJWTAccessTokenSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenSchema
  >
>;
export type Pair173 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthSessionSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthSessionSchema
  >
>;
export type input173 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthSessionSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthSessionSchema
    >
  >
>;
export type output173 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthSessionSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthSessionSchema
    >
  >
>;
export type Client173 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthSessionSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthSessionSchema
  >
>;
export type Pair174 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthSessionsSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthSessionsSchema
  >
>;
export type input174 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthSessionsSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthSessionsSchema
    >
  >
>;
export type output174 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthSessionsSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthSessionsSchema
    >
  >
>;
export type Client174 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthSessionsSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthSessionsSchema
  >
>;
export type Pair175 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthProfileResponseSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthProfileResponseSchema
  >
>;
export type input175 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthProfileResponseSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthProfileResponseSchema
    >
  >
>;
export type output175 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthProfileResponseSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthProfileResponseSchema
    >
  >
>;
export type Client175 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthProfileResponseSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthProfileResponseSchema
  >
>;
export type Pair176 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRevokeCurrentSessionInputSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthRevokeCurrentSessionInputSchema
  >
>;
export type input176 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRevokeCurrentSessionInputSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthRevokeCurrentSessionInputSchema
    >
  >
>;
export type output176 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRevokeCurrentSessionInputSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthRevokeCurrentSessionInputSchema
    >
  >
>;
export type Client176 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthRevokeCurrentSessionInputSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthRevokeCurrentSessionInputSchema
  >
>;
export type Pair177 = Assert<
  Equal<
    typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRevokeSessionsInputSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthRevokeSessionsInputSchema
  >
>;
export type input177 = Assert<
  Equal<
    z.input<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRevokeSessionsInputSchema
    >,
    z.input<
      typeof import("../../packages/oauth/schema/dist").OAuthRevokeSessionsInputSchema
    >
  >
>;
export type output177 = Assert<
  Equal<
    z.output<
      typeof import("../../packages/oauth/schema/dist/schema").IRacingOAuthRevokeSessionsInputSchema
    >,
    z.output<
      typeof import("../../packages/oauth/schema/dist").OAuthRevokeSessionsInputSchema
    >
  >
>;
export type Client177 = Assert<
  Equal<
    typeof import("../../packages/oauth/client/dist").IRacingOAuthRevokeSessionsInputSchema,
    typeof import("../../packages/oauth/schema/dist").OAuthRevokeSessionsInputSchema
  >
>;
export type Pair178 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthClientId,
    import("../../packages/oauth/schema/dist").OAuthClientId
  >
>;
export type Client178 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthClientId,
    import("../../packages/oauth/schema/dist").OAuthClientId
  >
>;
export type Pair179 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthClientSecret,
    import("../../packages/oauth/schema/dist").OAuthClientSecret
  >
>;
export type Client179 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthClientSecret,
    import("../../packages/oauth/schema/dist").OAuthClientSecret
  >
>;
export type Pair180 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopeAuth,
    import("../../packages/oauth/schema/dist").OAuthScopeAuth
  >
>;
export type Client180 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthScopeAuth,
    import("../../packages/oauth/schema/dist").OAuthScopeAuth
  >
>;
export type Pair181 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopeProfile,
    import("../../packages/oauth/schema/dist").OAuthScopeProfile
  >
>;
export type Client181 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthScopeProfile,
    import("../../packages/oauth/schema/dist").OAuthScopeProfile
  >
>;
export type Pair182 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopes,
    import("../../packages/oauth/schema/dist").OAuthScopes
  >
>;
export type Client182 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthScopes,
    import("../../packages/oauth/schema/dist").OAuthScopes
  >
>;
export type Pair183 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthScopesString,
    import("../../packages/oauth/schema/dist").OAuthScopesString
  >
>;
export type Client183 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthScopesString,
    import("../../packages/oauth/schema/dist").OAuthScopesString
  >
>;
export type Pair184 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthRequestIdHeader,
    import("../../packages/oauth/schema/dist").OAuthRequestIdHeader
  >
>;
export type Client184 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthRequestIdHeader,
    import("../../packages/oauth/schema/dist").OAuthRequestIdHeader
  >
>;
export type Pair185 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthHeaders,
    import("../../packages/oauth/schema/dist").OAuthHeaders
  >
>;
export type Client185 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthHeaders,
    import("../../packages/oauth/schema/dist").OAuthHeaders
  >
>;
export type Pair186 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthAuthorizeParameters,
    import("../../packages/oauth/schema/dist").OAuthAuthorizeParameters
  >
>;
export type Client186 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthAuthorizeParameters,
    import("../../packages/oauth/schema/dist").OAuthAuthorizeParameters
  >
>;
export type Pair187 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenAuthorizationCodeGrantParameters,
    import("../../packages/oauth/schema/dist").OAuthTokenAuthorizationCodeGrantParameters
  >
>;
export type Client187 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthTokenAuthorizationCodeGrantParameters,
    import("../../packages/oauth/schema/dist").OAuthTokenAuthorizationCodeGrantParameters
  >
>;
export type Pair188 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenRefreshGrantParameters,
    import("../../packages/oauth/schema/dist").OAuthTokenRefreshGrantParameters
  >
>;
export type Client188 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthTokenRefreshGrantParameters,
    import("../../packages/oauth/schema/dist").OAuthTokenRefreshGrantParameters
  >
>;
export type Pair189 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenParameters,
    import("../../packages/oauth/schema/dist").OAuthTokenParameters
  >
>;
export type Client189 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthTokenParameters,
    import("../../packages/oauth/schema/dist").OAuthTokenParameters
  >
>;
export type Pair190 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthTokenResponse,
    import("../../packages/oauth/schema/dist").OAuthTokenResponse
  >
>;
export type Client190 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthTokenResponse,
    import("../../packages/oauth/schema/dist").OAuthTokenResponse
  >
>;
export type Pair191 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenAlgorithm,
    import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenAlgorithm
  >
>;
export type Client191 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthJWTAccessTokenAlgorithm,
    import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenAlgorithm
  >
>;
export type Pair192 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenHeader,
    import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenHeader
  >
>;
export type Client192 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthJWTAccessTokenHeader,
    import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenHeader
  >
>;
export type Pair193 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessTokenPayload,
    import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenPayload
  >
>;
export type Client193 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthJWTAccessTokenPayload,
    import("../../packages/oauth/schema/dist").OAuthJWTAccessTokenPayload
  >
>;
export type Pair194 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthJWTAccessToken,
    import("../../packages/oauth/schema/dist").OAuthJWTAccessToken
  >
>;
export type Client194 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthJWTAccessToken,
    import("../../packages/oauth/schema/dist").OAuthJWTAccessToken
  >
>;
export type Pair195 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthSession,
    import("../../packages/oauth/schema/dist").OAuthSession
  >
>;
export type Client195 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthSession,
    import("../../packages/oauth/schema/dist").OAuthSession
  >
>;
export type Pair196 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthSessions,
    import("../../packages/oauth/schema/dist").OAuthSessions
  >
>;
export type Client196 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthSessions,
    import("../../packages/oauth/schema/dist").OAuthSessions
  >
>;
export type Pair197 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthProfileResponse,
    import("../../packages/oauth/schema/dist").OAuthProfileResponse
  >
>;
export type Client197 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthProfileResponse,
    import("../../packages/oauth/schema/dist").OAuthProfileResponse
  >
>;
export type Pair198 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthRevokeCurrentSessionParameters,
    import("../../packages/oauth/schema/dist").OAuthRevokeCurrentSessionParameters
  >
>;
export type Client198 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthRevokeCurrentSessionParameters,
    import("../../packages/oauth/schema/dist").OAuthRevokeCurrentSessionParameters
  >
>;
export type Pair199 = Assert<
  Equal<
    import("../../packages/oauth/schema/dist/schema").IRacingOAuthRevokeSessionsParameters,
    import("../../packages/oauth/schema/dist").OAuthRevokeSessionsParameters
  >
>;
export type Client199 = Assert<
  Equal<
    import("../../packages/oauth/client/dist").IRacingOAuthRevokeSessionsParameters,
    import("../../packages/oauth/schema/dist").OAuthRevokeSessionsParameters
  >
>;
