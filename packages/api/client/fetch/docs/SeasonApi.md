# SeasonApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getSeasonList**](SeasonApi.md#getseasonlist) | **GET** /data/season/list |  |
| [**getSeasonRaceGuide**](SeasonApi.md#getseasonraceguide) | **GET** /data/season/race_guide |  |
| [**getSeasonSpectatorSubsessionIds**](SeasonApi.md#getseasonspectatorsubsessionids) | **GET** /data/season/spectator_subsessionids |  |
| [**getSeasonSpectatorSubsessionIdsDetail**](SeasonApi.md#getseasonspectatorsubsessionidsdetail) | **GET** /data/season/spectator_subsessionids_detail |  |



## getSeasonList

> IracingAPIResponse getSeasonList(season_year, season_quarter)



### Example

```ts
import {
  Configuration,
  SeasonApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeasonListRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeasonApi(config);

  const body = {
    // number
    season_year: 8.14,
    // number
    season_quarter: 8.14,
  } satisfies GetSeasonListRequest;

  try {
    const data = await api.getSeasonList(body);
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
| **season_year** | `number` |  | [Defaults to `undefined`] |
| **season_quarter** | `number` |  | [Defaults to `undefined`] |

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


## getSeasonRaceGuide

> IracingAPIResponse getSeasonRaceGuide(from, include_end_after_from)



### Example

```ts
import {
  Configuration,
  SeasonApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeasonRaceGuideRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeasonApi(config);

  const body = {
    // Date | ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time. (optional)
    from: 2013-10-20T19:20:30+01:00,
    // boolean | Include sessions which start before \'from\' but end after. (optional)
    include_end_after_from: true,
  } satisfies GetSeasonRaceGuideRequest;

  try {
    const data = await api.getSeasonRaceGuide(body);
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
| **from** | `Date` | ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time. | [Optional] [Defaults to `undefined`] |
| **include_end_after_from** | `boolean` | Include sessions which start before \&#39;from\&#39; but end after. | [Optional] [Defaults to `undefined`] |

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


## getSeasonSpectatorSubsessionIds

> IracingAPIResponse getSeasonSpectatorSubsessionIds(event_types)



### Example

```ts
import {
  Configuration,
  SeasonApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeasonSpectatorSubsessionIdsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeasonApi(config);

  const body = {
    // Array<IracingEventType> | Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5 (optional)
    event_types: ...,
  } satisfies GetSeasonSpectatorSubsessionIdsRequest;

  try {
    const data = await api.getSeasonSpectatorSubsessionIds(body);
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
| **event_types** | `Array<IracingEventType>` | Types of events to include in the search. Defaults to all. ?event_types&#x3D;2,3,4,5 | [Optional] |

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


## getSeasonSpectatorSubsessionIdsDetail

> IracingAPIResponse getSeasonSpectatorSubsessionIdsDetail(event_types, season_ids)



### Example

```ts
import {
  Configuration,
  SeasonApi,
} from '@iracing-data/api-client-fetch';
import type { GetSeasonSpectatorSubsessionIdsDetailRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SeasonApi(config);

  const body = {
    // Array<IracingEventType> | Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5 (optional)
    event_types: ...,
    // Array<number> | Seasons to include in the search. Defaults to all. ?season_ids=513,937 (optional)
    season_ids: ...,
  } satisfies GetSeasonSpectatorSubsessionIdsDetailRequest;

  try {
    const data = await api.getSeasonSpectatorSubsessionIdsDetail(body);
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
| **event_types** | `Array<IracingEventType>` | Types of events to include in the search. Defaults to all. ?event_types&#x3D;2,3,4,5 | [Optional] |
| **season_ids** | `Array<number>` | Seasons to include in the search. Defaults to all. ?season_ids&#x3D;513,937 | [Optional] |

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

