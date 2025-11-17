## @iracing-data/api-client-axios@0.0.1

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
npm install @iracing-data/api-client-axios@0.0.1 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *https://members-ng.iracing.com*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*AuthApi* | [**postAuth**](docs/AuthApi.md#postauth) | **POST** /auth | 
*CarApi* | [**getCar**](docs/CarApi.md#getcar) | **GET** /data/car/get | 
*CarApi* | [**getCarAssets**](docs/CarApi.md#getcarassets) | **GET** /data/car/assets | 
*CarclassApi* | [**getCarClass**](docs/CarclassApi.md#getcarclass) | **GET** /data/carclass/get | Gets car classes.
*ConstantsApi* | [**getConstantsCategories**](docs/ConstantsApi.md#getconstantscategories) | **GET** /data/constants/categories | 
*ConstantsApi* | [**getConstantsDivisions**](docs/ConstantsApi.md#getconstantsdivisions) | **GET** /data/constants/divisions | 
*ConstantsApi* | [**getConstantsEventTypes**](docs/ConstantsApi.md#getconstantseventtypes) | **GET** /data/constants/event_types | 
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
*HostedApi* | [**getHostedCombinedSessions**](docs/HostedApi.md#gethostedcombinedsessions) | **GET** /data/hosted/combined_sessions | 
*HostedApi* | [**getHostedSessions**](docs/HostedApi.md#gethostedsessions) | **GET** /data/hosted/sessions | 
*LeagueApi* | [**getLeague**](docs/LeagueApi.md#getleague) | **GET** /data/league/get | 
*LeagueApi* | [**getLeagueCustomerLeagueSessions**](docs/LeagueApi.md#getleaguecustomerleaguesessions) | **GET** /data/league/cust_league_sessions | 
*LeagueApi* | [**getLeagueDirectory**](docs/LeagueApi.md#getleaguedirectory) | **GET** /data/league/directory | 
*LeagueApi* | [**getLeagueMembership**](docs/LeagueApi.md#getleaguemembership) | **GET** /data/league/membership | 
*LeagueApi* | [**getLeaguePointsSystems**](docs/LeagueApi.md#getleaguepointssystems) | **GET** /data/league/get_points_systems | 
*LeagueApi* | [**getLeagueRoster**](docs/LeagueApi.md#getleagueroster) | **GET** /data/league/roster | 
*LeagueApi* | [**getLeagueSeasonSessions**](docs/LeagueApi.md#getleagueseasonsessions) | **GET** /data/league/season_sessions | 
*LeagueApi* | [**getLeagueSeasonStandings**](docs/LeagueApi.md#getleagueseasonstandings) | **GET** /data/league/season_standings | 
*LeagueApi* | [**getLeagueSeasons**](docs/LeagueApi.md#getleagueseasons) | **GET** /data/league/seasons | 
*LookupApi* | [**getLookup**](docs/LookupApi.md#getlookup) | **GET** /data/lookup/get | 
*LookupApi* | [**getLookupCountries**](docs/LookupApi.md#getlookupcountries) | **GET** /data/lookup/countries | 
*LookupApi* | [**getLookupDrivers**](docs/LookupApi.md#getlookupdrivers) | **GET** /data/lookup/drivers | 
*LookupApi* | [**getLookupFlairs**](docs/LookupApi.md#getlookupflairs) | **GET** /data/lookup/flairs | 
*LookupApi* | [**getLookupLicenses**](docs/LookupApi.md#getlookuplicenses) | **GET** /data/lookup/licenses | 
*MemberApi* | [**getMember**](docs/MemberApi.md#getmember) | **GET** /data/member/get | 
*MemberApi* | [**getMemberAwardInstances**](docs/MemberApi.md#getmemberawardinstances) | **GET** /data/member/award_instances | 
*MemberApi* | [**getMemberAwards**](docs/MemberApi.md#getmemberawards) | **GET** /data/member/awards | 
*MemberApi* | [**getMemberChartData**](docs/MemberApi.md#getmemberchartdata) | **GET** /data/member/chart_data | 
*MemberApi* | [**getMemberInfo**](docs/MemberApi.md#getmemberinfo) | **GET** /data/member/info | 
*MemberApi* | [**getMemberParticipationCredits**](docs/MemberApi.md#getmemberparticipationcredits) | **GET** /data/member/participation_credits | 
*MemberApi* | [**getMemberProfile**](docs/MemberApi.md#getmemberprofile) | **GET** /data/member/profile | Gets a requested user\&#39;s profile.
*ResultsApi* | [**getResults**](docs/ResultsApi.md#getresults) | **GET** /data/results/get | 
*ResultsApi* | [**getResultsEventLog**](docs/ResultsApi.md#getresultseventlog) | **GET** /data/results/event_log | 
*ResultsApi* | [**getResultsLapChartData**](docs/ResultsApi.md#getresultslapchartdata) | **GET** /data/results/lap_chart_data | 
*ResultsApi* | [**getResultsLapData**](docs/ResultsApi.md#getresultslapdata) | **GET** /data/results/lap_data | 
*ResultsApi* | [**getResultsSearchHosted**](docs/ResultsApi.md#getresultssearchhosted) | **GET** /data/results/search_hosted | 
*ResultsApi* | [**getResultsSearchSeries**](docs/ResultsApi.md#getresultssearchseries) | **GET** /data/results/search_series | 
*ResultsApi* | [**getResultsSeasonResults**](docs/ResultsApi.md#getresultsseasonresults) | **GET** /data/results/season_results | 
*SeasonApi* | [**getSeasonList**](docs/SeasonApi.md#getseasonlist) | **GET** /data/season/list | 
*SeasonApi* | [**getSeasonRaceGuide**](docs/SeasonApi.md#getseasonraceguide) | **GET** /data/season/race_guide | 
*SeasonApi* | [**getSeasonSpectatorSubsessionIds**](docs/SeasonApi.md#getseasonspectatorsubsessionids) | **GET** /data/season/spectator_subsessionids | 
*SeasonApi* | [**getSeasonSpectatorSubsessionIdsDetail**](docs/SeasonApi.md#getseasonspectatorsubsessionidsdetail) | **GET** /data/season/spectator_subsessionids_detail | 
*SeriesApi* | [**getSeries**](docs/SeriesApi.md#getseries) | **GET** /data/series/get | 
*SeriesApi* | [**getSeriesAssets**](docs/SeriesApi.md#getseriesassets) | **GET** /data/series/assets | 
*SeriesApi* | [**getSeriesPastSeasons**](docs/SeriesApi.md#getseriespastseasons) | **GET** /data/series/past_seasons | 
*SeriesApi* | [**getSeriesSeasonList**](docs/SeriesApi.md#getseriesseasonlist) | **GET** /data/series/season_list | 
*SeriesApi* | [**getSeriesSeasonSchedule**](docs/SeriesApi.md#getseriesseasonschedule) | **GET** /data/series/season_schedule | 
*SeriesApi* | [**getSeriesSeasons**](docs/SeriesApi.md#getseriesseasons) | **GET** /data/series/seasons | 
*SeriesApi* | [**getSeriesStatsSeries**](docs/SeriesApi.md#getseriesstatsseries) | **GET** /data/series/stats_series | 
*StatsApi* | [**getStatsMemberBests**](docs/StatsApi.md#getstatsmemberbests) | **GET** /data/stats/member_bests | 
*StatsApi* | [**getStatsMemberCareer**](docs/StatsApi.md#getstatsmembercareer) | **GET** /data/stats/member_career | 
*StatsApi* | [**getStatsMemberDivision**](docs/StatsApi.md#getstatsmemberdivision) | **GET** /data/stats/member_division | 
*StatsApi* | [**getStatsMemberRecap**](docs/StatsApi.md#getstatsmemberrecap) | **GET** /data/stats/member_recap | 
*StatsApi* | [**getStatsMemberRecentRaces**](docs/StatsApi.md#getstatsmemberrecentraces) | **GET** /data/stats/member_recent_races | 
*StatsApi* | [**getStatsMemberSummary**](docs/StatsApi.md#getstatsmembersummary) | **GET** /data/stats/member_summary | 
*StatsApi* | [**getStatsMemberYearly**](docs/StatsApi.md#getstatsmemberyearly) | **GET** /data/stats/member_yearly | 
*StatsApi* | [**getStatsSeasonDriverStandings**](docs/StatsApi.md#getstatsseasondriverstandings) | **GET** /data/stats/season_driver_standings | 
*StatsApi* | [**getStatsSeasonQualifyResults**](docs/StatsApi.md#getstatsseasonqualifyresults) | **GET** /data/stats/season_qualify_results | 
*StatsApi* | [**getStatsSeasonSupersessionStandings**](docs/StatsApi.md#getstatsseasonsupersessionstandings) | **GET** /data/stats/season_supersession_standings | 
*StatsApi* | [**getStatsSeasonTeamStandings**](docs/StatsApi.md#getstatsseasonteamstandings) | **GET** /data/stats/season_team_standings | 
*StatsApi* | [**getStatsSeasonTimeTrialResults**](docs/StatsApi.md#getstatsseasontimetrialresults) | **GET** /data/stats/season_time_trial_results | 
*StatsApi* | [**getStatsSeasonTimeTrialStandings**](docs/StatsApi.md#getstatsseasontimetrialstandings) | **GET** /data/stats/season_time_trial_standings | 
*StatsApi* | [**getStatsWorldRecords**](docs/StatsApi.md#getstatsworldrecords) | **GET** /data/stats/world_records | 
*TeamApi* | [**getTeam**](docs/TeamApi.md#getteam) | **GET** /data/team/get | 
*TeamApi* | [**getTeamMembership**](docs/TeamApi.md#getteammembership) | **GET** /data/team/membership | 
*TimeAttackApi* | [**getTimeAttackMemberSeasonResults**](docs/TimeAttackApi.md#gettimeattackmemberseasonresults) | **GET** /data/time_attack/member_season_results | 
*TrackApi* | [**getTrack**](docs/TrackApi.md#gettrack) | **GET** /data/track/get | 
*TrackApi* | [**getTrackAssets**](docs/TrackApi.md#gettrackassets) | **GET** /data/track/assets | 


### Documentation For Models

 - [ErrorResponse](docs/ErrorResponse.md)
 - [IracingAPIResponse](docs/IracingAPIResponse.md)
 - [IracingCategory](docs/IracingCategory.md)
 - [IracingDivision](docs/IracingDivision.md)
 - [IracingEventType](docs/IracingEventType.md)
 - [IracingServiceMethodDocs](docs/IracingServiceMethodDocs.md)
 - [IracingServiceMethodParametersDocs](docs/IracingServiceMethodParametersDocs.md)
 - [PostAuthRequest](docs/PostAuthRequest.md)


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

