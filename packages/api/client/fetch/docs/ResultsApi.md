# ResultsApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getResults**](ResultsApi.md#getresults) | **GET** /data/results/get |  |
| [**getResultsEventLog**](ResultsApi.md#getresultseventlog) | **GET** /data/results/event_log |  |
| [**getResultsLapChartData**](ResultsApi.md#getresultslapchartdata) | **GET** /data/results/lap_chart_data |  |
| [**getResultsLapData**](ResultsApi.md#getresultslapdata) | **GET** /data/results/lap_data |  |
| [**getResultsSearchHosted**](ResultsApi.md#getresultssearchhosted) | **GET** /data/results/search_hosted |  |
| [**getResultsSearchSeries**](ResultsApi.md#getresultssearchseries) | **GET** /data/results/search_series |  |
| [**getResultsSeasonResults**](ResultsApi.md#getresultsseasonresults) | **GET** /data/results/season_results |  |



## getResults

> IracingAPIResponse getResults(subsession_id, include_licenses)



### Example

```ts
import {
  Configuration,
  ResultsApi,
} from '@iracing-data/api-client-fetch';
import type { GetResultsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ResultsApi(config);

  const body = {
    // number
    subsession_id: 8.14,
    // boolean (optional)
    include_licenses: true,
  } satisfies GetResultsRequest;

  try {
    const data = await api.getResults(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **subsession_id** | `number` |  | [Defaults to `undefined`] |
| **include_licenses** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**IracingAPIResponse**](IracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **401** | Access token is missing or invalid. |  -  |
| **429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getResultsEventLog

> IracingAPIResponse getResultsEventLog(subsession_id, simsession_number)



### Example

```ts
import {
  Configuration,
  ResultsApi,
} from '@iracing-data/api-client-fetch';
import type { GetResultsEventLogRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ResultsApi(config);

  const body = {
    // number
    subsession_id: 8.14,
    // number | The main event is 0; the preceding event is -1, and so on.
    simsession_number: 8.14,
  } satisfies GetResultsEventLogRequest;

  try {
    const data = await api.getResultsEventLog(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **subsession_id** | `number` |  | [Defaults to `undefined`] |
| **simsession_number** | `number` | The main event is 0; the preceding event is -1, and so on. | [Defaults to `undefined`] |

### Return type

[**IracingAPIResponse**](IracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **401** | Access token is missing or invalid. |  -  |
| **429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getResultsLapChartData

> IracingAPIResponse getResultsLapChartData(subsession_id, simsession_number)



### Example

```ts
import {
  Configuration,
  ResultsApi,
} from '@iracing-data/api-client-fetch';
import type { GetResultsLapChartDataRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ResultsApi(config);

  const body = {
    // number
    subsession_id: 8.14,
    // number | The main event is 0; the preceding event is -1, and so on.
    simsession_number: 8.14,
  } satisfies GetResultsLapChartDataRequest;

  try {
    const data = await api.getResultsLapChartData(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **subsession_id** | `number` |  | [Defaults to `undefined`] |
| **simsession_number** | `number` | The main event is 0; the preceding event is -1, and so on. | [Defaults to `undefined`] |

### Return type

[**IracingAPIResponse**](IracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **401** | Access token is missing or invalid. |  -  |
| **429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getResultsLapData

> IracingAPIResponse getResultsLapData(subsession_id, simsession_number, cust_id, team_id)



### Example

```ts
import {
  Configuration,
  ResultsApi,
} from '@iracing-data/api-client-fetch';
import type { GetResultsLapDataRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ResultsApi(config);

  const body = {
    // number
    subsession_id: 8.14,
    // number | The main event is 0; the preceding event is -1, and so on.
    simsession_number: 8.14,
    // number | Required if the subsession was a single-driver event. Optional for team events. If omitted for a team event then the laps driven by all the team\'s drivers will be included. (optional)
    cust_id: 8.14,
    // number | Required if the subsession was a team event. (optional)
    team_id: 8.14,
  } satisfies GetResultsLapDataRequest;

  try {
    const data = await api.getResultsLapData(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **subsession_id** | `number` |  | [Defaults to `undefined`] |
| **simsession_number** | `number` | The main event is 0; the preceding event is -1, and so on. | [Defaults to `undefined`] |
| **cust_id** | `number` | Required if the subsession was a single-driver event. Optional for team events. If omitted for a team event then the laps driven by all the team\&#39;s drivers will be included. | [Optional] [Defaults to `undefined`] |
| **team_id** | `number` | Required if the subsession was a team event. | [Optional] [Defaults to `undefined`] |

### Return type

[**IracingAPIResponse**](IracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **401** | Access token is missing or invalid. |  -  |
| **429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getResultsSearchHosted

> IracingAPIResponse getResultsSearchHosted(start_range_begin, start_range_end, finish_range_begin, finish_range_end, cust_id, team_id, host_cust_id, session_name, league_id, league_season_id, car_id, track_id, category_ids)



### Example

```ts
import {
  Configuration,
  ResultsApi,
} from '@iracing-data/api-client-fetch';
import type { GetResultsSearchHostedRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ResultsApi(config);

  const body = {
    // Date | Session start times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". (optional)
    start_range_begin: 2013-10-20T19:20:30+01:00,
    // Date | ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if start_range_begin is less than 90 days in the past. (optional)
    start_range_end: 2013-10-20T19:20:30+01:00,
    // Date | Session finish times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". (optional)
    finish_range_begin: 2013-10-20T19:20:30+01:00,
    // Date | ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. (optional)
    finish_range_end: 2013-10-20T19:20:30+01:00,
    // number | The participant\'s customer ID. Ignored if team_id is supplied. (optional)
    cust_id: 8.14,
    // number | The team ID to search for. Takes priority over cust_id if both are supplied. (optional)
    team_id: 8.14,
    // number | The host\'s customer ID. (optional)
    host_cust_id: 8.14,
    // string | Part or all of the session\'s name. (optional)
    session_name: session_name_example,
    // number | Include only results for the league with this ID. (optional)
    league_id: 8.14,
    // number | Include only results for the league season with this ID. (optional)
    league_season_id: 8.14,
    // number | One of the cars used by the session. (optional)
    car_id: 8.14,
    // number | The ID of the track used by the session. (optional)
    track_id: 8.14,
    // string | Track categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4 (optional)
    category_ids: category_ids_example,
  } satisfies GetResultsSearchHostedRequest;

  try {
    const data = await api.getResultsSearchHosted(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **start_range_begin** | `Date` | Session start times. ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. | [Optional] [Defaults to `undefined`] |
| **start_range_end** | `Date` | ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. Exclusive. May be omitted if start_range_begin is less than 90 days in the past. | [Optional] [Defaults to `undefined`] |
| **finish_range_begin** | `Date` | Session finish times. ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. | [Optional] [Defaults to `undefined`] |
| **finish_range_end** | `Date` | ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. | [Optional] [Defaults to `undefined`] |
| **cust_id** | `number` | The participant\&#39;s customer ID. Ignored if team_id is supplied. | [Optional] [Defaults to `undefined`] |
| **team_id** | `number` | The team ID to search for. Takes priority over cust_id if both are supplied. | [Optional] [Defaults to `undefined`] |
| **host_cust_id** | `number` | The host\&#39;s customer ID. | [Optional] [Defaults to `undefined`] |
| **session_name** | `string` | Part or all of the session\&#39;s name. | [Optional] [Defaults to `undefined`] |
| **league_id** | `number` | Include only results for the league with this ID. | [Optional] [Defaults to `undefined`] |
| **league_season_id** | `number` | Include only results for the league season with this ID. | [Optional] [Defaults to `undefined`] |
| **car_id** | `number` | One of the cars used by the session. | [Optional] [Defaults to `undefined`] |
| **track_id** | `number` | The ID of the track used by the session. | [Optional] [Defaults to `undefined`] |
| **category_ids** | `string` | Track categories to include in the search.  Defaults to all. ?category_ids&#x3D;1,2,3,4 | [Optional] [Defaults to `undefined`] |

### Return type

[**IracingAPIResponse**](IracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **401** | Access token is missing or invalid. |  -  |
| **429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getResultsSearchSeries

> IracingAPIResponse getResultsSearchSeries(season_year, season_quarter, start_range_begin, start_range_end, finish_range_begin, finish_range_end, cust_id, team_id, series_id, race_week_num, official_only, event_types, category_ids)



### Example

```ts
import {
  Configuration,
  ResultsApi,
} from '@iracing-data/api-client-fetch';
import type { GetResultsSearchSeriesRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ResultsApi(config);

  const body = {
    // number | Required when using season_quarter. (optional)
    season_year: 8.14,
    // number | Required when using season_year. (optional)
    season_quarter: 8.14,
    // Date | Session start times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". (optional)
    start_range_begin: 2013-10-20T19:20:30+01:00,
    // Date | ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if start_range_begin is less than 90 days in the past. (optional)
    start_range_end: 2013-10-20T19:20:30+01:00,
    // Date | Session finish times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". (optional)
    finish_range_begin: 2013-10-20T19:20:30+01:00,
    // Date | ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. (optional)
    finish_range_end: 2013-10-20T19:20:30+01:00,
    // number | Include only sessions in which this customer participated. Ignored if team_id is supplied. (optional)
    cust_id: 8.14,
    // number | Include only sessions in which this team participated. Takes priority over cust_id if both are supplied. (optional)
    team_id: 8.14,
    // number | Include only sessions for series with this ID. (optional)
    series_id: 8.14,
    // number | Include only sessions with this race week number. (optional)
    race_week_num: 8.14,
    // boolean | If true, include only sessions earning championship points. Defaults to all. (optional)
    official_only: true,
    // string | Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5 (optional)
    event_types: event_types_example,
    // string | License categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4 (optional)
    category_ids: category_ids_example,
  } satisfies GetResultsSearchSeriesRequest;

  try {
    const data = await api.getResultsSearchSeries(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **season_year** | `number` | Required when using season_quarter. | [Optional] [Defaults to `undefined`] |
| **season_quarter** | `number` | Required when using season_year. | [Optional] [Defaults to `undefined`] |
| **start_range_begin** | `Date` | Session start times. ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. | [Optional] [Defaults to `undefined`] |
| **start_range_end** | `Date` | ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. Exclusive. May be omitted if start_range_begin is less than 90 days in the past. | [Optional] [Defaults to `undefined`] |
| **finish_range_begin** | `Date` | Session finish times. ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. | [Optional] [Defaults to `undefined`] |
| **finish_range_end** | `Date` | ISO-8601 UTC time zero offset: \&quot;2022-04-01T15:45Z\&quot;. Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. | [Optional] [Defaults to `undefined`] |
| **cust_id** | `number` | Include only sessions in which this customer participated. Ignored if team_id is supplied. | [Optional] [Defaults to `undefined`] |
| **team_id** | `number` | Include only sessions in which this team participated. Takes priority over cust_id if both are supplied. | [Optional] [Defaults to `undefined`] |
| **series_id** | `number` | Include only sessions for series with this ID. | [Optional] [Defaults to `undefined`] |
| **race_week_num** | `number` | Include only sessions with this race week number. | [Optional] [Defaults to `undefined`] |
| **official_only** | `boolean` | If true, include only sessions earning championship points. Defaults to all. | [Optional] [Defaults to `undefined`] |
| **event_types** | `string` | Types of events to include in the search. Defaults to all. ?event_types&#x3D;2,3,4,5 | [Optional] [Defaults to `undefined`] |
| **category_ids** | `string` | License categories to include in the search.  Defaults to all. ?category_ids&#x3D;1,2,3,4 | [Optional] [Defaults to `undefined`] |

### Return type

[**IracingAPIResponse**](IracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **401** | Access token is missing or invalid. |  -  |
| **429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getResultsSeasonResults

> IracingAPIResponse getResultsSeasonResults(season_id, event_type, race_week_num)



### Example

```ts
import {
  Configuration,
  ResultsApi,
} from '@iracing-data/api-client-fetch';
import type { GetResultsSeasonResultsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ResultsApi(config);

  const body = {
    // number
    season_id: 8.14,
    // IracingEventType | Retrict to one event type: 2 - Practice; 3 - Qualify; 4 - Time Trial; 5 - Race (optional)
    event_type: ...,
    // number | The first race week of a season is 0. (optional)
    race_week_num: 8.14,
  } satisfies GetResultsSeasonResultsRequest;

  try {
    const data = await api.getResultsSeasonResults(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **season_id** | `number` |  | [Defaults to `undefined`] |
| **event_type** | `IracingEventType` | Retrict to one event type: 2 - Practice; 3 - Qualify; 4 - Time Trial; 5 - Race | [Optional] [Defaults to `undefined`] [Enum: 2, 3, 4, 5] |
| **race_week_num** | `number` | The first race week of a season is 0. | [Optional] [Defaults to `undefined`] |

### Return type

[**IracingAPIResponse**](IracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **401** | Access token is missing or invalid. |  -  |
| **429** | Rate limited |  * x-ratelimit-limit -  <br>  * x-ratelimit-remaining -  <br>  * x-ratelimit-reset -  <br>  |
| **503** | Maintenance |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

