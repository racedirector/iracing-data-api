# DocApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**dataDocSeasonSpectatorSubsessionidsDetailGet**](#datadocseasonspectatorsubsessionidsdetailget) | **GET** /data/doc/season/spectator_subsessionids_detail | |
|[**dataDocSeasonSpectatorSubsessionidsGet**](#datadocseasonspectatorsubsessionidsget) | **GET** /data/doc/season/spectator_subsessionids | |
|[**dataDocSeriesAssetsGet**](#datadocseriesassetsget) | **GET** /data/doc/series/assets | |
|[**dataDocSeriesGet**](#datadocseriesget) | **GET** /data/doc/series | |
|[**dataDocSeriesGetGet**](#datadocseriesgetget) | **GET** /data/doc/series/get | |
|[**dataDocSeriesPastSeasonsGet**](#datadocseriespastseasonsget) | **GET** /data/doc/series/past_seasons | |
|[**dataDocSeriesSeasonListGet**](#datadocseriesseasonlistget) | **GET** /data/doc/series/season_list | |
|[**dataDocSeriesSeasonScheduleGet**](#datadocseriesseasonscheduleget) | **GET** /data/doc/series/season_schedule | |
|[**dataDocSeriesSeasonsGet**](#datadocseriesseasonsget) | **GET** /data/doc/series/seasons | |
|[**dataDocSeriesStatsSeriesGet**](#datadocseriesstatsseriesget) | **GET** /data/doc/series/stats_series | |
|[**dataDocStatsGet**](#datadocstatsget) | **GET** /data/doc/stats | |
|[**dataDocStatsMemberBestsGet**](#datadocstatsmemberbestsget) | **GET** /data/doc/stats/member_bests | |
|[**dataDocStatsMemberCareerGet**](#datadocstatsmembercareerget) | **GET** /data/doc/stats/member_career | |
|[**dataDocStatsMemberDivisionGet**](#datadocstatsmemberdivisionget) | **GET** /data/doc/stats/member_division | |
|[**dataDocStatsMemberRecapGet**](#datadocstatsmemberrecapget) | **GET** /data/doc/stats/member_recap | |
|[**dataDocStatsMemberRecentRacesGet**](#datadocstatsmemberrecentracesget) | **GET** /data/doc/stats/member_recent_races | |
|[**dataDocStatsMemberSummaryGet**](#datadocstatsmembersummaryget) | **GET** /data/doc/stats/member_summary | |
|[**dataDocStatsMemberYearlyGet**](#datadocstatsmemberyearlyget) | **GET** /data/doc/stats/member_yearly | |
|[**dataDocStatsSeasonDriverStandingsGet**](#datadocstatsseasondriverstandingsget) | **GET** /data/doc/stats/season_driver_standings | |
|[**dataDocStatsSeasonQualifyResultsGet**](#datadocstatsseasonqualifyresultsget) | **GET** /data/doc/stats/season_qualify_results | |
|[**dataDocStatsSeasonSupersessionStandingsGet**](#datadocstatsseasonsupersessionstandingsget) | **GET** /data/doc/stats/season_supersession_standings | |
|[**dataDocStatsSeasonTeamStandingsGet**](#datadocstatsseasonteamstandingsget) | **GET** /data/doc/stats/season_team_standings | |
|[**dataDocStatsSeasonTtResultsGet**](#datadocstatsseasonttresultsget) | **GET** /data/doc/stats/season_tt_results | |
|[**dataDocStatsSeasonTtStandingsGet**](#datadocstatsseasonttstandingsget) | **GET** /data/doc/stats/season_tt_standings | |
|[**dataDocStatsWorldRecordsGet**](#datadocstatsworldrecordsget) | **GET** /data/doc/stats/world_records | |
|[**dataDocTimeAttackGet**](#datadoctimeattackget) | **GET** /data/doc/time_attack | |
|[**dataDocTimeAttackMemberSeasonResultsGet**](#datadoctimeattackmemberseasonresultsget) | **GET** /data/doc/time_attack/member_season_results | |
|[**dataDocTrackAssetsGet**](#datadoctrackassetsget) | **GET** /data/doc/track/assets | |
|[**dataDocTrackGet**](#datadoctrackget) | **GET** /data/doc/track | |
|[**dataDocTrackGetGet**](#datadoctrackgetget) | **GET** /data/doc/track/get | |
|[**getCarAssetsDocs**](#getcarassetsdocs) | **GET** /data/doc/car/assets | |
|[**getCarClassDocs**](#getcarclassdocs) | **GET** /data/doc/carclass | |
|[**getCarClassGetDocs**](#getcarclassgetdocs) | **GET** /data/doc/carclass/get | |
|[**getCarDocs**](#getcardocs) | **GET** /data/doc/car | |
|[**getCarGetDocs**](#getcargetdocs) | **GET** /data/doc/car/get | |
|[**getConstantsCategoriesDocs**](#getconstantscategoriesdocs) | **GET** /data/doc/constants/categories | |
|[**getConstantsDivisionsDocs**](#getconstantsdivisionsdocs) | **GET** /data/doc/constants/divisions | |
|[**getConstantsDocs**](#getconstantsdocs) | **GET** /data/doc/constants | |
|[**getConstantsEventTypesDocs**](#getconstantseventtypesdocs) | **GET** /data/doc/constants/event_types | |
|[**getDocs**](#getdocs) | **GET** /data/doc | |
|[**getDriverStatsByCategoryCategoryDocs**](#getdriverstatsbycategorycategorydocs) | **GET** /data/doc/driver_stats_by_category/{category} | |
|[**getDriverStatsByCategoryDocs**](#getdriverstatsbycategorydocs) | **GET** /data/doc/driver_stats_by_category | |
|[**getHostedCombinedSessionsDocs**](#gethostedcombinedsessionsdocs) | **GET** /data/doc/hosted/combined_sessions | |
|[**getHostedDocs**](#gethosteddocs) | **GET** /data/doc/hosted | |
|[**getHostedSessionsDocs**](#gethostedsessionsdocs) | **GET** /data/doc/hosted/sessions | |
|[**getLeagueCustomerLeagueSessionsDocs**](#getleaguecustomerleaguesessionsdocs) | **GET** /data/doc/league/cust_league_sessions | |
|[**getLeagueDirectoryDocs**](#getleaguedirectorydocs) | **GET** /data/doc/league/directory | |
|[**getLeagueDocs**](#getleaguedocs) | **GET** /data/doc/league | |
|[**getLeagueGetDocs**](#getleaguegetdocs) | **GET** /data/doc/league/get | |
|[**getLeagueGetPointsSystemsDocs**](#getleaguegetpointssystemsdocs) | **GET** /data/doc/league/get_points_systems | |
|[**getLeagueMembershipDocs**](#getleaguemembershipdocs) | **GET** /data/doc/league/membership | |
|[**getLeagueRosterDocs**](#getleaguerosterdocs) | **GET** /data/doc/league/roster | |
|[**getLeagueSeasonSessionsDocs**](#getleagueseasonsessionsdocs) | **GET** /data/doc/league/season_sessions | |
|[**getLeagueSeasonStandingsDocs**](#getleagueseasonstandingsdocs) | **GET** /data/doc/league/season_standings | |
|[**getLeagueSeasonsDocs**](#getleagueseasonsdocs) | **GET** /data/doc/league/seasons | |
|[**getLookupCountriesDocs**](#getlookupcountriesdocs) | **GET** /data/doc/lookup/countries | |
|[**getLookupDocs**](#getlookupdocs) | **GET** /data/doc/lookup | |
|[**getLookupDriversDocs**](#getlookupdriversdocs) | **GET** /data/doc/lookup/drivers | |
|[**getLookupFlairsDocs**](#getlookupflairsdocs) | **GET** /data/doc/lookup/flairs | |
|[**getLookupGetDocs**](#getlookupgetdocs) | **GET** /data/doc/lookup/get | |
|[**getLookupLicensesDocs**](#getlookuplicensesdocs) | **GET** /data/doc/lookup/licenses | |
|[**getMemberAwardInstancesDocs**](#getmemberawardinstancesdocs) | **GET** /data/doc/member/award_instances | |
|[**getMemberAwardsDocs**](#getmemberawardsdocs) | **GET** /data/doc/member/awards | |
|[**getMemberChartDataDocs**](#getmemberchartdatadocs) | **GET** /data/doc/member/chart_data | |
|[**getMemberDocs**](#getmemberdocs) | **GET** /data/doc/member | |
|[**getMemberGetDocs**](#getmembergetdocs) | **GET** /data/doc/member/get | |
|[**getMemberInfoDocs**](#getmemberinfodocs) | **GET** /data/doc/member/info | |
|[**getMemberParticipationCreditsDocs**](#getmemberparticipationcreditsdocs) | **GET** /data/doc/member/participation_credits | |
|[**getMemberProfileDocs**](#getmemberprofiledocs) | **GET** /data/doc/member/profile | |
|[**getResultsDocs**](#getresultsdocs) | **GET** /data/doc/results | |
|[**getResultsEventLogDocs**](#getresultseventlogdocs) | **GET** /data/doc/results/event_log | |
|[**getResultsGetDocs**](#getresultsgetdocs) | **GET** /data/doc/results/get | |
|[**getResultsLapChartDataDocs**](#getresultslapchartdatadocs) | **GET** /data/doc/results/lap_chart_data | |
|[**getResultsLapDataDocs**](#getresultslapdatadocs) | **GET** /data/doc/results/lap_data | |
|[**getResultsSearchHostedDocs**](#getresultssearchhosteddocs) | **GET** /data/doc/results/search_hosted | |
|[**getResultsSearchSeriesDocs**](#getresultssearchseriesdocs) | **GET** /data/doc/results/search_series | |
|[**getResultsSeasonResultsDocs**](#getresultsseasonresultsdocs) | **GET** /data/doc/results/season_results | |
|[**getSeasonDocs**](#getseasondocs) | **GET** /data/doc/season | |
|[**getSeasonListDocs**](#getseasonlistdocs) | **GET** /data/doc/season/list | |
|[**getSeasonRaceGuideDocs**](#getseasonraceguidedocs) | **GET** /data/doc/season/race_guide | |
|[**getTeamDocs**](#getteamdocs) | **GET** /data/doc/team | |
|[**getTeamGetDocs**](#getteamgetdocs) | **GET** /data/doc/team/get | |
|[**getTeamMembershipDocs**](#getteammembershipdocs) | **GET** /data/doc/team/membership | |

# **dataDocSeasonSpectatorSubsessionidsDetailGet**
> IracingServiceMethodDocs dataDocSeasonSpectatorSubsessionidsDetailGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeasonSpectatorSubsessionidsDetailGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocSeasonSpectatorSubsessionidsGet**
> IracingServiceMethodDocs dataDocSeasonSpectatorSubsessionidsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeasonSpectatorSubsessionidsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocSeriesAssetsGet**
> IracingServiceMethodDocs dataDocSeriesAssetsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeriesAssetsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocSeriesGet**
> { [key: string]: IracingServiceMethodDocs; } dataDocSeriesGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeriesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocSeriesGetGet**
> IracingServiceMethodDocs dataDocSeriesGetGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeriesGetGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocSeriesPastSeasonsGet**
> IracingServiceMethodDocs dataDocSeriesPastSeasonsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeriesPastSeasonsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocSeriesSeasonListGet**
> IracingServiceMethodDocs dataDocSeriesSeasonListGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeriesSeasonListGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocSeriesSeasonScheduleGet**
> IracingServiceMethodDocs dataDocSeriesSeasonScheduleGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeriesSeasonScheduleGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocSeriesSeasonsGet**
> IracingServiceMethodDocs dataDocSeriesSeasonsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeriesSeasonsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocSeriesStatsSeriesGet**
> IracingServiceMethodDocs dataDocSeriesStatsSeriesGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocSeriesStatsSeriesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsGet**
> { [key: string]: IracingServiceMethodDocs; } dataDocStatsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsMemberBestsGet**
> IracingServiceMethodDocs dataDocStatsMemberBestsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsMemberBestsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsMemberCareerGet**
> IracingServiceMethodDocs dataDocStatsMemberCareerGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsMemberCareerGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsMemberDivisionGet**
> IracingServiceMethodDocs dataDocStatsMemberDivisionGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsMemberDivisionGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsMemberRecapGet**
> IracingServiceMethodDocs dataDocStatsMemberRecapGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsMemberRecapGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsMemberRecentRacesGet**
> IracingServiceMethodDocs dataDocStatsMemberRecentRacesGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsMemberRecentRacesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsMemberSummaryGet**
> IracingServiceMethodDocs dataDocStatsMemberSummaryGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsMemberSummaryGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsMemberYearlyGet**
> IracingServiceMethodDocs dataDocStatsMemberYearlyGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsMemberYearlyGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsSeasonDriverStandingsGet**
> IracingServiceMethodDocs dataDocStatsSeasonDriverStandingsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsSeasonDriverStandingsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsSeasonQualifyResultsGet**
> IracingServiceMethodDocs dataDocStatsSeasonQualifyResultsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsSeasonQualifyResultsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsSeasonSupersessionStandingsGet**
> IracingServiceMethodDocs dataDocStatsSeasonSupersessionStandingsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsSeasonSupersessionStandingsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsSeasonTeamStandingsGet**
> IracingServiceMethodDocs dataDocStatsSeasonTeamStandingsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsSeasonTeamStandingsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsSeasonTtResultsGet**
> IracingServiceMethodDocs dataDocStatsSeasonTtResultsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsSeasonTtResultsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsSeasonTtStandingsGet**
> IracingServiceMethodDocs dataDocStatsSeasonTtStandingsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsSeasonTtStandingsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocStatsWorldRecordsGet**
> IracingServiceMethodDocs dataDocStatsWorldRecordsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocStatsWorldRecordsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocTimeAttackGet**
> { [key: string]: IracingServiceMethodDocs; } dataDocTimeAttackGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocTimeAttackGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocTimeAttackMemberSeasonResultsGet**
> IracingServiceMethodDocs dataDocTimeAttackMemberSeasonResultsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocTimeAttackMemberSeasonResultsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocTrackAssetsGet**
> IracingServiceMethodDocs dataDocTrackAssetsGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocTrackAssetsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocTrackGet**
> { [key: string]: IracingServiceMethodDocs; } dataDocTrackGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocTrackGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dataDocTrackGetGet**
> IracingServiceMethodDocs dataDocTrackGetGet()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.dataDocTrackGetGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCarAssetsDocs**
> IracingServiceMethodDocs getCarAssetsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getCarAssetsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCarClassDocs**
> { [key: string]: IracingServiceMethodDocs; } getCarClassDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getCarClassDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCarClassGetDocs**
> IracingServiceMethodDocs getCarClassGetDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getCarClassGetDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCarDocs**
> { [key: string]: IracingServiceMethodDocs; } getCarDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getCarDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCarGetDocs**
> IracingServiceMethodDocs getCarGetDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getCarGetDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getConstantsCategoriesDocs**
> IracingServiceMethodDocs getConstantsCategoriesDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getConstantsCategoriesDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getConstantsDivisionsDocs**
> IracingServiceMethodDocs getConstantsDivisionsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getConstantsDivisionsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getConstantsDocs**
> { [key: string]: IracingServiceMethodDocs; } getConstantsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getConstantsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getConstantsEventTypesDocs**
> IracingServiceMethodDocs getConstantsEventTypesDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getConstantsEventTypesDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDocs**
> { [key: string]: { [key: string]: IracingServiceMethodDocs; }; } getDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: { [key: string]: IracingServiceMethodDocs; }; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDriverStatsByCategoryCategoryDocs**
> IracingServiceMethodDocs getDriverStatsByCategoryCategoryDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

let category: IracingCategory; //Racing category. (default to undefined)

const { status, data } = await apiInstance.getDriverStatsByCategoryCategoryDocs(
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | **IracingCategory** | Racing category. | defaults to undefined|


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDriverStatsByCategoryDocs**
> { [key: string]: IracingServiceMethodDocs; } getDriverStatsByCategoryDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getDriverStatsByCategoryDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHostedCombinedSessionsDocs**
> IracingServiceMethodDocs getHostedCombinedSessionsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getHostedCombinedSessionsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHostedDocs**
> { [key: string]: IracingServiceMethodDocs; } getHostedDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getHostedDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHostedSessionsDocs**
> IracingServiceMethodDocs getHostedSessionsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getHostedSessionsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueCustomerLeagueSessionsDocs**
> IracingServiceMethodDocs getLeagueCustomerLeagueSessionsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueCustomerLeagueSessionsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueDirectoryDocs**
> IracingServiceMethodDocs getLeagueDirectoryDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueDirectoryDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueDocs**
> { [key: string]: IracingServiceMethodDocs; } getLeagueDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueGetDocs**
> IracingServiceMethodDocs getLeagueGetDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueGetDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueGetPointsSystemsDocs**
> IracingServiceMethodDocs getLeagueGetPointsSystemsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueGetPointsSystemsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueMembershipDocs**
> IracingServiceMethodDocs getLeagueMembershipDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueMembershipDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueRosterDocs**
> IracingServiceMethodDocs getLeagueRosterDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueRosterDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueSeasonSessionsDocs**
> IracingServiceMethodDocs getLeagueSeasonSessionsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueSeasonSessionsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueSeasonStandingsDocs**
> IracingServiceMethodDocs getLeagueSeasonStandingsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueSeasonStandingsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLeagueSeasonsDocs**
> IracingServiceMethodDocs getLeagueSeasonsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLeagueSeasonsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLookupCountriesDocs**
> IracingServiceMethodDocs getLookupCountriesDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLookupCountriesDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLookupDocs**
> { [key: string]: IracingServiceMethodDocs; } getLookupDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLookupDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLookupDriversDocs**
> IracingServiceMethodDocs getLookupDriversDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLookupDriversDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLookupFlairsDocs**
> IracingServiceMethodDocs getLookupFlairsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLookupFlairsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLookupGetDocs**
> IracingServiceMethodDocs getLookupGetDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLookupGetDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getLookupLicensesDocs**
> IracingServiceMethodDocs getLookupLicensesDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getLookupLicensesDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberAwardInstancesDocs**
> IracingServiceMethodDocs getMemberAwardInstancesDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getMemberAwardInstancesDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberAwardsDocs**
> IracingServiceMethodDocs getMemberAwardsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getMemberAwardsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberChartDataDocs**
> IracingServiceMethodDocs getMemberChartDataDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getMemberChartDataDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberDocs**
> { [key: string]: IracingServiceMethodDocs; } getMemberDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getMemberDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberGetDocs**
> IracingServiceMethodDocs getMemberGetDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getMemberGetDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberInfoDocs**
> IracingServiceMethodDocs getMemberInfoDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getMemberInfoDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberParticipationCreditsDocs**
> IracingServiceMethodDocs getMemberParticipationCreditsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getMemberParticipationCreditsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberProfileDocs**
> IracingServiceMethodDocs getMemberProfileDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getMemberProfileDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResultsDocs**
> { [key: string]: IracingServiceMethodDocs; } getResultsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getResultsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResultsEventLogDocs**
> IracingServiceMethodDocs getResultsEventLogDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getResultsEventLogDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResultsGetDocs**
> IracingServiceMethodDocs getResultsGetDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getResultsGetDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResultsLapChartDataDocs**
> IracingServiceMethodDocs getResultsLapChartDataDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getResultsLapChartDataDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResultsLapDataDocs**
> IracingServiceMethodDocs getResultsLapDataDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getResultsLapDataDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResultsSearchHostedDocs**
> IracingServiceMethodDocs getResultsSearchHostedDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getResultsSearchHostedDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResultsSearchSeriesDocs**
> IracingServiceMethodDocs getResultsSearchSeriesDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getResultsSearchSeriesDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getResultsSeasonResultsDocs**
> IracingServiceMethodDocs getResultsSeasonResultsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getResultsSeasonResultsDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSeasonDocs**
> { [key: string]: IracingServiceMethodDocs; } getSeasonDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeasonDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSeasonListDocs**
> IracingServiceMethodDocs getSeasonListDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeasonListDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSeasonRaceGuideDocs**
> IracingServiceMethodDocs getSeasonRaceGuideDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeasonRaceGuideDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTeamDocs**
> { [key: string]: IracingServiceMethodDocs; } getTeamDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getTeamDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: IracingServiceMethodDocs; }**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTeamGetDocs**
> IracingServiceMethodDocs getTeamGetDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getTeamGetDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTeamMembershipDocs**
> IracingServiceMethodDocs getTeamMembershipDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getTeamMembershipDocs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IracingServiceMethodDocs**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

