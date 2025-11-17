# SeriesApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getSeries**](SeriesApi.md#getseries) | **GET** /data/series/get |  |
| [**getSeriesAssets**](SeriesApi.md#getseriesassets) | **GET** /data/series/assets |  |
| [**getSeriesPastSeasons**](SeriesApi.md#getseriespastseasons) | **GET** /data/series/past_seasons |  |
| [**getSeriesSeasonList**](SeriesApi.md#getseriesseasonlist) | **GET** /data/series/season_list |  |
| [**getSeriesSeasonSchedule**](SeriesApi.md#getseriesseasonschedule) | **GET** /data/series/season_schedule |  |
| [**getSeriesSeasons**](SeriesApi.md#getseriesseasons) | **GET** /data/series/seasons |  |
| [**getSeriesStatsSeries**](SeriesApi.md#getseriesstatsseries) | **GET** /data/series/stats_series |  |



## getSeries

> IracingAPIResponse getSeries()



### Example

```ts
import {
  Configuration,
  SeriesApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeriesRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeriesApi(config);

  try {
    const data = await api.getSeries();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

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


## getSeriesAssets

> IracingAPIResponse getSeriesAssets()



### Example

```ts
import {
  Configuration,
  SeriesApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeriesAssetsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeriesApi(config);

  try {
    const data = await api.getSeriesAssets();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

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


## getSeriesPastSeasons

> IracingAPIResponse getSeriesPastSeasons(series_id)



### Example

```ts
import {
  Configuration,
  SeriesApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeriesPastSeasonsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeriesApi(config);

  const body = {
    // number
    series_id: 8.14,
  } satisfies GetSeriesPastSeasonsRequest;

  try {
    const data = await api.getSeriesPastSeasons(body);
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
| **series_id** | `number` |  | [Defaults to `undefined`] |

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


## getSeriesSeasonList

> IracingAPIResponse getSeriesSeasonList(include_series, season_year, season_quarter)



### Example

```ts
import {
  Configuration,
  SeriesApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeriesSeasonListRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeriesApi(config);

  const body = {
    // boolean (optional)
    include_series: true,
    // number (optional)
    season_year: 8.14,
    // number (optional)
    season_quarter: 8.14,
  } satisfies GetSeriesSeasonListRequest;

  try {
    const data = await api.getSeriesSeasonList(body);
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
| **include_series** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **season_year** | `number` |  | [Optional] [Defaults to `undefined`] |
| **season_quarter** | `number` |  | [Optional] [Defaults to `undefined`] |

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


## getSeriesSeasonSchedule

> IracingAPIResponse getSeriesSeasonSchedule(season_id)



### Example

```ts
import {
  Configuration,
  SeriesApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeriesSeasonScheduleRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeriesApi(config);

  const body = {
    // number
    season_id: 8.14,
  } satisfies GetSeriesSeasonScheduleRequest;

  try {
    const data = await api.getSeriesSeasonSchedule(body);
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


## getSeriesSeasons

> IracingAPIResponse getSeriesSeasons(include_series, season_year, season_quarter)



### Example

```ts
import {
  Configuration,
  SeriesApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeriesSeasonsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeriesApi(config);

  const body = {
    // boolean (optional)
    include_series: true,
    // number | To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. (optional)
    season_year: 8.14,
    // number | To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. (optional)
    season_quarter: 8.14,
  } satisfies GetSeriesSeasonsRequest;

  try {
    const data = await api.getSeriesSeasons(body);
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
| **include_series** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **season_year** | `number` | To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. | [Optional] [Defaults to `undefined`] |
| **season_quarter** | `number` | To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. | [Optional] [Defaults to `undefined`] |

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


## getSeriesStatsSeries

> IracingAPIResponse getSeriesStatsSeries()



### Example

```ts
import {
  Configuration,
  SeriesApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeriesStatsSeriesRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeriesApi(config);

  try {
    const data = await api.getSeriesStatsSeries();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

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

