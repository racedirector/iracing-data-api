# StatsApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
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
|[**getStatsMemberBests**](#getstatsmemberbests) | **GET** /data/stats/member_bests | |
|[**getStatsMemberCareer**](#getstatsmembercareer) | **GET** /data/stats/member_career | |
|[**getStatsMemberDivision**](#getstatsmemberdivision) | **GET** /data/stats/member_division | |
|[**getStatsMemberRecap**](#getstatsmemberrecap) | **GET** /data/stats/member_recap | |
|[**getStatsMemberRecentRaces**](#getstatsmemberrecentraces) | **GET** /data/stats/member_recent_races | |
|[**getStatsMemberSummary**](#getstatsmembersummary) | **GET** /data/stats/member_summary | |
|[**getStatsMemberYearly**](#getstatsmemberyearly) | **GET** /data/stats/member_yearly | |
|[**getStatsSeasonDriverStandings**](#getstatsseasondriverstandings) | **GET** /data/stats/season_driver_standings | |
|[**getStatsSeasonQualifyResults**](#getstatsseasonqualifyresults) | **GET** /data/stats/season_qualify_results | |
|[**getStatsSeasonSupersessionStandings**](#getstatsseasonsupersessionstandings) | **GET** /data/stats/season_supersession_standings | |
|[**getStatsSeasonTeamStandings**](#getstatsseasonteamstandings) | **GET** /data/stats/season_team_standings | |
|[**getStatsSeasonTimeTrialResults**](#getstatsseasontimetrialresults) | **GET** /data/stats/season_time_trial_results | |
|[**getStatsSeasonTimeTrialStandings**](#getstatsseasontimetrialstandings) | **GET** /data/stats/season_time_trial_standings | |
|[**getStatsWorldRecords**](#getstatsworldrecords) | **GET** /data/stats/world_records | |

# **dataDocStatsGet**
> { [key: string]: IracingServiceMethodDocs; } dataDocStatsGet()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

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

# **getStatsMemberBests**
> IracingAPIResponse getStatsMemberBests()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)
let car_id: number; //First call should exclude car_id; use cars_driven list in return for subsequent calls. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsMemberBests(
    cust_id,
    car_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cust_id** | [**number**] | Defaults to the authenticated member. | (optional) defaults to undefined|
| **car_id** | [**number**] | First call should exclude car_id; use cars_driven list in return for subsequent calls. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsMemberCareer**
> IracingAPIResponse getStatsMemberCareer()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsMemberCareer(
    cust_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cust_id** | [**number**] | Defaults to the authenticated member. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsMemberDivision**
> IracingAPIResponse getStatsMemberDivision()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let season_id: number; // (default to undefined)
let event_type: 4 | 5; //The event type code for the division type: 4 - Time Trial; 5 - Race (default to undefined)

const { status, data } = await apiInstance.getStatsMemberDivision(
    season_id,
    event_type
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_id** | [**number**] |  | defaults to undefined|
| **event_type** | [**4 | 5**]**Array<4 &#124; 5>** | The event type code for the division type: 4 - Time Trial; 5 - Race | defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsMemberRecap**
> IracingAPIResponse getStatsMemberRecap()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)
let year: 1 | 2 | 3 | 4; //Season year; if not supplied the current calendar year (UTC) is used. (optional) (default to undefined)
let season: number; //Season (quarter) within the year; if not supplied the recap will be for the entire year. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsMemberRecap(
    cust_id,
    year,
    season
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cust_id** | [**number**] | Defaults to the authenticated member. | (optional) defaults to undefined|
| **year** | [**1 | 2 | 3 | 4**]**Array<1 &#124; 2 &#124; 3 &#124; 4>** | Season year; if not supplied the current calendar year (UTC) is used. | (optional) defaults to undefined|
| **season** | [**number**] | Season (quarter) within the year; if not supplied the recap will be for the entire year. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsMemberRecentRaces**
> IracingAPIResponse getStatsMemberRecentRaces()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsMemberRecentRaces(
    cust_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cust_id** | [**number**] | Defaults to the authenticated member. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsMemberSummary**
> IracingAPIResponse getStatsMemberSummary()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsMemberSummary(
    cust_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cust_id** | [**number**] | Defaults to the authenticated member. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsMemberYearly**
> IracingAPIResponse getStatsMemberYearly()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsMemberYearly(
    cust_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cust_id** | [**number**] | Defaults to the authenticated member. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsSeasonDriverStandings**
> IracingAPIResponse getStatsSeasonDriverStandings()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let season_id: number; // (default to undefined)
let car_class_id: number; // (default to undefined)
let division: IracingDivision; // (optional) (default to undefined)
let race_week_num: number; //The first race week of a season is 0. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsSeasonDriverStandings(
    season_id,
    car_class_id,
    division,
    race_week_num
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_id** | [**number**] |  | defaults to undefined|
| **car_class_id** | [**number**] |  | defaults to undefined|
| **division** | **IracingDivision** |  | (optional) defaults to undefined|
| **race_week_num** | [**number**] | The first race week of a season is 0. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsSeasonQualifyResults**
> IracingAPIResponse getStatsSeasonQualifyResults()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let season_id: number; // (default to undefined)
let car_class_id: number; // (default to undefined)
let race_week_num: number; //The first race week of a season is 0. (default to undefined)
let division: IracingDivision; // (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsSeasonQualifyResults(
    season_id,
    car_class_id,
    race_week_num,
    division
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_id** | [**number**] |  | defaults to undefined|
| **car_class_id** | [**number**] |  | defaults to undefined|
| **race_week_num** | [**number**] | The first race week of a season is 0. | defaults to undefined|
| **division** | **IracingDivision** |  | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsSeasonSupersessionStandings**
> IracingAPIResponse getStatsSeasonSupersessionStandings()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let season_id: number; // (default to undefined)
let car_class_id: number; // (default to undefined)
let division: IracingDivision; // (optional) (default to undefined)
let race_week_num: number; //The first race week of a season is 0. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsSeasonSupersessionStandings(
    season_id,
    car_class_id,
    division,
    race_week_num
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_id** | [**number**] |  | defaults to undefined|
| **car_class_id** | [**number**] |  | defaults to undefined|
| **division** | **IracingDivision** |  | (optional) defaults to undefined|
| **race_week_num** | [**number**] | The first race week of a season is 0. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsSeasonTeamStandings**
> IracingAPIResponse getStatsSeasonTeamStandings()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let season_id: number; // (default to undefined)
let car_class_id: number; // (default to undefined)
let race_week_num: number; //The first race week of a season is 0. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsSeasonTeamStandings(
    season_id,
    car_class_id,
    race_week_num
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_id** | [**number**] |  | defaults to undefined|
| **car_class_id** | [**number**] |  | defaults to undefined|
| **race_week_num** | [**number**] | The first race week of a season is 0. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsSeasonTimeTrialResults**
> IracingAPIResponse getStatsSeasonTimeTrialResults()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let season_id: number; // (default to undefined)
let car_class_id: number; // (default to undefined)
let race_week_num: number; //The first race week of a season is 0. (default to undefined)
let division: IracingDivision; // (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsSeasonTimeTrialResults(
    season_id,
    car_class_id,
    race_week_num,
    division
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_id** | [**number**] |  | defaults to undefined|
| **car_class_id** | [**number**] |  | defaults to undefined|
| **race_week_num** | [**number**] | The first race week of a season is 0. | defaults to undefined|
| **division** | **IracingDivision** |  | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsSeasonTimeTrialStandings**
> IracingAPIResponse getStatsSeasonTimeTrialStandings()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let season_id: number; // (default to undefined)
let car_class_id: number; // (default to undefined)
let division: IracingDivision; // (optional) (default to undefined)
let race_week_num: number; //The first race week of a season is 0. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsSeasonTimeTrialStandings(
    season_id,
    car_class_id,
    division,
    race_week_num
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_id** | [**number**] |  | defaults to undefined|
| **car_class_id** | [**number**] |  | defaults to undefined|
| **division** | **IracingDivision** |  | (optional) defaults to undefined|
| **race_week_num** | [**number**] | The first race week of a season is 0. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStatsWorldRecords**
> IracingAPIResponse getStatsWorldRecords()


### Example

```typescript
import {
    StatsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new StatsApi(configuration);

let car_id: number; // (default to undefined)
let track_id: number; // (default to undefined)
let season_year: number; //Limit best times to a given year. (optional) (default to undefined)
let season_quarter: number; //Limit best times to a given quarter; only applicable when year is used. (optional) (default to undefined)

const { status, data } = await apiInstance.getStatsWorldRecords(
    car_id,
    track_id,
    season_year,
    season_quarter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **car_id** | [**number**] |  | defaults to undefined|
| **track_id** | [**number**] |  | defaults to undefined|
| **season_year** | [**number**] | Limit best times to a given year. | (optional) defaults to undefined|
| **season_quarter** | [**number**] | Limit best times to a given quarter; only applicable when year is used. | (optional) defaults to undefined|


### Return type

**IracingAPIResponse**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**401** | Access token is missing or invalid. |  -  |
|**429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
|**503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

