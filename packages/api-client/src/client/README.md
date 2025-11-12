## @iracing-data/api-client@0.0.1

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment
* Node.js
* Webpack
* Browserify

Language level
* ES5 - you must have a Promises/A+ library installed
* ES6

Module system
* CommonJS
* ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Publishing

First build the package then run `npm publish`

### Consuming

navigate to the folder of your consuming project and run one of the following commands.

_published:_

```
npm install @iracing-data/api-client@0.0.1 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *https://members-ng.iracing.com*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*CarApi* | [**getCar**](docs/CarApi.md#getcar) | **GET** /data/car/get | 
*CarApi* | [**getCarAssets**](docs/CarApi.md#getcarassets) | **GET** /data/car/assets | 
*CarApi* | [**getCarAssetsDocs**](docs/CarApi.md#getcarassetsdocs) | **GET** /data/doc/car/assets | 
*CarApi* | [**getCarDocs**](docs/CarApi.md#getcardocs) | **GET** /data/doc/car | 
*CarApi* | [**getCarGetDocs**](docs/CarApi.md#getcargetdocs) | **GET** /data/doc/car/get | 
*CarclassApi* | [**getCarClass**](docs/CarclassApi.md#getcarclass) | **GET** /data/carclass/get | Gets car classes.
*CarclassApi* | [**getCarClassDocs**](docs/CarclassApi.md#getcarclassdocs) | **GET** /data/doc/carclass | 
*CarclassApi* | [**getCarClassGetDocs**](docs/CarclassApi.md#getcarclassgetdocs) | **GET** /data/doc/carclass/get | 
*ConstantsApi* | [**getConstantsCategories**](docs/ConstantsApi.md#getconstantscategories) | **GET** /data/constants/categories | 
*ConstantsApi* | [**getConstantsCategoriesDocs**](docs/ConstantsApi.md#getconstantscategoriesdocs) | **GET** /data/doc/constants/categories | 
*ConstantsApi* | [**getConstantsDivisions**](docs/ConstantsApi.md#getconstantsdivisions) | **GET** /data/constants/divisions | 
*ConstantsApi* | [**getConstantsDivisionsDocs**](docs/ConstantsApi.md#getconstantsdivisionsdocs) | **GET** /data/doc/constants/divisions | 
*ConstantsApi* | [**getConstantsDocs**](docs/ConstantsApi.md#getconstantsdocs) | **GET** /data/doc/constants | 
*ConstantsApi* | [**getConstantsEventTypes**](docs/ConstantsApi.md#getconstantseventtypes) | **GET** /data/constants/event_types | 
*ConstantsApi* | [**getConstantsEventTypesDocs**](docs/ConstantsApi.md#getconstantseventtypesdocs) | **GET** /data/doc/constants/event_types | 
*DocApi* | [**getCarAssetsDocs**](docs/DocApi.md#getcarassetsdocs) | **GET** /data/doc/car/assets | 
*DocApi* | [**getCarClassDocs**](docs/DocApi.md#getcarclassdocs) | **GET** /data/doc/carclass | 
*DocApi* | [**getCarClassGetDocs**](docs/DocApi.md#getcarclassgetdocs) | **GET** /data/doc/carclass/get | 
*DocApi* | [**getCarDocs**](docs/DocApi.md#getcardocs) | **GET** /data/doc/car | 
*DocApi* | [**getCarGetDocs**](docs/DocApi.md#getcargetdocs) | **GET** /data/doc/car/get | 
*DocApi* | [**getConstantsCategoriesDocs**](docs/DocApi.md#getconstantscategoriesdocs) | **GET** /data/doc/constants/categories | 
*DocApi* | [**getConstantsDivisionsDocs**](docs/DocApi.md#getconstantsdivisionsdocs) | **GET** /data/doc/constants/divisions | 
*DocApi* | [**getConstantsDocs**](docs/DocApi.md#getconstantsdocs) | **GET** /data/doc/constants | 
*DocApi* | [**getConstantsEventTypesDocs**](docs/DocApi.md#getconstantseventtypesdocs) | **GET** /data/doc/constants/event_types | 
*DocApi* | [**getDocs**](docs/DocApi.md#getdocs) | **GET** /data/doc | 
*DocApi* | [**getDriverStatsByCategoryCategoryDocs**](docs/DocApi.md#getdriverstatsbycategorycategorydocs) | **GET** /data/doc/driver_stats_by_category/{category} | 
*DocApi* | [**getDriverStatsByCategoryDocs**](docs/DocApi.md#getdriverstatsbycategorydocs) | **GET** /data/doc/driver_stats_by_category | 
*DocApi* | [**getHostedCombinedSessionsDocs**](docs/DocApi.md#gethostedcombinedsessionsdocs) | **GET** /data/doc/hosted/combined_sessions | 
*DocApi* | [**getHostedDocs**](docs/DocApi.md#gethosteddocs) | **GET** /data/doc/hosted | 
*DocApi* | [**getHostedSessionsDocs**](docs/DocApi.md#gethostedsessionsdocs) | **GET** /data/doc/hosted/sessions | 
*DocApi* | [**getLeagueCustomerLeagueSessionsDocs**](docs/DocApi.md#getleaguecustomerleaguesessionsdocs) | **GET** /data/doc/league/cust_league_sessions | 
*DocApi* | [**getLeagueDirectoryDocs**](docs/DocApi.md#getleaguedirectorydocs) | **GET** /data/doc/league/directory | 
*DocApi* | [**getLeagueDocs**](docs/DocApi.md#getleaguedocs) | **GET** /data/doc/league | 
*DocApi* | [**getLeagueGetDocs**](docs/DocApi.md#getleaguegetdocs) | **GET** /data/doc/league/get | 
*DocApi* | [**getLeagueGetPointsSystemsDocs**](docs/DocApi.md#getleaguegetpointssystemsdocs) | **GET** /data/doc/league/get_points_systems | 
*DocApi* | [**getLeagueMembershipDocs**](docs/DocApi.md#getleaguemembershipdocs) | **GET** /data/doc/league/membership | 
*DocApi* | [**getLeagueRosterDocs**](docs/DocApi.md#getleaguerosterdocs) | **GET** /data/doc/league/roster | 
*DocApi* | [**getLeagueSeasonSessionsDocs**](docs/DocApi.md#getleagueseasonsessionsdocs) | **GET** /data/doc/league/season_sessions | 
*DocApi* | [**getLeagueSeasonStandingsDocs**](docs/DocApi.md#getleagueseasonstandingsdocs) | **GET** /data/doc/league/season_standings | 
*DocApi* | [**getLeagueSeasonsDocs**](docs/DocApi.md#getleagueseasonsdocs) | **GET** /data/doc/league/seasons | 
*DocApi* | [**getLookupCountriesDocs**](docs/DocApi.md#getlookupcountriesdocs) | **GET** /data/doc/lookup/countries | 
*DocApi* | [**getLookupDocs**](docs/DocApi.md#getlookupdocs) | **GET** /data/doc/lookup | 
*DocApi* | [**getLookupDriversDocs**](docs/DocApi.md#getlookupdriversdocs) | **GET** /data/doc/lookup/drivers | 
*DocApi* | [**getLookupFlairsDocs**](docs/DocApi.md#getlookupflairsdocs) | **GET** /data/doc/lookup/flairs | 
*DocApi* | [**getLookupGetDocs**](docs/DocApi.md#getlookupgetdocs) | **GET** /data/doc/lookup/get | 
*DocApi* | [**getLookupLicensesDocs**](docs/DocApi.md#getlookuplicensesdocs) | **GET** /data/doc/lookup/licenses | 
*DocApi* | [**getMemberAwardInstancesDocs**](docs/DocApi.md#getmemberawardinstancesdocs) | **GET** /data/doc/member/award_instances | 
*DocApi* | [**getMemberAwardsDocs**](docs/DocApi.md#getmemberawardsdocs) | **GET** /data/doc/member/awards | 
*DocApi* | [**getMemberChartDataDocs**](docs/DocApi.md#getmemberchartdatadocs) | **GET** /data/doc/member/chart_data | 
*DocApi* | [**getMemberDocs**](docs/DocApi.md#getmemberdocs) | **GET** /data/doc/member | 
*DocApi* | [**getMemberGetDocs**](docs/DocApi.md#getmembergetdocs) | **GET** /data/doc/member/get | 
*DocApi* | [**getMemberInfoDocs**](docs/DocApi.md#getmemberinfodocs) | **GET** /data/doc/member/info | 
*DocApi* | [**getMemberParticipationCreditsDocs**](docs/DocApi.md#getmemberparticipationcreditsdocs) | **GET** /data/doc/member/participation_credits | 
*DocApi* | [**getMemberProfileDocs**](docs/DocApi.md#getmemberprofiledocs) | **GET** /data/doc/member/profile | 
*DocApi* | [**getResultsDocs**](docs/DocApi.md#getresultsdocs) | **GET** /data/doc/results | 
*DocApi* | [**getResultsEventLogDocs**](docs/DocApi.md#getresultseventlogdocs) | **GET** /data/doc/results/event_log | 
*DocApi* | [**getResultsGetDocs**](docs/DocApi.md#getresultsgetdocs) | **GET** /data/doc/results/get | 
*DocApi* | [**getResultsLapChartDataDocs**](docs/DocApi.md#getresultslapchartdatadocs) | **GET** /data/doc/results/lap_chart_data | 
*DocApi* | [**getResultsLapDataDocs**](docs/DocApi.md#getresultslapdatadocs) | **GET** /data/doc/results/lap_data | 
*DocApi* | [**getResultsSearchHostedDocs**](docs/DocApi.md#getresultssearchhosteddocs) | **GET** /data/doc/results/search_hosted | 
*DocApi* | [**getResultsSearchSeriesDocs**](docs/DocApi.md#getresultssearchseriesdocs) | **GET** /data/doc/results/search_series | 
*DocApi* | [**getResultsSeasonResultsDocs**](docs/DocApi.md#getresultsseasonresultsdocs) | **GET** /data/doc/results/season_results | 
*DocApi* | [**getSeasonDocs**](docs/DocApi.md#getseasondocs) | **GET** /data/doc/season | 
*DocApi* | [**getSeasonListDocs**](docs/DocApi.md#getseasonlistdocs) | **GET** /data/doc/season/list | 
*DocApi* | [**getSeasonRaceGuideDocs**](docs/DocApi.md#getseasonraceguidedocs) | **GET** /data/doc/season/race_guide | 
*DocApi* | [**getSeasonSpectatorSubsessionIdsDetailDocs**](docs/DocApi.md#getseasonspectatorsubsessionidsdetaildocs) | **GET** /data/doc/season/spectator_subsessionids_detail | 
*DocApi* | [**getSeasonSpectatorSubsessionIdsDocs**](docs/DocApi.md#getseasonspectatorsubsessionidsdocs) | **GET** /data/doc/season/spectator_subsessionids | 
*DocApi* | [**getSeriesAssetsDocs**](docs/DocApi.md#getseriesassetsdocs) | **GET** /data/doc/series/assets | 
*DocApi* | [**getSeriesDocs**](docs/DocApi.md#getseriesdocs) | **GET** /data/doc/series | 
*DocApi* | [**getSeriesGetDocs**](docs/DocApi.md#getseriesgetdocs) | **GET** /data/doc/series/get | 
*DocApi* | [**getSeriesPastSeasonsDocs**](docs/DocApi.md#getseriespastseasonsdocs) | **GET** /data/doc/series/past_seasons | 
*DocApi* | [**getSeriesSeasonListDocs**](docs/DocApi.md#getseriesseasonlistdocs) | **GET** /data/doc/series/season_list | 
*DocApi* | [**getSeriesSeasonScheduleDocs**](docs/DocApi.md#getseriesseasonscheduledocs) | **GET** /data/doc/series/season_schedule | 
*DocApi* | [**getSeriesSeasonsDocs**](docs/DocApi.md#getseriesseasonsdocs) | **GET** /data/doc/series/seasons | 
*DocApi* | [**getSeriesStatsSeriesDocs**](docs/DocApi.md#getseriesstatsseriesdocs) | **GET** /data/doc/series/stats_series | 
*DocApi* | [**getStatsDocs**](docs/DocApi.md#getstatsdocs) | **GET** /data/doc/stats | 
*DocApi* | [**getStatsMemberBestsDocs**](docs/DocApi.md#getstatsmemberbestsdocs) | **GET** /data/doc/stats/member_bests | 
*DocApi* | [**getStatsMemberCareerDocs**](docs/DocApi.md#getstatsmembercareerdocs) | **GET** /data/doc/stats/member_career | 
*DocApi* | [**getStatsMemberDivisionDocs**](docs/DocApi.md#getstatsmemberdivisiondocs) | **GET** /data/doc/stats/member_division | 
*DocApi* | [**getStatsMemberRecapDocs**](docs/DocApi.md#getstatsmemberrecapdocs) | **GET** /data/doc/stats/member_recap | 
*DocApi* | [**getStatsMemberRecentRacesDocs**](docs/DocApi.md#getstatsmemberrecentracesdocs) | **GET** /data/doc/stats/member_recent_races | 
*DocApi* | [**getStatsMemberSummaryDocs**](docs/DocApi.md#getstatsmembersummarydocs) | **GET** /data/doc/stats/member_summary | 
*DocApi* | [**getStatsMemberYearlyDocs**](docs/DocApi.md#getstatsmemberyearlydocs) | **GET** /data/doc/stats/member_yearly | 
*DocApi* | [**getStatsSeasonDriverStandingsDocs**](docs/DocApi.md#getstatsseasondriverstandingsdocs) | **GET** /data/doc/stats/season_driver_standings | 
*DocApi* | [**getStatsSeasonQualifyResultsDocs**](docs/DocApi.md#getstatsseasonqualifyresultsdocs) | **GET** /data/doc/stats/season_qualify_results | 
*DocApi* | [**getStatsSeasonSupersessionStandingsDocs**](docs/DocApi.md#getstatsseasonsupersessionstandingsdocs) | **GET** /data/doc/stats/season_supersession_standings | 
*DocApi* | [**getStatsSeasonTTResultsDocs**](docs/DocApi.md#getstatsseasonttresultsdocs) | **GET** /data/doc/stats/season_tt_results | 
*DocApi* | [**getStatsSeasonTTStandingsDocs**](docs/DocApi.md#getstatsseasonttstandingsdocs) | **GET** /data/doc/stats/season_tt_standings | 
*DocApi* | [**getStatsSeasonTeamStandingsDocs**](docs/DocApi.md#getstatsseasonteamstandingsdocs) | **GET** /data/doc/stats/season_team_standings | 
*DocApi* | [**getStatsWorldRecordsDocs**](docs/DocApi.md#getstatsworldrecordsdocs) | **GET** /data/doc/stats/world_records | 
*DocApi* | [**getTeamDocs**](docs/DocApi.md#getteamdocs) | **GET** /data/doc/team | 
*DocApi* | [**getTeamGetDocs**](docs/DocApi.md#getteamgetdocs) | **GET** /data/doc/team/get | 
*DocApi* | [**getTeamMembershipDocs**](docs/DocApi.md#getteammembershipdocs) | **GET** /data/doc/team/membership | 
*DocApi* | [**getTimeAttackDocs**](docs/DocApi.md#gettimeattackdocs) | **GET** /data/doc/time_attack | 
*DocApi* | [**getTimeAttackMemberSeasonResultsDocs**](docs/DocApi.md#gettimeattackmemberseasonresultsdocs) | **GET** /data/doc/time_attack/member_season_results | 
*DocApi* | [**getTrackAssetsDocs**](docs/DocApi.md#gettrackassetsdocs) | **GET** /data/doc/track/assets | 
*DocApi* | [**getTrackDocs**](docs/DocApi.md#gettrackdocs) | **GET** /data/doc/track | 
*DocApi* | [**getTrackGetDocs**](docs/DocApi.md#gettrackgetdocs) | **GET** /data/doc/track/get | 
*DriverStatsApi* | [**getDriverStatsByCategory**](docs/DriverStatsApi.md#getdriverstatsbycategory) | **GET** /data/driver_stats_by_category/{category} | 
*DriverStatsApi* | [**getDriverStatsByCategoryCategoryDocs**](docs/DriverStatsApi.md#getdriverstatsbycategorycategorydocs) | **GET** /data/doc/driver_stats_by_category/{category} | 
*DriverStatsApi* | [**getDriverStatsByCategoryDocs**](docs/DriverStatsApi.md#getdriverstatsbycategorydocs) | **GET** /data/doc/driver_stats_by_category | 
*HostedApi* | [**getHostedCombinedSessions**](docs/HostedApi.md#gethostedcombinedsessions) | **GET** /data/hosted/combined_sessions | 
*HostedApi* | [**getHostedCombinedSessionsDocs**](docs/HostedApi.md#gethostedcombinedsessionsdocs) | **GET** /data/doc/hosted/combined_sessions | 
*HostedApi* | [**getHostedDocs**](docs/HostedApi.md#gethosteddocs) | **GET** /data/doc/hosted | 
*HostedApi* | [**getHostedSessions**](docs/HostedApi.md#gethostedsessions) | **GET** /data/hosted/sessions | 
*HostedApi* | [**getHostedSessionsDocs**](docs/HostedApi.md#gethostedsessionsdocs) | **GET** /data/doc/hosted/sessions | 
*LeagueApi* | [**getLeague**](docs/LeagueApi.md#getleague) | **GET** /data/league/get | 
*LeagueApi* | [**getLeagueCustomerLeagueSessions**](docs/LeagueApi.md#getleaguecustomerleaguesessions) | **GET** /data/league/cust_league_sessions | 
*LeagueApi* | [**getLeagueCustomerLeagueSessionsDocs**](docs/LeagueApi.md#getleaguecustomerleaguesessionsdocs) | **GET** /data/doc/league/cust_league_sessions | 
*LeagueApi* | [**getLeagueDirectory**](docs/LeagueApi.md#getleaguedirectory) | **GET** /data/league/directory | 
*LeagueApi* | [**getLeagueDirectoryDocs**](docs/LeagueApi.md#getleaguedirectorydocs) | **GET** /data/doc/league/directory | 
*LeagueApi* | [**getLeagueDocs**](docs/LeagueApi.md#getleaguedocs) | **GET** /data/doc/league | 
*LeagueApi* | [**getLeagueGetDocs**](docs/LeagueApi.md#getleaguegetdocs) | **GET** /data/doc/league/get | 
*LeagueApi* | [**getLeagueGetPointsSystemsDocs**](docs/LeagueApi.md#getleaguegetpointssystemsdocs) | **GET** /data/doc/league/get_points_systems | 
*LeagueApi* | [**getLeagueMembership**](docs/LeagueApi.md#getleaguemembership) | **GET** /data/league/membership | 
*LeagueApi* | [**getLeagueMembershipDocs**](docs/LeagueApi.md#getleaguemembershipdocs) | **GET** /data/doc/league/membership | 
*LeagueApi* | [**getLeaguePointsSystems**](docs/LeagueApi.md#getleaguepointssystems) | **GET** /data/league/get_points_systems | 
*LeagueApi* | [**getLeagueRoster**](docs/LeagueApi.md#getleagueroster) | **GET** /data/league/roster | 
*LeagueApi* | [**getLeagueRosterDocs**](docs/LeagueApi.md#getleaguerosterdocs) | **GET** /data/doc/league/roster | 
*LeagueApi* | [**getLeagueSeasonSessions**](docs/LeagueApi.md#getleagueseasonsessions) | **GET** /data/league/season_sessions | 
*LeagueApi* | [**getLeagueSeasonSessionsDocs**](docs/LeagueApi.md#getleagueseasonsessionsdocs) | **GET** /data/doc/league/season_sessions | 
*LeagueApi* | [**getLeagueSeasonStandings**](docs/LeagueApi.md#getleagueseasonstandings) | **GET** /data/league/season_standings | 
*LeagueApi* | [**getLeagueSeasonStandingsDocs**](docs/LeagueApi.md#getleagueseasonstandingsdocs) | **GET** /data/doc/league/season_standings | 
*LeagueApi* | [**getLeagueSeasons**](docs/LeagueApi.md#getleagueseasons) | **GET** /data/league/seasons | 
*LeagueApi* | [**getLeagueSeasonsDocs**](docs/LeagueApi.md#getleagueseasonsdocs) | **GET** /data/doc/league/seasons | 
*LookupApi* | [**getLookup**](docs/LookupApi.md#getlookup) | **GET** /data/lookup/get | 
*LookupApi* | [**getLookupCountries**](docs/LookupApi.md#getlookupcountries) | **GET** /data/lookup/countries | 
*LookupApi* | [**getLookupCountriesDocs**](docs/LookupApi.md#getlookupcountriesdocs) | **GET** /data/doc/lookup/countries | 
*LookupApi* | [**getLookupDocs**](docs/LookupApi.md#getlookupdocs) | **GET** /data/doc/lookup | 
*LookupApi* | [**getLookupDrivers**](docs/LookupApi.md#getlookupdrivers) | **GET** /data/lookup/drivers | 
*LookupApi* | [**getLookupDriversDocs**](docs/LookupApi.md#getlookupdriversdocs) | **GET** /data/doc/lookup/drivers | 
*LookupApi* | [**getLookupFlairs**](docs/LookupApi.md#getlookupflairs) | **GET** /data/lookup/flairs | 
*LookupApi* | [**getLookupFlairsDocs**](docs/LookupApi.md#getlookupflairsdocs) | **GET** /data/doc/lookup/flairs | 
*LookupApi* | [**getLookupGetDocs**](docs/LookupApi.md#getlookupgetdocs) | **GET** /data/doc/lookup/get | 
*LookupApi* | [**getLookupLicenses**](docs/LookupApi.md#getlookuplicenses) | **GET** /data/lookup/licenses | 
*LookupApi* | [**getLookupLicensesDocs**](docs/LookupApi.md#getlookuplicensesdocs) | **GET** /data/doc/lookup/licenses | 
*MemberApi* | [**getMember**](docs/MemberApi.md#getmember) | **GET** /data/member/get | 
*MemberApi* | [**getMemberAwardInstances**](docs/MemberApi.md#getmemberawardinstances) | **GET** /data/member/award_instances | 
*MemberApi* | [**getMemberAwardInstancesDocs**](docs/MemberApi.md#getmemberawardinstancesdocs) | **GET** /data/doc/member/award_instances | 
*MemberApi* | [**getMemberAwards**](docs/MemberApi.md#getmemberawards) | **GET** /data/member/awards | 
*MemberApi* | [**getMemberAwardsDocs**](docs/MemberApi.md#getmemberawardsdocs) | **GET** /data/doc/member/awards | 
*MemberApi* | [**getMemberChartData**](docs/MemberApi.md#getmemberchartdata) | **GET** /data/member/chart_data | 
*MemberApi* | [**getMemberChartDataDocs**](docs/MemberApi.md#getmemberchartdatadocs) | **GET** /data/doc/member/chart_data | 
*MemberApi* | [**getMemberDocs**](docs/MemberApi.md#getmemberdocs) | **GET** /data/doc/member | 
*MemberApi* | [**getMemberGetDocs**](docs/MemberApi.md#getmembergetdocs) | **GET** /data/doc/member/get | 
*MemberApi* | [**getMemberInfo**](docs/MemberApi.md#getmemberinfo) | **GET** /data/member/info | 
*MemberApi* | [**getMemberInfoDocs**](docs/MemberApi.md#getmemberinfodocs) | **GET** /data/doc/member/info | 
*MemberApi* | [**getMemberParticipationCredits**](docs/MemberApi.md#getmemberparticipationcredits) | **GET** /data/member/participation_credits | 
*MemberApi* | [**getMemberParticipationCreditsDocs**](docs/MemberApi.md#getmemberparticipationcreditsdocs) | **GET** /data/doc/member/participation_credits | 
*MemberApi* | [**getMemberProfile**](docs/MemberApi.md#getmemberprofile) | **GET** /data/member/profile | Gets a requested user\&#39;s profile.
*MemberApi* | [**getMemberProfileDocs**](docs/MemberApi.md#getmemberprofiledocs) | **GET** /data/doc/member/profile | 
*ResultsApi* | [**getResults**](docs/ResultsApi.md#getresults) | **GET** /data/results/get | 
*ResultsApi* | [**getResultsDocs**](docs/ResultsApi.md#getresultsdocs) | **GET** /data/doc/results | 
*ResultsApi* | [**getResultsEventLog**](docs/ResultsApi.md#getresultseventlog) | **GET** /data/results/event_log | 
*ResultsApi* | [**getResultsEventLogDocs**](docs/ResultsApi.md#getresultseventlogdocs) | **GET** /data/doc/results/event_log | 
*ResultsApi* | [**getResultsGetDocs**](docs/ResultsApi.md#getresultsgetdocs) | **GET** /data/doc/results/get | 
*ResultsApi* | [**getResultsLapChartData**](docs/ResultsApi.md#getresultslapchartdata) | **GET** /data/results/lap_chart_data | 
*ResultsApi* | [**getResultsLapChartDataDocs**](docs/ResultsApi.md#getresultslapchartdatadocs) | **GET** /data/doc/results/lap_chart_data | 
*ResultsApi* | [**getResultsLapData**](docs/ResultsApi.md#getresultslapdata) | **GET** /data/results/lap_data | 
*ResultsApi* | [**getResultsLapDataDocs**](docs/ResultsApi.md#getresultslapdatadocs) | **GET** /data/doc/results/lap_data | 
*ResultsApi* | [**getResultsSearchHosted**](docs/ResultsApi.md#getresultssearchhosted) | **GET** /data/results/search_hosted | 
*ResultsApi* | [**getResultsSearchHostedDocs**](docs/ResultsApi.md#getresultssearchhosteddocs) | **GET** /data/doc/results/search_hosted | 
*ResultsApi* | [**getResultsSearchSeries**](docs/ResultsApi.md#getresultssearchseries) | **GET** /data/results/search_series | 
*ResultsApi* | [**getResultsSearchSeriesDocs**](docs/ResultsApi.md#getresultssearchseriesdocs) | **GET** /data/doc/results/search_series | 
*ResultsApi* | [**getResultsSeasonResults**](docs/ResultsApi.md#getresultsseasonresults) | **GET** /data/results/season_results | 
*ResultsApi* | [**getResultsSeasonResultsDocs**](docs/ResultsApi.md#getresultsseasonresultsdocs) | **GET** /data/doc/results/season_results | 
*SeasonApi* | [**getSeasonDocs**](docs/SeasonApi.md#getseasondocs) | **GET** /data/doc/season | 
*SeasonApi* | [**getSeasonList**](docs/SeasonApi.md#getseasonlist) | **GET** /data/season/list | 
*SeasonApi* | [**getSeasonListDocs**](docs/SeasonApi.md#getseasonlistdocs) | **GET** /data/doc/season/list | 
*SeasonApi* | [**getSeasonRaceGuide**](docs/SeasonApi.md#getseasonraceguide) | **GET** /data/season/race_guide | 
*SeasonApi* | [**getSeasonRaceGuideDocs**](docs/SeasonApi.md#getseasonraceguidedocs) | **GET** /data/doc/season/race_guide | 
*SeasonApi* | [**getSeasonSpectatorSubsessionIdsDetailDocs**](docs/SeasonApi.md#getseasonspectatorsubsessionidsdetaildocs) | **GET** /data/doc/season/spectator_subsessionids_detail | 
*SeasonApi* | [**getSeasonSpectatorSubsessionIdsDocs**](docs/SeasonApi.md#getseasonspectatorsubsessionidsdocs) | **GET** /data/doc/season/spectator_subsessionids | 
*SeriesApi* | [**getSeries**](docs/SeriesApi.md#getseries) | **GET** /data/series/get | 
*SeriesApi* | [**getSeriesAssets**](docs/SeriesApi.md#getseriesassets) | **GET** /data/series/assets | 
*SeriesApi* | [**getSeriesAssetsDocs**](docs/SeriesApi.md#getseriesassetsdocs) | **GET** /data/doc/series/assets | 
*SeriesApi* | [**getSeriesDocs**](docs/SeriesApi.md#getseriesdocs) | **GET** /data/doc/series | 
*SeriesApi* | [**getSeriesGetDocs**](docs/SeriesApi.md#getseriesgetdocs) | **GET** /data/doc/series/get | 
*SeriesApi* | [**getSeriesPastSeasons**](docs/SeriesApi.md#getseriespastseasons) | **GET** /data/series/past_seasons | 
*SeriesApi* | [**getSeriesPastSeasonsDocs**](docs/SeriesApi.md#getseriespastseasonsdocs) | **GET** /data/doc/series/past_seasons | 
*SeriesApi* | [**getSeriesSeasonList**](docs/SeriesApi.md#getseriesseasonlist) | **GET** /data/series/season_list | 
*SeriesApi* | [**getSeriesSeasonListDocs**](docs/SeriesApi.md#getseriesseasonlistdocs) | **GET** /data/doc/series/season_list | 
*SeriesApi* | [**getSeriesSeasonSchedule**](docs/SeriesApi.md#getseriesseasonschedule) | **GET** /data/series/season_schedule | 
*SeriesApi* | [**getSeriesSeasonScheduleDocs**](docs/SeriesApi.md#getseriesseasonscheduledocs) | **GET** /data/doc/series/season_schedule | 
*SeriesApi* | [**getSeriesSeasons**](docs/SeriesApi.md#getseriesseasons) | **GET** /data/series/seasons | 
*SeriesApi* | [**getSeriesSeasonsDocs**](docs/SeriesApi.md#getseriesseasonsdocs) | **GET** /data/doc/series/seasons | 
*SeriesApi* | [**getSeriesStatsSeries**](docs/SeriesApi.md#getseriesstatsseries) | **GET** /data/series/stats_series | 
*SeriesApi* | [**getSeriesStatsSeriesDocs**](docs/SeriesApi.md#getseriesstatsseriesdocs) | **GET** /data/doc/series/stats_series | 
*StatsApi* | [**getStatsDocs**](docs/StatsApi.md#getstatsdocs) | **GET** /data/doc/stats | 
*StatsApi* | [**getStatsMemberBests**](docs/StatsApi.md#getstatsmemberbests) | **GET** /data/stats/member_bests | 
*StatsApi* | [**getStatsMemberBestsDocs**](docs/StatsApi.md#getstatsmemberbestsdocs) | **GET** /data/doc/stats/member_bests | 
*StatsApi* | [**getStatsMemberCareer**](docs/StatsApi.md#getstatsmembercareer) | **GET** /data/stats/member_career | 
*StatsApi* | [**getStatsMemberCareerDocs**](docs/StatsApi.md#getstatsmembercareerdocs) | **GET** /data/doc/stats/member_career | 
*StatsApi* | [**getStatsMemberDivision**](docs/StatsApi.md#getstatsmemberdivision) | **GET** /data/stats/member_division | 
*StatsApi* | [**getStatsMemberDivisionDocs**](docs/StatsApi.md#getstatsmemberdivisiondocs) | **GET** /data/doc/stats/member_division | 
*StatsApi* | [**getStatsMemberRecap**](docs/StatsApi.md#getstatsmemberrecap) | **GET** /data/stats/member_recap | 
*StatsApi* | [**getStatsMemberRecapDocs**](docs/StatsApi.md#getstatsmemberrecapdocs) | **GET** /data/doc/stats/member_recap | 
*StatsApi* | [**getStatsMemberRecentRaces**](docs/StatsApi.md#getstatsmemberrecentraces) | **GET** /data/stats/member_recent_races | 
*StatsApi* | [**getStatsMemberRecentRacesDocs**](docs/StatsApi.md#getstatsmemberrecentracesdocs) | **GET** /data/doc/stats/member_recent_races | 
*StatsApi* | [**getStatsMemberSummary**](docs/StatsApi.md#getstatsmembersummary) | **GET** /data/stats/member_summary | 
*StatsApi* | [**getStatsMemberSummaryDocs**](docs/StatsApi.md#getstatsmembersummarydocs) | **GET** /data/doc/stats/member_summary | 
*StatsApi* | [**getStatsMemberYearly**](docs/StatsApi.md#getstatsmemberyearly) | **GET** /data/stats/member_yearly | 
*StatsApi* | [**getStatsMemberYearlyDocs**](docs/StatsApi.md#getstatsmemberyearlydocs) | **GET** /data/doc/stats/member_yearly | 
*StatsApi* | [**getStatsSeasonDriverStandings**](docs/StatsApi.md#getstatsseasondriverstandings) | **GET** /data/stats/season_driver_standings | 
*StatsApi* | [**getStatsSeasonDriverStandingsDocs**](docs/StatsApi.md#getstatsseasondriverstandingsdocs) | **GET** /data/doc/stats/season_driver_standings | 
*StatsApi* | [**getStatsSeasonQualifyResults**](docs/StatsApi.md#getstatsseasonqualifyresults) | **GET** /data/stats/season_qualify_results | 
*StatsApi* | [**getStatsSeasonQualifyResultsDocs**](docs/StatsApi.md#getstatsseasonqualifyresultsdocs) | **GET** /data/doc/stats/season_qualify_results | 
*StatsApi* | [**getStatsSeasonSupersessionStandings**](docs/StatsApi.md#getstatsseasonsupersessionstandings) | **GET** /data/stats/season_supersession_standings | 
*StatsApi* | [**getStatsSeasonSupersessionStandingsDocs**](docs/StatsApi.md#getstatsseasonsupersessionstandingsdocs) | **GET** /data/doc/stats/season_supersession_standings | 
*StatsApi* | [**getStatsSeasonTTResultsDocs**](docs/StatsApi.md#getstatsseasonttresultsdocs) | **GET** /data/doc/stats/season_tt_results | 
*StatsApi* | [**getStatsSeasonTTStandingsDocs**](docs/StatsApi.md#getstatsseasonttstandingsdocs) | **GET** /data/doc/stats/season_tt_standings | 
*StatsApi* | [**getStatsSeasonTeamStandings**](docs/StatsApi.md#getstatsseasonteamstandings) | **GET** /data/stats/season_team_standings | 
*StatsApi* | [**getStatsSeasonTeamStandingsDocs**](docs/StatsApi.md#getstatsseasonteamstandingsdocs) | **GET** /data/doc/stats/season_team_standings | 
*StatsApi* | [**getStatsSeasonTimeTrialResults**](docs/StatsApi.md#getstatsseasontimetrialresults) | **GET** /data/stats/season_time_trial_results | 
*StatsApi* | [**getStatsSeasonTimeTrialStandings**](docs/StatsApi.md#getstatsseasontimetrialstandings) | **GET** /data/stats/season_time_trial_standings | 
*StatsApi* | [**getStatsWorldRecords**](docs/StatsApi.md#getstatsworldrecords) | **GET** /data/stats/world_records | 
*StatsApi* | [**getStatsWorldRecordsDocs**](docs/StatsApi.md#getstatsworldrecordsdocs) | **GET** /data/doc/stats/world_records | 
*TeamApi* | [**getTeam**](docs/TeamApi.md#getteam) | **GET** /data/team/get | 
*TeamApi* | [**getTeamDocs**](docs/TeamApi.md#getteamdocs) | **GET** /data/doc/team | 
*TeamApi* | [**getTeamGetDocs**](docs/TeamApi.md#getteamgetdocs) | **GET** /data/doc/team/get | 
*TeamApi* | [**getTeamMembership**](docs/TeamApi.md#getteammembership) | **GET** /data/team/membership | 
*TeamApi* | [**getTeamMembershipDocs**](docs/TeamApi.md#getteammembershipdocs) | **GET** /data/doc/team/membership | 
*TimeAttackApi* | [**getTimeAttackDocs**](docs/TimeAttackApi.md#gettimeattackdocs) | **GET** /data/doc/time_attack | 
*TimeAttackApi* | [**getTimeAttackMemberSeasonResults**](docs/TimeAttackApi.md#gettimeattackmemberseasonresults) | **GET** /data/time_attack/member_season_results | 
*TimeAttackApi* | [**getTimeAttackMemberSeasonResultsDocs**](docs/TimeAttackApi.md#gettimeattackmemberseasonresultsdocs) | **GET** /data/doc/time_attack/member_season_results | 
*TrackApi* | [**getTrack**](docs/TrackApi.md#gettrack) | **GET** /data/track/get | 
*TrackApi* | [**getTrackAssets**](docs/TrackApi.md#gettrackassets) | **GET** /data/track/assets | 
*TrackApi* | [**getTrackAssetsDocs**](docs/TrackApi.md#gettrackassetsdocs) | **GET** /data/doc/track/assets | 
*TrackApi* | [**getTrackDocs**](docs/TrackApi.md#gettrackdocs) | **GET** /data/doc/track | 
*TrackApi* | [**getTrackGetDocs**](docs/TrackApi.md#gettrackgetdocs) | **GET** /data/doc/track/get | 


### Documentation For Models

 - [ErrorResponse](docs/ErrorResponse.md)
 - [IracingAPIResponse](docs/IracingAPIResponse.md)
 - [IracingCategory](docs/IracingCategory.md)
 - [IracingChartType](docs/IracingChartType.md)
 - [IracingDivision](docs/IracingDivision.md)
 - [IracingEventType](docs/IracingEventType.md)
 - [IracingServiceMethodDocs](docs/IracingServiceMethodDocs.md)
 - [IracingServiceMethodParametersDocs](docs/IracingServiceMethodParametersDocs.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization


Authentication schemes defined for the API:
<a id="bearerAuth"></a>
### bearerAuth

- **Type**: Bearer authentication (JWT)

<a id="oAuth2"></a>
### oAuth2

- **Type**: OAuth
- **Flow**: accessCode
- **Authorization URL**: https://oauth.iracing.com/oauth2/authorize
- **Scopes**: 
 - **iracing.auth**: Authorization for iRacing services.
 - **iracing.profile**: Access to the iRacing profile.

