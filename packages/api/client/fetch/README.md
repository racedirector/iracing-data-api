# @iracing-data/api-client-fetch

Typed Fetch client for the iRacing Data API, generated from maintained OpenAPI schemas.

Access cars, tracks, members, results, seasons, leagues, stats, and other iRacing Data API resources with typed methods and responses. The recommended starting point for general API usage; requires Node.js or another runtime providing Fetch.

## Installation

```bash
pnpm add @iracing-data/api-client-fetch
```

## Authentication and usage

Obtain an iRacing OAuth 2.0 access token with [@iracing-data/oauth-client](https://www.npmjs.com/package/@iracing-data/oauth-client), then pass it as a bearer token. The API client does not perform login or refresh tokens; provide a current token for each session. Keep client secrets on your server.

```typescript
import { CarApi, Configuration } from "@iracing-data/api-client-fetch";

const api = new CarApi(
  new Configuration({ accessToken: process.env.IRACING_ACCESS_TOKEN! }),
);
const response = await api.getCar();
```

This Node.js example uses an access token from the environment. Some Data API endpoints return a link to the resource data; follow that link separately without forwarding your bearer token.

## Related @iracing-data packages

Start with [@iracing-data/api-client-fetch](https://www.npmjs.com/package/@iracing-data/api-client-fetch) for general iRacing Data API usage.

- [OAuth client](https://www.npmjs.com/package/@iracing-data/oauth-client): authentication and token refresh.
- [Axios client](https://www.npmjs.com/package/@iracing-data/api-client-axios): use your existing Axios stack.
- [API schemas](https://www.npmjs.com/package/@iracing-data/api-schema): runtime validation and TypeScript types.
- [OAuth schemas](https://www.npmjs.com/package/@iracing-data/oauth-schema): OAuth request and response validation.
- [API router](https://www.npmjs.com/package/@iracing-data/api-router): Better Call server routes.
- [API OpenAPI generator](https://www.npmjs.com/package/@iracing-data/api-schema-to-openapi) and [OAuth OpenAPI generator](https://www.npmjs.com/package/@iracing-data/oauth-schema-to-openapi): generate specifications from schemas.

See the [repository and examples](https://github.com/racedirector/iracing-data-api) for the complete package family.

## Documentation

### API Endpoints

All URIs are relative to *https://members-ng.iracing.com*

| Class            | Method                                                                                                    | HTTP request                                            | Description                           |
| ---------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------- |
| _AuthApi_        | [**postAuth**](docs/AuthApi.md#postauthoperation)                                                         | **POST** /auth                                          |
| _CarApi_         | [**getCar**](docs/CarApi.md#getcar)                                                                       | **GET** /data/car/get                                   |
| _CarApi_         | [**getCarAssets**](docs/CarApi.md#getcarassets)                                                           | **GET** /data/car/assets                                |
| _CarclassApi_    | [**getCarClass**](docs/CarclassApi.md#getcarclass)                                                        | **GET** /data/carclass/get                              | Gets car classes.                     |
| _ConstantsApi_   | [**getConstantsCategories**](docs/ConstantsApi.md#getconstantscategories)                                 | **GET** /data/constants/categories                      |
| _ConstantsApi_   | [**getConstantsDivisions**](docs/ConstantsApi.md#getconstantsdivisions)                                   | **GET** /data/constants/divisions                       |
| _ConstantsApi_   | [**getConstantsEventTypes**](docs/ConstantsApi.md#getconstantseventtypes)                                 | **GET** /data/constants/event_types                     |
| _DocApi_         | [**getCarAssetsDocs**](docs/DocApi.md#getcarassetsdocs)                                                   | **GET** /data/doc/car/assets                            |
| _DocApi_         | [**getCarClassDocs**](docs/DocApi.md#getcarclassdocs)                                                     | **GET** /data/doc/carclass                              |
| _DocApi_         | [**getCarClassGetDocs**](docs/DocApi.md#getcarclassgetdocs)                                               | **GET** /data/doc/carclass/get                          |
| _DocApi_         | [**getCarDocs**](docs/DocApi.md#getcardocs)                                                               | **GET** /data/doc/car                                   |
| _DocApi_         | [**getCarGetDocs**](docs/DocApi.md#getcargetdocs)                                                         | **GET** /data/doc/car/get                               |
| _DocApi_         | [**getConstantsCategoriesDocs**](docs/DocApi.md#getconstantscategoriesdocs)                               | **GET** /data/doc/constants/categories                  |
| _DocApi_         | [**getConstantsDivisionsDocs**](docs/DocApi.md#getconstantsdivisionsdocs)                                 | **GET** /data/doc/constants/divisions                   |
| _DocApi_         | [**getConstantsDocs**](docs/DocApi.md#getconstantsdocs)                                                   | **GET** /data/doc/constants                             |
| _DocApi_         | [**getConstantsEventTypesDocs**](docs/DocApi.md#getconstantseventtypesdocs)                               | **GET** /data/doc/constants/event_types                 |
| _DocApi_         | [**getDocs**](docs/DocApi.md#getdocs)                                                                     | **GET** /data/doc                                       |
| _DocApi_         | [**getDriverStatsByCategoryCategoryDocs**](docs/DocApi.md#getdriverstatsbycategorycategorydocs)           | **GET** /data/doc/driver_stats_by_category/{category}   |
| _DocApi_         | [**getDriverStatsByCategoryDocs**](docs/DocApi.md#getdriverstatsbycategorydocs)                           | **GET** /data/doc/driver_stats_by_category              |
| _DocApi_         | [**getHostedCombinedSessionsDocs**](docs/DocApi.md#gethostedcombinedsessionsdocs)                         | **GET** /data/doc/hosted/combined_sessions              |
| _DocApi_         | [**getHostedDocs**](docs/DocApi.md#gethosteddocs)                                                         | **GET** /data/doc/hosted                                |
| _DocApi_         | [**getHostedSessionsDocs**](docs/DocApi.md#gethostedsessionsdocs)                                         | **GET** /data/doc/hosted/sessions                       |
| _DocApi_         | [**getLeagueCustomerLeagueSessionsDocs**](docs/DocApi.md#getleaguecustomerleaguesessionsdocs)             | **GET** /data/doc/league/cust_league_sessions           |
| _DocApi_         | [**getLeagueDirectoryDocs**](docs/DocApi.md#getleaguedirectorydocs)                                       | **GET** /data/doc/league/directory                      |
| _DocApi_         | [**getLeagueDocs**](docs/DocApi.md#getleaguedocs)                                                         | **GET** /data/doc/league                                |
| _DocApi_         | [**getLeagueGetDocs**](docs/DocApi.md#getleaguegetdocs)                                                   | **GET** /data/doc/league/get                            |
| _DocApi_         | [**getLeagueGetPointsSystemsDocs**](docs/DocApi.md#getleaguegetpointssystemsdocs)                         | **GET** /data/doc/league/get_points_systems             |
| _DocApi_         | [**getLeagueMembershipDocs**](docs/DocApi.md#getleaguemembershipdocs)                                     | **GET** /data/doc/league/membership                     |
| _DocApi_         | [**getLeagueRosterDocs**](docs/DocApi.md#getleaguerosterdocs)                                             | **GET** /data/doc/league/roster                         |
| _DocApi_         | [**getLeagueSeasonSessionsDocs**](docs/DocApi.md#getleagueseasonsessionsdocs)                             | **GET** /data/doc/league/season_sessions                |
| _DocApi_         | [**getLeagueSeasonStandingsDocs**](docs/DocApi.md#getleagueseasonstandingsdocs)                           | **GET** /data/doc/league/season_standings               |
| _DocApi_         | [**getLeagueSeasonsDocs**](docs/DocApi.md#getleagueseasonsdocs)                                           | **GET** /data/doc/league/seasons                        |
| _DocApi_         | [**getLookupCountriesDocs**](docs/DocApi.md#getlookupcountriesdocs)                                       | **GET** /data/doc/lookup/countries                      |
| _DocApi_         | [**getLookupDocs**](docs/DocApi.md#getlookupdocs)                                                         | **GET** /data/doc/lookup                                |
| _DocApi_         | [**getLookupDriversDocs**](docs/DocApi.md#getlookupdriversdocs)                                           | **GET** /data/doc/lookup/drivers                        |
| _DocApi_         | [**getLookupFlairsDocs**](docs/DocApi.md#getlookupflairsdocs)                                             | **GET** /data/doc/lookup/flairs                         |
| _DocApi_         | [**getLookupGetDocs**](docs/DocApi.md#getlookupgetdocs)                                                   | **GET** /data/doc/lookup/get                            |
| _DocApi_         | [**getLookupLicensesDocs**](docs/DocApi.md#getlookuplicensesdocs)                                         | **GET** /data/doc/lookup/licenses                       |
| _DocApi_         | [**getMemberAwardInstancesDocs**](docs/DocApi.md#getmemberawardinstancesdocs)                             | **GET** /data/doc/member/award_instances                |
| _DocApi_         | [**getMemberAwardsDocs**](docs/DocApi.md#getmemberawardsdocs)                                             | **GET** /data/doc/member/awards                         |
| _DocApi_         | [**getMemberChartDataDocs**](docs/DocApi.md#getmemberchartdatadocs)                                       | **GET** /data/doc/member/chart_data                     |
| _DocApi_         | [**getMemberDocs**](docs/DocApi.md#getmemberdocs)                                                         | **GET** /data/doc/member                                |
| _DocApi_         | [**getMemberGetDocs**](docs/DocApi.md#getmembergetdocs)                                                   | **GET** /data/doc/member/get                            |
| _DocApi_         | [**getMemberInfoDocs**](docs/DocApi.md#getmemberinfodocs)                                                 | **GET** /data/doc/member/info                           |
| _DocApi_         | [**getMemberParticipationCreditsDocs**](docs/DocApi.md#getmemberparticipationcreditsdocs)                 | **GET** /data/doc/member/participation_credits          |
| _DocApi_         | [**getMemberProfileDocs**](docs/DocApi.md#getmemberprofiledocs)                                           | **GET** /data/doc/member/profile                        |
| _DocApi_         | [**getResultsDocs**](docs/DocApi.md#getresultsdocs)                                                       | **GET** /data/doc/results                               |
| _DocApi_         | [**getResultsEventLogDocs**](docs/DocApi.md#getresultseventlogdocs)                                       | **GET** /data/doc/results/event_log                     |
| _DocApi_         | [**getResultsGetDocs**](docs/DocApi.md#getresultsgetdocs)                                                 | **GET** /data/doc/results/get                           |
| _DocApi_         | [**getResultsLapChartDataDocs**](docs/DocApi.md#getresultslapchartdatadocs)                               | **GET** /data/doc/results/lap_chart_data                |
| _DocApi_         | [**getResultsLapDataDocs**](docs/DocApi.md#getresultslapdatadocs)                                         | **GET** /data/doc/results/lap_data                      |
| _DocApi_         | [**getResultsSearchHostedDocs**](docs/DocApi.md#getresultssearchhosteddocs)                               | **GET** /data/doc/results/search_hosted                 |
| _DocApi_         | [**getResultsSearchSeriesDocs**](docs/DocApi.md#getresultssearchseriesdocs)                               | **GET** /data/doc/results/search_series                 |
| _DocApi_         | [**getResultsSeasonResultsDocs**](docs/DocApi.md#getresultsseasonresultsdocs)                             | **GET** /data/doc/results/season_results                |
| _DocApi_         | [**getSeasonDocs**](docs/DocApi.md#getseasondocs)                                                         | **GET** /data/doc/season                                |
| _DocApi_         | [**getSeasonListDocs**](docs/DocApi.md#getseasonlistdocs)                                                 | **GET** /data/doc/season/list                           |
| _DocApi_         | [**getSeasonRaceGuideDocs**](docs/DocApi.md#getseasonraceguidedocs)                                       | **GET** /data/doc/season/race_guide                     |
| _DocApi_         | [**getSeasonSpectatorSubsessionIdsDetailDocs**](docs/DocApi.md#getseasonspectatorsubsessionidsdetaildocs) | **GET** /data/doc/season/spectator_subsessionids_detail |
| _DocApi_         | [**getSeasonSpectatorSubsessionIdsDocs**](docs/DocApi.md#getseasonspectatorsubsessionidsdocs)             | **GET** /data/doc/season/spectator_subsessionids        |
| _DocApi_         | [**getSeriesAssetsDocs**](docs/DocApi.md#getseriesassetsdocs)                                             | **GET** /data/doc/series/assets                         |
| _DocApi_         | [**getSeriesDocs**](docs/DocApi.md#getseriesdocs)                                                         | **GET** /data/doc/series                                |
| _DocApi_         | [**getSeriesGetDocs**](docs/DocApi.md#getseriesgetdocs)                                                   | **GET** /data/doc/series/get                            |
| _DocApi_         | [**getSeriesPastSeasonsDocs**](docs/DocApi.md#getseriespastseasonsdocs)                                   | **GET** /data/doc/series/past_seasons                   |
| _DocApi_         | [**getSeriesSeasonListDocs**](docs/DocApi.md#getseriesseasonlistdocs)                                     | **GET** /data/doc/series/season_list                    |
| _DocApi_         | [**getSeriesSeasonScheduleDocs**](docs/DocApi.md#getseriesseasonscheduledocs)                             | **GET** /data/doc/series/season_schedule                |
| _DocApi_         | [**getSeriesSeasonsDocs**](docs/DocApi.md#getseriesseasonsdocs)                                           | **GET** /data/doc/series/seasons                        |
| _DocApi_         | [**getSeriesStatsSeriesDocs**](docs/DocApi.md#getseriesstatsseriesdocs)                                   | **GET** /data/doc/series/stats_series                   |
| _DocApi_         | [**getStatsDocs**](docs/DocApi.md#getstatsdocs)                                                           | **GET** /data/doc/stats                                 |
| _DocApi_         | [**getStatsMemberBestsDocs**](docs/DocApi.md#getstatsmemberbestsdocs)                                     | **GET** /data/doc/stats/member_bests                    |
| _DocApi_         | [**getStatsMemberCareerDocs**](docs/DocApi.md#getstatsmembercareerdocs)                                   | **GET** /data/doc/stats/member_career                   |
| _DocApi_         | [**getStatsMemberDivisionDocs**](docs/DocApi.md#getstatsmemberdivisiondocs)                               | **GET** /data/doc/stats/member_division                 |
| _DocApi_         | [**getStatsMemberRecapDocs**](docs/DocApi.md#getstatsmemberrecapdocs)                                     | **GET** /data/doc/stats/member_recap                    |
| _DocApi_         | [**getStatsMemberRecentRacesDocs**](docs/DocApi.md#getstatsmemberrecentracesdocs)                         | **GET** /data/doc/stats/member_recent_races             |
| _DocApi_         | [**getStatsMemberSummaryDocs**](docs/DocApi.md#getstatsmembersummarydocs)                                 | **GET** /data/doc/stats/member_summary                  |
| _DocApi_         | [**getStatsMemberYearlyDocs**](docs/DocApi.md#getstatsmemberyearlydocs)                                   | **GET** /data/doc/stats/member_yearly                   |
| _DocApi_         | [**getStatsSeasonDriverStandingsDocs**](docs/DocApi.md#getstatsseasondriverstandingsdocs)                 | **GET** /data/doc/stats/season_driver_standings         |
| _DocApi_         | [**getStatsSeasonQualifyResultsDocs**](docs/DocApi.md#getstatsseasonqualifyresultsdocs)                   | **GET** /data/doc/stats/season_qualify_results          |
| _DocApi_         | [**getStatsSeasonSupersessionStandingsDocs**](docs/DocApi.md#getstatsseasonsupersessionstandingsdocs)     | **GET** /data/doc/stats/season_supersession_standings   |
| _DocApi_         | [**getStatsSeasonTTResultsDocs**](docs/DocApi.md#getstatsseasonttresultsdocs)                             | **GET** /data/doc/stats/season_tt_results               |
| _DocApi_         | [**getStatsSeasonTTStandingsDocs**](docs/DocApi.md#getstatsseasonttstandingsdocs)                         | **GET** /data/doc/stats/season_tt_standings             |
| _DocApi_         | [**getStatsSeasonTeamStandingsDocs**](docs/DocApi.md#getstatsseasonteamstandingsdocs)                     | **GET** /data/doc/stats/season_team_standings           |
| _DocApi_         | [**getStatsWorldRecordsDocs**](docs/DocApi.md#getstatsworldrecordsdocs)                                   | **GET** /data/doc/stats/world_records                   |
| _DocApi_         | [**getTeamDocs**](docs/DocApi.md#getteamdocs)                                                             | **GET** /data/doc/team                                  |
| _DocApi_         | [**getTeamGetDocs**](docs/DocApi.md#getteamgetdocs)                                                       | **GET** /data/doc/team/get                              |
| _DocApi_         | [**getTeamMembershipDocs**](docs/DocApi.md#getteammembershipdocs)                                         | **GET** /data/doc/team/membership                       |
| _DocApi_         | [**getTimeAttackDocs**](docs/DocApi.md#gettimeattackdocs)                                                 | **GET** /data/doc/time_attack                           |
| _DocApi_         | [**getTimeAttackMemberSeasonResultsDocs**](docs/DocApi.md#gettimeattackmemberseasonresultsdocs)           | **GET** /data/doc/time_attack/member_season_results     |
| _DocApi_         | [**getTrackAssetsDocs**](docs/DocApi.md#gettrackassetsdocs)                                               | **GET** /data/doc/track/assets                          |
| _DocApi_         | [**getTrackDocs**](docs/DocApi.md#gettrackdocs)                                                           | **GET** /data/doc/track                                 |
| _DocApi_         | [**getTrackGetDocs**](docs/DocApi.md#gettrackgetdocs)                                                     | **GET** /data/doc/track/get                             |
| _DriverStatsApi_ | [**getDriverStatsByCategory**](docs/DriverStatsApi.md#getdriverstatsbycategory)                           | **GET** /data/driver_stats_by_category/{category}       |
| _HostedApi_      | [**getHostedCombinedSessions**](docs/HostedApi.md#gethostedcombinedsessions)                              | **GET** /data/hosted/combined_sessions                  |
| _HostedApi_      | [**getHostedSessions**](docs/HostedApi.md#gethostedsessions)                                              | **GET** /data/hosted/sessions                           |
| _LeagueApi_      | [**getLeague**](docs/LeagueApi.md#getleague)                                                              | **GET** /data/league/get                                |
| _LeagueApi_      | [**getLeagueCustomerLeagueSessions**](docs/LeagueApi.md#getleaguecustomerleaguesessions)                  | **GET** /data/league/cust_league_sessions               |
| _LeagueApi_      | [**getLeagueDirectory**](docs/LeagueApi.md#getleaguedirectory)                                            | **GET** /data/league/directory                          |
| _LeagueApi_      | [**getLeagueMembership**](docs/LeagueApi.md#getleaguemembership)                                          | **GET** /data/league/membership                         |
| _LeagueApi_      | [**getLeaguePointsSystems**](docs/LeagueApi.md#getleaguepointssystems)                                    | **GET** /data/league/get_points_systems                 |
| _LeagueApi_      | [**getLeagueRoster**](docs/LeagueApi.md#getleagueroster)                                                  | **GET** /data/league/roster                             |
| _LeagueApi_      | [**getLeagueSeasonSessions**](docs/LeagueApi.md#getleagueseasonsessions)                                  | **GET** /data/league/season_sessions                    |
| _LeagueApi_      | [**getLeagueSeasonStandings**](docs/LeagueApi.md#getleagueseasonstandings)                                | **GET** /data/league/season_standings                   |
| _LeagueApi_      | [**getLeagueSeasons**](docs/LeagueApi.md#getleagueseasons)                                                | **GET** /data/league/seasons                            |
| _LookupApi_      | [**getLookup**](docs/LookupApi.md#getlookup)                                                              | **GET** /data/lookup/get                                |
| _LookupApi_      | [**getLookupCountries**](docs/LookupApi.md#getlookupcountries)                                            | **GET** /data/lookup/countries                          |
| _LookupApi_      | [**getLookupDrivers**](docs/LookupApi.md#getlookupdrivers)                                                | **GET** /data/lookup/drivers                            |
| _LookupApi_      | [**getLookupFlairs**](docs/LookupApi.md#getlookupflairs)                                                  | **GET** /data/lookup/flairs                             |
| _LookupApi_      | [**getLookupLicenses**](docs/LookupApi.md#getlookuplicenses)                                              | **GET** /data/lookup/licenses                           |
| _MemberApi_      | [**getMember**](docs/MemberApi.md#getmember)                                                              | **GET** /data/member/get                                |
| _MemberApi_      | [**getMemberAwardInstances**](docs/MemberApi.md#getmemberawardinstances)                                  | **GET** /data/member/award_instances                    |
| _MemberApi_      | [**getMemberAwards**](docs/MemberApi.md#getmemberawards)                                                  | **GET** /data/member/awards                             |
| _MemberApi_      | [**getMemberChartData**](docs/MemberApi.md#getmemberchartdata)                                            | **GET** /data/member/chart_data                         |
| _MemberApi_      | [**getMemberInfo**](docs/MemberApi.md#getmemberinfo)                                                      | **GET** /data/member/info                               |
| _MemberApi_      | [**getMemberParticipationCredits**](docs/MemberApi.md#getmemberparticipationcredits)                      | **GET** /data/member/participation_credits              |
| _MemberApi_      | [**getMemberProfile**](docs/MemberApi.md#getmemberprofile)                                                | **GET** /data/member/profile                            | Gets a requested user\&#39;s profile. |
| _ResultsApi_     | [**getResults**](docs/ResultsApi.md#getresults)                                                           | **GET** /data/results/get                               |
| _ResultsApi_     | [**getResultsEventLog**](docs/ResultsApi.md#getresultseventlog)                                           | **GET** /data/results/event_log                         |
| _ResultsApi_     | [**getResultsLapChartData**](docs/ResultsApi.md#getresultslapchartdata)                                   | **GET** /data/results/lap_chart_data                    |
| _ResultsApi_     | [**getResultsLapData**](docs/ResultsApi.md#getresultslapdata)                                             | **GET** /data/results/lap_data                          |
| _ResultsApi_     | [**getResultsSearchHosted**](docs/ResultsApi.md#getresultssearchhosted)                                   | **GET** /data/results/search_hosted                     |
| _ResultsApi_     | [**getResultsSearchSeries**](docs/ResultsApi.md#getresultssearchseries)                                   | **GET** /data/results/search_series                     |
| _ResultsApi_     | [**getResultsSeasonResults**](docs/ResultsApi.md#getresultsseasonresults)                                 | **GET** /data/results/season_results                    |
| _SeasonApi_      | [**getSeasonList**](docs/SeasonApi.md#getseasonlist)                                                      | **GET** /data/season/list                               |
| _SeasonApi_      | [**getSeasonRaceGuide**](docs/SeasonApi.md#getseasonraceguide)                                            | **GET** /data/season/race_guide                         |
| _SeasonApi_      | [**getSeasonSpectatorSubsessionIds**](docs/SeasonApi.md#getseasonspectatorsubsessionids)                  | **GET** /data/season/spectator_subsessionids            |
| _SeasonApi_      | [**getSeasonSpectatorSubsessionIdsDetail**](docs/SeasonApi.md#getseasonspectatorsubsessionidsdetail)      | **GET** /data/season/spectator_subsessionids_detail     |
| _SeriesApi_      | [**getSeries**](docs/SeriesApi.md#getseries)                                                              | **GET** /data/series/get                                |
| _SeriesApi_      | [**getSeriesAssets**](docs/SeriesApi.md#getseriesassets)                                                  | **GET** /data/series/assets                             |
| _SeriesApi_      | [**getSeriesPastSeasons**](docs/SeriesApi.md#getseriespastseasons)                                        | **GET** /data/series/past_seasons                       |
| _SeriesApi_      | [**getSeriesSeasonList**](docs/SeriesApi.md#getseriesseasonlist)                                          | **GET** /data/series/season_list                        |
| _SeriesApi_      | [**getSeriesSeasonSchedule**](docs/SeriesApi.md#getseriesseasonschedule)                                  | **GET** /data/series/season_schedule                    |
| _SeriesApi_      | [**getSeriesSeasons**](docs/SeriesApi.md#getseriesseasons)                                                | **GET** /data/series/seasons                            |
| _SeriesApi_      | [**getSeriesStatsSeries**](docs/SeriesApi.md#getseriesstatsseries)                                        | **GET** /data/series/stats_series                       |
| _StatsApi_       | [**getStatsMemberBests**](docs/StatsApi.md#getstatsmemberbests)                                           | **GET** /data/stats/member_bests                        |
| _StatsApi_       | [**getStatsMemberCareer**](docs/StatsApi.md#getstatsmembercareer)                                         | **GET** /data/stats/member_career                       |
| _StatsApi_       | [**getStatsMemberDivision**](docs/StatsApi.md#getstatsmemberdivision)                                     | **GET** /data/stats/member_division                     |
| _StatsApi_       | [**getStatsMemberRecap**](docs/StatsApi.md#getstatsmemberrecap)                                           | **GET** /data/stats/member_recap                        |
| _StatsApi_       | [**getStatsMemberRecentRaces**](docs/StatsApi.md#getstatsmemberrecentraces)                               | **GET** /data/stats/member_recent_races                 |
| _StatsApi_       | [**getStatsMemberSummary**](docs/StatsApi.md#getstatsmembersummary)                                       | **GET** /data/stats/member_summary                      |
| _StatsApi_       | [**getStatsMemberYearly**](docs/StatsApi.md#getstatsmemberyearly)                                         | **GET** /data/stats/member_yearly                       |
| _StatsApi_       | [**getStatsSeasonDriverStandings**](docs/StatsApi.md#getstatsseasondriverstandings)                       | **GET** /data/stats/season_driver_standings             |
| _StatsApi_       | [**getStatsSeasonQualifyResults**](docs/StatsApi.md#getstatsseasonqualifyresults)                         | **GET** /data/stats/season_qualify_results              |
| _StatsApi_       | [**getStatsSeasonSupersessionStandings**](docs/StatsApi.md#getstatsseasonsupersessionstandings)           | **GET** /data/stats/season_supersession_standings       |
| _StatsApi_       | [**getStatsSeasonTeamStandings**](docs/StatsApi.md#getstatsseasonteamstandings)                           | **GET** /data/stats/season_team_standings               |
| _StatsApi_       | [**getStatsSeasonTimeTrialResults**](docs/StatsApi.md#getstatsseasontimetrialresults)                     | **GET** /data/stats/season_time_trial_results           |
| _StatsApi_       | [**getStatsSeasonTimeTrialStandings**](docs/StatsApi.md#getstatsseasontimetrialstandings)                 | **GET** /data/stats/season_time_trial_standings         |
| _StatsApi_       | [**getStatsWorldRecords**](docs/StatsApi.md#getstatsworldrecords)                                         | **GET** /data/stats/world_records                       |
| _TeamApi_        | [**getTeam**](docs/TeamApi.md#getteam)                                                                    | **GET** /data/team/get                                  |
| _TeamApi_        | [**getTeamMembership**](docs/TeamApi.md#getteammembership)                                                | **GET** /data/team/membership                           |
| _TimeAttackApi_  | [**getTimeAttackMemberSeasonResults**](docs/TimeAttackApi.md#gettimeattackmemberseasonresults)            | **GET** /data/time_attack/member_season_results         |
| _TrackApi_       | [**getTrack**](docs/TrackApi.md#gettrack)                                                                 | **GET** /data/track/get                                 |
| _TrackApi_       | [**getTrackAssets**](docs/TrackApi.md#gettrackassets)                                                     | **GET** /data/track/assets                              |

### Models

- [ErrorResponse](docs/ErrorResponse.md)
- [IracingAPIResponse](docs/IracingAPIResponse.md)
- [IracingCategory](docs/IracingCategory.md)
- [IracingDivision](docs/IracingDivision.md)
- [IracingEventType](docs/IracingEventType.md)
- [IracingServiceMethodDocs](docs/IracingServiceMethodDocs.md)
- [IracingServiceMethodParametersDocs](docs/IracingServiceMethodParametersDocs.md)
- [PostAuthRequest](docs/PostAuthRequest.md)

### Authorization

Authentication schemes defined for the API:
<a id="bearerAuth"></a>

#### bearerAuth

- **Type**: HTTP Bearer Token authentication (JWT)
  <a id="oAuth2-accessCode"></a>

#### oAuth2 accessCode

- **Type**: OAuth
- **Flow**: accessCode
- **Authorization URL**: https://oauth.iracing.com/oauth2/authorize
- **Scopes**:
  - `iracing.auth`: Authorization for iRacing services.
  - `iracing.profile`: Access to the iRacing profile.

## About

This TypeScript SDK client supports the [Fetch API](https://fetch.spec.whatwg.org/)
and is automatically generated by the
[OpenAPI Generator](https://openapi-generator.tech) project:

- API version: `0.0.1`
- Package version: `0.0.1`
- Generator version: `7.17.0`
- Build package: `org.openapitools.codegen.languages.TypeScriptFetchClientCodegen`

The generated npm module supports the following:

- Environments
  - Node.js
  - Webpack
  - Browserify
- Language levels
  - ES5 - you must have a Promises/A+ library installed
  - ES6
- Module systems
  - CommonJS
  - ES6 module system

## Development

See the [repository development and release instructions](https://github.com/racedirector/iracing-data-api#development).

## License

[MIT](https://github.com/racedirector/iracing-data-api/blob/main/LICENSE).
