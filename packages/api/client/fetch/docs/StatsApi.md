# StatsApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getStatsMemberBests**](StatsApi.md#getstatsmemberbests) | **GET** /data/stats/member_bests |  |
| [**getStatsMemberCareer**](StatsApi.md#getstatsmembercareer) | **GET** /data/stats/member_career |  |
| [**getStatsMemberDivision**](StatsApi.md#getstatsmemberdivision) | **GET** /data/stats/member_division |  |
| [**getStatsMemberRecap**](StatsApi.md#getstatsmemberrecap) | **GET** /data/stats/member_recap |  |
| [**getStatsMemberRecentRaces**](StatsApi.md#getstatsmemberrecentraces) | **GET** /data/stats/member_recent_races |  |
| [**getStatsMemberSummary**](StatsApi.md#getstatsmembersummary) | **GET** /data/stats/member_summary |  |
| [**getStatsMemberYearly**](StatsApi.md#getstatsmemberyearly) | **GET** /data/stats/member_yearly |  |
| [**getStatsSeasonDriverStandings**](StatsApi.md#getstatsseasondriverstandings) | **GET** /data/stats/season_driver_standings |  |
| [**getStatsSeasonQualifyResults**](StatsApi.md#getstatsseasonqualifyresults) | **GET** /data/stats/season_qualify_results |  |
| [**getStatsSeasonSupersessionStandings**](StatsApi.md#getstatsseasonsupersessionstandings) | **GET** /data/stats/season_supersession_standings |  |
| [**getStatsSeasonTeamStandings**](StatsApi.md#getstatsseasonteamstandings) | **GET** /data/stats/season_team_standings |  |
| [**getStatsSeasonTimeTrialResults**](StatsApi.md#getstatsseasontimetrialresults) | **GET** /data/stats/season_time_trial_results |  |
| [**getStatsSeasonTimeTrialStandings**](StatsApi.md#getstatsseasontimetrialstandings) | **GET** /data/stats/season_time_trial_standings |  |
| [**getStatsWorldRecords**](StatsApi.md#getstatsworldrecords) | **GET** /data/stats/world_records |  |



## getStatsMemberBests

> IracingAPIResponse getStatsMemberBests(cust_id, car_id)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsMemberBestsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
    // number | First call should exclude car_id; use cars_driven list in return for subsequent calls. (optional)
    car_id: 8.14,
  } satisfies GetStatsMemberBestsRequest;

  try {
    const data = await api.getStatsMemberBests(body);
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
| **cust_id** | `number` | Defaults to the authenticated member. | [Optional] [Defaults to `undefined`] |
| **car_id** | `number` | First call should exclude car_id; use cars_driven list in return for subsequent calls. | [Optional] [Defaults to `undefined`] |

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


## getStatsMemberCareer

> IracingAPIResponse getStatsMemberCareer(cust_id)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsMemberCareerRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
  } satisfies GetStatsMemberCareerRequest;

  try {
    const data = await api.getStatsMemberCareer(body);
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
| **cust_id** | `number` | Defaults to the authenticated member. | [Optional] [Defaults to `undefined`] |

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


## getStatsMemberDivision

> IracingAPIResponse getStatsMemberDivision(season_id, event_type)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsMemberDivisionRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number
    season_id: 8.14,
    // 4 | 5 | The event type code for the division type: 4 - Time Trial; 5 - Race
    event_type: 8.14,
  } satisfies GetStatsMemberDivisionRequest;

  try {
    const data = await api.getStatsMemberDivision(body);
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
| **event_type** | `4`, `5` | The event type code for the division type: 4 - Time Trial; 5 - Race | [Defaults to `undefined`] [Enum: 4, 5] |

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


## getStatsMemberRecap

> IracingAPIResponse getStatsMemberRecap(cust_id, year, season)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsMemberRecapRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
    // 1 | 2 | 3 | 4 | Season year; if not supplied the current calendar year (UTC) is used. (optional)
    year: 8.14,
    // number | Season (quarter) within the year; if not supplied the recap will be for the entire year. (optional)
    season: 8.14,
  } satisfies GetStatsMemberRecapRequest;

  try {
    const data = await api.getStatsMemberRecap(body);
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
| **cust_id** | `number` | Defaults to the authenticated member. | [Optional] [Defaults to `undefined`] |
| **year** | `1`, `2`, `3`, `4` | Season year; if not supplied the current calendar year (UTC) is used. | [Optional] [Defaults to `undefined`] [Enum: 1, 2, 3, 4] |
| **season** | `number` | Season (quarter) within the year; if not supplied the recap will be for the entire year. | [Optional] [Defaults to `undefined`] |

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


## getStatsMemberRecentRaces

> IracingAPIResponse getStatsMemberRecentRaces(cust_id)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsMemberRecentRacesRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
  } satisfies GetStatsMemberRecentRacesRequest;

  try {
    const data = await api.getStatsMemberRecentRaces(body);
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
| **cust_id** | `number` | Defaults to the authenticated member. | [Optional] [Defaults to `undefined`] |

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


## getStatsMemberSummary

> IracingAPIResponse getStatsMemberSummary(cust_id)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsMemberSummaryRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
  } satisfies GetStatsMemberSummaryRequest;

  try {
    const data = await api.getStatsMemberSummary(body);
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
| **cust_id** | `number` | Defaults to the authenticated member. | [Optional] [Defaults to `undefined`] |

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


## getStatsMemberYearly

> IracingAPIResponse getStatsMemberYearly(cust_id)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsMemberYearlyRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
  } satisfies GetStatsMemberYearlyRequest;

  try {
    const data = await api.getStatsMemberYearly(body);
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
| **cust_id** | `number` | Defaults to the authenticated member. | [Optional] [Defaults to `undefined`] |

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


## getStatsSeasonDriverStandings

> IracingAPIResponse getStatsSeasonDriverStandings(season_id, car_class_id, division, race_week_num)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsSeasonDriverStandingsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number
    season_id: 8.14,
    // number
    car_class_id: 8.14,
    // IracingDivision (optional)
    division: ...,
    // number | The first race week of a season is 0. (optional)
    race_week_num: 8.14,
  } satisfies GetStatsSeasonDriverStandingsRequest;

  try {
    const data = await api.getStatsSeasonDriverStandings(body);
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
| **car_class_id** | `number` |  | [Defaults to `undefined`] |
| **division** | `IracingDivision` |  | [Optional] [Defaults to `undefined`] [Enum: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] |
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


## getStatsSeasonQualifyResults

> IracingAPIResponse getStatsSeasonQualifyResults(season_id, car_class_id, race_week_num, division)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsSeasonQualifyResultsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number
    season_id: 8.14,
    // number
    car_class_id: 8.14,
    // number | The first race week of a season is 0.
    race_week_num: 8.14,
    // IracingDivision (optional)
    division: ...,
  } satisfies GetStatsSeasonQualifyResultsRequest;

  try {
    const data = await api.getStatsSeasonQualifyResults(body);
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
| **car_class_id** | `number` |  | [Defaults to `undefined`] |
| **race_week_num** | `number` | The first race week of a season is 0. | [Defaults to `undefined`] |
| **division** | `IracingDivision` |  | [Optional] [Defaults to `undefined`] [Enum: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] |

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


## getStatsSeasonSupersessionStandings

> IracingAPIResponse getStatsSeasonSupersessionStandings(season_id, car_class_id, division, race_week_num)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsSeasonSupersessionStandingsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number
    season_id: 8.14,
    // number
    car_class_id: 8.14,
    // IracingDivision (optional)
    division: ...,
    // number | The first race week of a season is 0. (optional)
    race_week_num: 8.14,
  } satisfies GetStatsSeasonSupersessionStandingsRequest;

  try {
    const data = await api.getStatsSeasonSupersessionStandings(body);
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
| **car_class_id** | `number` |  | [Defaults to `undefined`] |
| **division** | `IracingDivision` |  | [Optional] [Defaults to `undefined`] [Enum: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] |
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


## getStatsSeasonTeamStandings

> IracingAPIResponse getStatsSeasonTeamStandings(season_id, car_class_id, race_week_num)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsSeasonTeamStandingsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number
    season_id: 8.14,
    // number
    car_class_id: 8.14,
    // number | The first race week of a season is 0. (optional)
    race_week_num: 8.14,
  } satisfies GetStatsSeasonTeamStandingsRequest;

  try {
    const data = await api.getStatsSeasonTeamStandings(body);
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
| **car_class_id** | `number` |  | [Defaults to `undefined`] |
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


## getStatsSeasonTimeTrialResults

> IracingAPIResponse getStatsSeasonTimeTrialResults(season_id, car_class_id, race_week_num, division)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsSeasonTimeTrialResultsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number
    season_id: 8.14,
    // number
    car_class_id: 8.14,
    // number | The first race week of a season is 0.
    race_week_num: 8.14,
    // IracingDivision (optional)
    division: ...,
  } satisfies GetStatsSeasonTimeTrialResultsRequest;

  try {
    const data = await api.getStatsSeasonTimeTrialResults(body);
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
| **car_class_id** | `number` |  | [Defaults to `undefined`] |
| **race_week_num** | `number` | The first race week of a season is 0. | [Defaults to `undefined`] |
| **division** | `IracingDivision` |  | [Optional] [Defaults to `undefined`] [Enum: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] |

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


## getStatsSeasonTimeTrialStandings

> IracingAPIResponse getStatsSeasonTimeTrialStandings(season_id, car_class_id, division, race_week_num)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsSeasonTimeTrialStandingsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number
    season_id: 8.14,
    // number
    car_class_id: 8.14,
    // IracingDivision (optional)
    division: ...,
    // number | The first race week of a season is 0. (optional)
    race_week_num: 8.14,
  } satisfies GetStatsSeasonTimeTrialStandingsRequest;

  try {
    const data = await api.getStatsSeasonTimeTrialStandings(body);
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
| **car_class_id** | `number` |  | [Defaults to `undefined`] |
| **division** | `IracingDivision` |  | [Optional] [Defaults to `undefined`] [Enum: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] |
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


## getStatsWorldRecords

> IracingAPIResponse getStatsWorldRecords(car_id, track_id, season_year, season_quarter)



### Example

```ts
import {
  Configuration,
  StatsApi,
} from '@iracing-data/api-client-fetch';
import type { GetStatsWorldRecordsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  const body = {
    // number
    car_id: 8.14,
    // number
    track_id: 8.14,
    // number | Limit best times to a given year. (optional)
    season_year: 8.14,
    // number | Limit best times to a given quarter; only applicable when year is used. (optional)
    season_quarter: 8.14,
  } satisfies GetStatsWorldRecordsRequest;

  try {
    const data = await api.getStatsWorldRecords(body);
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
| **car_id** | `number` |  | [Defaults to `undefined`] |
| **track_id** | `number` |  | [Defaults to `undefined`] |
| **season_year** | `number` | Limit best times to a given year. | [Optional] [Defaults to `undefined`] |
| **season_quarter** | `number` | Limit best times to a given quarter; only applicable when year is used. | [Optional] [Defaults to `undefined`] |

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

