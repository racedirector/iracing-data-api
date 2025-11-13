# ResultsApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getResults**](#getresults) | **GET** /data/results/get | |
|[**getResultsDocs**](#getresultsdocs) | **GET** /data/doc/results | |
|[**getResultsEventLog**](#getresultseventlog) | **GET** /data/results/event_log | |
|[**getResultsEventLogDocs**](#getresultseventlogdocs) | **GET** /data/doc/results/event_log | |
|[**getResultsGetDocs**](#getresultsgetdocs) | **GET** /data/doc/results/get | |
|[**getResultsLapChartData**](#getresultslapchartdata) | **GET** /data/results/lap_chart_data | |
|[**getResultsLapChartDataDocs**](#getresultslapchartdatadocs) | **GET** /data/doc/results/lap_chart_data | |
|[**getResultsLapData**](#getresultslapdata) | **GET** /data/results/lap_data | |
|[**getResultsLapDataDocs**](#getresultslapdatadocs) | **GET** /data/doc/results/lap_data | |
|[**getResultsSearchHosted**](#getresultssearchhosted) | **GET** /data/results/search_hosted | |
|[**getResultsSearchHostedDocs**](#getresultssearchhosteddocs) | **GET** /data/doc/results/search_hosted | |
|[**getResultsSearchSeries**](#getresultssearchseries) | **GET** /data/results/search_series | |
|[**getResultsSearchSeriesDocs**](#getresultssearchseriesdocs) | **GET** /data/doc/results/search_series | |
|[**getResultsSeasonResults**](#getresultsseasonresults) | **GET** /data/results/season_results | |
|[**getResultsSeasonResultsDocs**](#getresultsseasonresultsdocs) | **GET** /data/doc/results/season_results | |

# **getResults**
> IracingAPIResponse getResults()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let subsession_id: number; // (default to undefined)
let include_licenses: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.getResults(
    subsession_id,
    include_licenses
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **subsession_id** | [**number**] |  | defaults to undefined|
| **include_licenses** | [**boolean**] |  | (optional) defaults to undefined|


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

# **getResultsDocs**
> { [key: string]: IracingServiceMethodDocs; } getResultsDocs()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

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

# **getResultsEventLog**
> IracingAPIResponse getResultsEventLog()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let subsession_id: number; // (default to undefined)
let simsession_number: number; //The main event is 0; the preceding event is -1, and so on. (default to undefined)

const { status, data } = await apiInstance.getResultsEventLog(
    subsession_id,
    simsession_number
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **subsession_id** | [**number**] |  | defaults to undefined|
| **simsession_number** | [**number**] | The main event is 0; the preceding event is -1, and so on. | defaults to undefined|


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

# **getResultsEventLogDocs**
> IracingServiceMethodDocs getResultsEventLogDocs()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

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
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

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

# **getResultsLapChartData**
> IracingAPIResponse getResultsLapChartData()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let subsession_id: number; // (default to undefined)
let simsession_number: number; //The main event is 0; the preceding event is -1, and so on. (default to undefined)

const { status, data } = await apiInstance.getResultsLapChartData(
    subsession_id,
    simsession_number
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **subsession_id** | [**number**] |  | defaults to undefined|
| **simsession_number** | [**number**] | The main event is 0; the preceding event is -1, and so on. | defaults to undefined|


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

# **getResultsLapChartDataDocs**
> IracingServiceMethodDocs getResultsLapChartDataDocs()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

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

# **getResultsLapData**
> IracingAPIResponse getResultsLapData()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let subsession_id: number; // (default to undefined)
let simsession_number: number; //The main event is 0; the preceding event is -1, and so on. (default to undefined)
let cust_id: number; //Required if the subsession was a single-driver event. Optional for team events. If omitted for a team event then the laps driven by all the team\'s drivers will be included. (optional) (default to undefined)
let team_id: number; //Required if the subsession was a team event. (optional) (default to undefined)

const { status, data } = await apiInstance.getResultsLapData(
    subsession_id,
    simsession_number,
    cust_id,
    team_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **subsession_id** | [**number**] |  | defaults to undefined|
| **simsession_number** | [**number**] | The main event is 0; the preceding event is -1, and so on. | defaults to undefined|
| **cust_id** | [**number**] | Required if the subsession was a single-driver event. Optional for team events. If omitted for a team event then the laps driven by all the team\&#39;s drivers will be included. | (optional) defaults to undefined|
| **team_id** | [**number**] | Required if the subsession was a team event. | (optional) defaults to undefined|


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

# **getResultsLapDataDocs**
> IracingServiceMethodDocs getResultsLapDataDocs()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

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

# **getResultsSearchHosted**
> IracingAPIResponse getResultsSearchHosted()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let start_range_begin: string; //Session start times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". (optional) (default to undefined)
let start_range_end: string; //ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if start_range_begin is less than 90 days in the past. (optional) (default to undefined)
let finish_range_begin: string; //Session finish times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". (optional) (default to undefined)
let finish_range_end: string; //ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. (optional) (default to undefined)
let cust_id: number; //The participant\'s customer ID. Ignored if team_id is supplied. (optional) (default to undefined)
let team_id: number; //The team ID to search for. Takes priority over cust_id if both are supplied. (optional) (default to undefined)
let host_cust_id: number; //The host\'s customer ID. (optional) (default to undefined)
let session_name: string; //Part or all of the session\'s name. (optional) (default to undefined)
let league_id: number; //Include only results for the league with this ID. (optional) (default to undefined)
let league_season_id: number; //Include only results for the league season with this ID. (optional) (default to undefined)
let car_id: number; //One of the cars used by the session. (optional) (default to undefined)
let track_id: number; //The ID of the track used by the session. (optional) (default to undefined)
let category_ids: string; //Track categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4 (optional) (default to undefined)

const { status, data } = await apiInstance.getResultsSearchHosted(
    start_range_begin,
    start_range_end,
    finish_range_begin,
    finish_range_end,
    cust_id,
    team_id,
    host_cust_id,
    session_name,
    league_id,
    league_season_id,
    car_id,
    track_id,
    category_ids
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **start_range_begin** | [**string**] | Session start times. ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. | (optional) defaults to undefined|
| **start_range_end** | [**string**] | ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. Exclusive. May be omitted if start_range_begin is less than 90 days in the past. | (optional) defaults to undefined|
| **finish_range_begin** | [**string**] | Session finish times. ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. | (optional) defaults to undefined|
| **finish_range_end** | [**string**] | ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. | (optional) defaults to undefined|
| **cust_id** | [**number**] | The participant\&#39;s customer ID. Ignored if team_id is supplied. | (optional) defaults to undefined|
| **team_id** | [**number**] | The team ID to search for. Takes priority over cust_id if both are supplied. | (optional) defaults to undefined|
| **host_cust_id** | [**number**] | The host\&#39;s customer ID. | (optional) defaults to undefined|
| **session_name** | [**string**] | Part or all of the session\&#39;s name. | (optional) defaults to undefined|
| **league_id** | [**number**] | Include only results for the league with this ID. | (optional) defaults to undefined|
| **league_season_id** | [**number**] | Include only results for the league season with this ID. | (optional) defaults to undefined|
| **car_id** | [**number**] | One of the cars used by the session. | (optional) defaults to undefined|
| **track_id** | [**number**] | The ID of the track used by the session. | (optional) defaults to undefined|
| **category_ids** | [**string**] | Track categories to include in the search.  Defaults to all. ?category_ids&#x3D;1,2,3,4 | (optional) defaults to undefined|


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

# **getResultsSearchHostedDocs**
> IracingServiceMethodDocs getResultsSearchHostedDocs()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

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

# **getResultsSearchSeries**
> IracingAPIResponse getResultsSearchSeries()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let season_year: number; //Required when using season_quarter. (optional) (default to undefined)
let season_quarter: number; //Required when using season_year. (optional) (default to undefined)
let start_range_begin: string; //Session start times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". (optional) (default to undefined)
let start_range_end: string; //ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if start_range_begin is less than 90 days in the past. (optional) (default to undefined)
let finish_range_begin: string; //Session finish times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". (optional) (default to undefined)
let finish_range_end: string; //ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. (optional) (default to undefined)
let cust_id: number; //Include only sessions in which this customer participated. Ignored if team_id is supplied. (optional) (default to undefined)
let team_id: number; //Include only sessions in which this team participated. Takes priority over cust_id if both are supplied. (optional) (default to undefined)
let series_id: number; //Include only sessions for series with this ID. (optional) (default to undefined)
let race_week_num: number; //Include only sessions with this race week number. (optional) (default to undefined)
let official_only: boolean; //If true, include only sessions earning championship points. Defaults to all. (optional) (default to undefined)
let event_types: string; //Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5 (optional) (default to undefined)
let category_ids: string; //License categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4 (optional) (default to undefined)

const { status, data } = await apiInstance.getResultsSearchSeries(
    season_year,
    season_quarter,
    start_range_begin,
    start_range_end,
    finish_range_begin,
    finish_range_end,
    cust_id,
    team_id,
    series_id,
    race_week_num,
    official_only,
    event_types,
    category_ids
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_year** | [**number**] | Required when using season_quarter. | (optional) defaults to undefined|
| **season_quarter** | [**number**] | Required when using season_year. | (optional) defaults to undefined|
| **start_range_begin** | [**string**] | Session start times. ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. | (optional) defaults to undefined|
| **start_range_end** | [**string**] | ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. Exclusive. May be omitted if start_range_begin is less than 90 days in the past. | (optional) defaults to undefined|
| **finish_range_begin** | [**string**] | Session finish times. ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. | (optional) defaults to undefined|
| **finish_range_end** | [**string**] | ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. | (optional) defaults to undefined|
| **cust_id** | [**number**] | Include only sessions in which this customer participated. Ignored if team_id is supplied. | (optional) defaults to undefined|
| **team_id** | [**number**] | Include only sessions in which this team participated. Takes priority over cust_id if both are supplied. | (optional) defaults to undefined|
| **series_id** | [**number**] | Include only sessions for series with this ID. | (optional) defaults to undefined|
| **race_week_num** | [**number**] | Include only sessions with this race week number. | (optional) defaults to undefined|
| **official_only** | [**boolean**] | If true, include only sessions earning championship points. Defaults to all. | (optional) defaults to undefined|
| **event_types** | [**string**] | Types of events to include in the search. Defaults to all. ?event_types&#x3D;2,3,4,5 | (optional) defaults to undefined|
| **category_ids** | [**string**] | License categories to include in the search.  Defaults to all. ?category_ids&#x3D;1,2,3,4 | (optional) defaults to undefined|


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

# **getResultsSearchSeriesDocs**
> IracingServiceMethodDocs getResultsSearchSeriesDocs()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

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

# **getResultsSeasonResults**
> IracingAPIResponse getResultsSeasonResults()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

let season_id: number; // (default to undefined)
let event_type: IracingEventType; //Retrict to one event type: 2 - Practice; 3 - Qualify; 4 - Time Trial; 5 - Race (optional) (default to undefined)
let race_week_num: number; //The first race week of a season is 0. (optional) (default to undefined)

const { status, data } = await apiInstance.getResultsSeasonResults(
    season_id,
    event_type,
    race_week_num
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **season_id** | [**number**] |  | defaults to undefined|
| **event_type** | **IracingEventType** | Retrict to one event type: 2 - Practice; 3 - Qualify; 4 - Time Trial; 5 - Race | (optional) defaults to undefined|
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

# **getResultsSeasonResultsDocs**
> IracingServiceMethodDocs getResultsSeasonResultsDocs()


### Example

```typescript
import {
    ResultsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ResultsApi(configuration);

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

