# DocApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
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
|[**getSeasonSpectatorSubsessionIdsDetailDocs**](#getseasonspectatorsubsessionidsdetaildocs) | **GET** /data/doc/season/spectator_subsessionids_detail | |
|[**getSeasonSpectatorSubsessionIdsDocs**](#getseasonspectatorsubsessionidsdocs) | **GET** /data/doc/season/spectator_subsessionids | |
|[**getSeriesAssetsDocs**](#getseriesassetsdocs) | **GET** /data/doc/series/assets | |
|[**getSeriesDocs**](#getseriesdocs) | **GET** /data/doc/series | |
|[**getSeriesGetDocs**](#getseriesgetdocs) | **GET** /data/doc/series/get | |
|[**getSeriesPastSeasonsDocs**](#getseriespastseasonsdocs) | **GET** /data/doc/series/past_seasons | |
|[**getSeriesSeasonListDocs**](#getseriesseasonlistdocs) | **GET** /data/doc/series/season_list | |
|[**getSeriesSeasonScheduleDocs**](#getseriesseasonscheduledocs) | **GET** /data/doc/series/season_schedule | |
|[**getSeriesSeasonsDocs**](#getseriesseasonsdocs) | **GET** /data/doc/series/seasons | |
|[**getSeriesStatsSeriesDocs**](#getseriesstatsseriesdocs) | **GET** /data/doc/series/stats_series | |
|[**getStatsDocs**](#getstatsdocs) | **GET** /data/doc/stats | |
|[**getStatsMemberBestsDocs**](#getstatsmemberbestsdocs) | **GET** /data/doc/stats/member_bests | |
|[**getStatsMemberCareerDocs**](#getstatsmembercareerdocs) | **GET** /data/doc/stats/member_career | |
|[**getStatsMemberDivisionDocs**](#getstatsmemberdivisiondocs) | **GET** /data/doc/stats/member_division | |
|[**getStatsMemberRecapDocs**](#getstatsmemberrecapdocs) | **GET** /data/doc/stats/member_recap | |
|[**getStatsMemberRecentRacesDocs**](#getstatsmemberrecentracesdocs) | **GET** /data/doc/stats/member_recent_races | |
|[**getStatsMemberSummaryDocs**](#getstatsmembersummarydocs) | **GET** /data/doc/stats/member_summary | |
|[**getStatsMemberYearlyDocs**](#getstatsmemberyearlydocs) | **GET** /data/doc/stats/member_yearly | |
|[**getStatsSeasonDriverStandingsDocs**](#getstatsseasondriverstandingsdocs) | **GET** /data/doc/stats/season_driver_standings | |
|[**getStatsSeasonQualifyResultsDocs**](#getstatsseasonqualifyresultsdocs) | **GET** /data/doc/stats/season_qualify_results | |
|[**getStatsSeasonSupersessionStandingsDocs**](#getstatsseasonsupersessionstandingsdocs) | **GET** /data/doc/stats/season_supersession_standings | |
|[**getStatsSeasonTTResultsDocs**](#getstatsseasonttresultsdocs) | **GET** /data/doc/stats/season_tt_results | |
|[**getStatsSeasonTTStandingsDocs**](#getstatsseasonttstandingsdocs) | **GET** /data/doc/stats/season_tt_standings | |
|[**getStatsSeasonTeamStandingsDocs**](#getstatsseasonteamstandingsdocs) | **GET** /data/doc/stats/season_team_standings | |
|[**getStatsWorldRecordsDocs**](#getstatsworldrecordsdocs) | **GET** /data/doc/stats/world_records | |
|[**getTeamDocs**](#getteamdocs) | **GET** /data/doc/team | |
|[**getTeamGetDocs**](#getteamgetdocs) | **GET** /data/doc/team/get | |
|[**getTeamMembershipDocs**](#getteammembershipdocs) | **GET** /data/doc/team/membership | |
|[**getTimeAttackDocs**](#gettimeattackdocs) | **GET** /data/doc/time_attack | |
|[**getTimeAttackMemberSeasonResultsDocs**](#gettimeattackmemberseasonresultsdocs) | **GET** /data/doc/time_attack/member_season_results | |
|[**getTrackAssetsDocs**](#gettrackassetsdocs) | **GET** /data/doc/track/assets | |
|[**getTrackDocs**](#gettrackdocs) | **GET** /data/doc/track | |
|[**getTrackGetDocs**](#gettrackgetdocs) | **GET** /data/doc/track/get | |

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

# **getSeasonSpectatorSubsessionIdsDetailDocs**
> IracingServiceMethodDocs getSeasonSpectatorSubsessionIdsDetailDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeasonSpectatorSubsessionIdsDetailDocs();
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

# **getSeasonSpectatorSubsessionIdsDocs**
> IracingServiceMethodDocs getSeasonSpectatorSubsessionIdsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeasonSpectatorSubsessionIdsDocs();
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

# **getSeriesAssetsDocs**
> IracingServiceMethodDocs getSeriesAssetsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeriesAssetsDocs();
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

# **getSeriesDocs**
> { [key: string]: IracingServiceMethodDocs; } getSeriesDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeriesDocs();
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

# **getSeriesGetDocs**
> IracingServiceMethodDocs getSeriesGetDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeriesGetDocs();
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

# **getSeriesPastSeasonsDocs**
> IracingServiceMethodDocs getSeriesPastSeasonsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeriesPastSeasonsDocs();
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

# **getSeriesSeasonListDocs**
> IracingServiceMethodDocs getSeriesSeasonListDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeriesSeasonListDocs();
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

# **getSeriesSeasonScheduleDocs**
> IracingServiceMethodDocs getSeriesSeasonScheduleDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeriesSeasonScheduleDocs();
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

# **getSeriesSeasonsDocs**
> IracingServiceMethodDocs getSeriesSeasonsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeriesSeasonsDocs();
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

# **getSeriesStatsSeriesDocs**
> IracingServiceMethodDocs getSeriesStatsSeriesDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getSeriesStatsSeriesDocs();
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

# **getStatsDocs**
> { [key: string]: IracingServiceMethodDocs; } getStatsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsDocs();
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

# **getStatsMemberBestsDocs**
> IracingServiceMethodDocs getStatsMemberBestsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsMemberBestsDocs();
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

# **getStatsMemberCareerDocs**
> IracingServiceMethodDocs getStatsMemberCareerDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsMemberCareerDocs();
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

# **getStatsMemberDivisionDocs**
> IracingServiceMethodDocs getStatsMemberDivisionDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsMemberDivisionDocs();
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

# **getStatsMemberRecapDocs**
> IracingServiceMethodDocs getStatsMemberRecapDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsMemberRecapDocs();
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

# **getStatsMemberRecentRacesDocs**
> IracingServiceMethodDocs getStatsMemberRecentRacesDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsMemberRecentRacesDocs();
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

# **getStatsMemberSummaryDocs**
> IracingServiceMethodDocs getStatsMemberSummaryDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsMemberSummaryDocs();
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

# **getStatsMemberYearlyDocs**
> IracingServiceMethodDocs getStatsMemberYearlyDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsMemberYearlyDocs();
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

# **getStatsSeasonDriverStandingsDocs**
> IracingServiceMethodDocs getStatsSeasonDriverStandingsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsSeasonDriverStandingsDocs();
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

# **getStatsSeasonQualifyResultsDocs**
> IracingServiceMethodDocs getStatsSeasonQualifyResultsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsSeasonQualifyResultsDocs();
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

# **getStatsSeasonSupersessionStandingsDocs**
> IracingServiceMethodDocs getStatsSeasonSupersessionStandingsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsSeasonSupersessionStandingsDocs();
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

# **getStatsSeasonTTResultsDocs**
> IracingServiceMethodDocs getStatsSeasonTTResultsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsSeasonTTResultsDocs();
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

# **getStatsSeasonTTStandingsDocs**
> IracingServiceMethodDocs getStatsSeasonTTStandingsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsSeasonTTStandingsDocs();
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

# **getStatsSeasonTeamStandingsDocs**
> IracingServiceMethodDocs getStatsSeasonTeamStandingsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsSeasonTeamStandingsDocs();
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

# **getStatsWorldRecordsDocs**
> IracingServiceMethodDocs getStatsWorldRecordsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getStatsWorldRecordsDocs();
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

# **getTimeAttackDocs**
> { [key: string]: IracingServiceMethodDocs; } getTimeAttackDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getTimeAttackDocs();
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

# **getTimeAttackMemberSeasonResultsDocs**
> IracingServiceMethodDocs getTimeAttackMemberSeasonResultsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getTimeAttackMemberSeasonResultsDocs();
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

# **getTrackAssetsDocs**
> IracingServiceMethodDocs getTrackAssetsDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getTrackAssetsDocs();
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

# **getTrackDocs**
> { [key: string]: IracingServiceMethodDocs; } getTrackDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getTrackDocs();
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

# **getTrackGetDocs**
> IracingServiceMethodDocs getTrackGetDocs()


### Example

```typescript
import {
    DocApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new DocApi(configuration);

const { status, data } = await apiInstance.getTrackGetDocs();
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

