# LeagueApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getLeague**](LeagueApi.md#getleague) | **GET** /data/league/get |  |
| [**getLeagueCustomerLeagueSessions**](LeagueApi.md#getleaguecustomerleaguesessions) | **GET** /data/league/cust_league_sessions |  |
| [**getLeagueDirectory**](LeagueApi.md#getleaguedirectory) | **GET** /data/league/directory |  |
| [**getLeagueMembership**](LeagueApi.md#getleaguemembership) | **GET** /data/league/membership |  |
| [**getLeaguePointsSystems**](LeagueApi.md#getleaguepointssystems) | **GET** /data/league/get_points_systems |  |
| [**getLeagueRoster**](LeagueApi.md#getleagueroster) | **GET** /data/league/roster |  |
| [**getLeagueSeasonSessions**](LeagueApi.md#getleagueseasonsessions) | **GET** /data/league/season_sessions |  |
| [**getLeagueSeasonStandings**](LeagueApi.md#getleagueseasonstandings) | **GET** /data/league/season_standings |  |
| [**getLeagueSeasons**](LeagueApi.md#getleagueseasons) | **GET** /data/league/seasons |  |



## getLeague

> IracingAPIResponse getLeague(league_id, include_licenses)



### Example

```ts
import {
  Configuration,
  LeagueApi,
} from '@iracing-data/api-client-fetch';
import type { GetLeagueRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LeagueApi(config);

  const body = {
    // number
    league_id: 8.14,
    // boolean | For faster responses, only request when necessary. (optional)
    include_licenses: true,
  } satisfies GetLeagueRequest;

  try {
    const data = await api.getLeague(body);
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
| **league_id** | `number` |  | [Defaults to `undefined`] |
| **include_licenses** | `boolean` | For faster responses, only request when necessary. | [Optional] [Defaults to `undefined`] |

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


## getLeagueCustomerLeagueSessions

> IracingAPIResponse getLeagueCustomerLeagueSessions(mine, package_id)



### Example

```ts
import {
  Configuration,
  LeagueApi,
} from '@iracing-data/api-client-fetch';
import type { GetLeagueCustomerLeagueSessionsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LeagueApi(config);

  const body = {
    // boolean | If true, return only sessions created by this user. (optional)
    mine: true,
    // number | If set, return only sessions using this car or track package ID. (optional)
    package_id: 8.14,
  } satisfies GetLeagueCustomerLeagueSessionsRequest;

  try {
    const data = await api.getLeagueCustomerLeagueSessions(body);
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
| **mine** | `boolean` | If true, return only sessions created by this user. | [Optional] [Defaults to `undefined`] |
| **package_id** | `number` | If set, return only sessions using this car or track package ID. | [Optional] [Defaults to `undefined`] |

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


## getLeagueDirectory

> IracingAPIResponse getLeagueDirectory(search, tag, restrict_to_member, restrict_to_recruiting, restrict_to_friends, restrict_to_watched, minimum_roster_count, maximum_roster_count, lowerbound, upperbound, sort, order)



### Example

```ts
import {
  Configuration,
  LeagueApi,
} from '@iracing-data/api-client-fetch';
import type { GetLeagueDirectoryRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LeagueApi(config);

  const body = {
    // string | Will search against league name, description, owner, and league ID. (optional)
    search: search_example,
    // string | One or more tags, comma-separated. (optional)
    tag: tag_example,
    // boolean | If true include only leagues for which customer is a member. (optional)
    restrict_to_member: true,
    // boolean | If true include only leagues which are recruiting. (optional)
    restrict_to_recruiting: true,
    // boolean | If true include only leagues owned by a friend. (optional)
    restrict_to_friends: true,
    // boolean | If true include only leagues owned by a watched member. (optional)
    restrict_to_watched: true,
    // number | If set include leagues with at least this number of members. (optional)
    minimum_roster_count: 8.14,
    // number | If set include leagues with no more than this number of members. (optional)
    maximum_roster_count: 8.14,
    // number | First row of results to return.  Defaults to 1. (optional)
    lowerbound: 8.14,
    // number | Last row of results to return. Defaults to lowerbound + 39. (optional)
    upperbound: 8.14,
    // string | One of relevance, leaguename, displayname, rostercount. displayname is owners\'s name. Defaults to relevance. (optional)
    sort: sort_example,
    // string | One of asc or desc.  Defaults to asc. (optional)
    order: order_example,
  } satisfies GetLeagueDirectoryRequest;

  try {
    const data = await api.getLeagueDirectory(body);
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
| **search** | `string` | Will search against league name, description, owner, and league ID. | [Optional] [Defaults to `undefined`] |
| **tag** | `string` | One or more tags, comma-separated. | [Optional] [Defaults to `undefined`] |
| **restrict_to_member** | `boolean` | If true include only leagues for which customer is a member. | [Optional] [Defaults to `undefined`] |
| **restrict_to_recruiting** | `boolean` | If true include only leagues which are recruiting. | [Optional] [Defaults to `undefined`] |
| **restrict_to_friends** | `boolean` | If true include only leagues owned by a friend. | [Optional] [Defaults to `undefined`] |
| **restrict_to_watched** | `boolean` | If true include only leagues owned by a watched member. | [Optional] [Defaults to `undefined`] |
| **minimum_roster_count** | `number` | If set include leagues with at least this number of members. | [Optional] [Defaults to `undefined`] |
| **maximum_roster_count** | `number` | If set include leagues with no more than this number of members. | [Optional] [Defaults to `undefined`] |
| **lowerbound** | `number` | First row of results to return.  Defaults to 1. | [Optional] [Defaults to `undefined`] |
| **upperbound** | `number` | Last row of results to return. Defaults to lowerbound + 39. | [Optional] [Defaults to `undefined`] |
| **sort** | `string` | One of relevance, leaguename, displayname, rostercount. displayname is owners\&#39;s name. Defaults to relevance. | [Optional] [Defaults to `undefined`] |
| **order** | `string` | One of asc or desc.  Defaults to asc. | [Optional] [Defaults to `undefined`] |

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


## getLeagueMembership

> IracingAPIResponse getLeagueMembership(cust_id, include_league)



### Example

```ts
import {
  Configuration,
  LeagueApi,
} from '@iracing-data/api-client-fetch';
import type { GetLeagueMembershipRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LeagueApi(config);

  const body = {
    // number | If different from the authenticated member, the following restrictions apply: - Caller cannot be on requested customer\'s block list or an empty list will result; - Requested customer cannot have their online activity preference set to hidden or an empty list will result; - Only leagues for which the requested customer is an admin and the league roster is not private are returned. (optional)
    cust_id: 8.14,
    // boolean (optional)
    include_league: true,
  } satisfies GetLeagueMembershipRequest;

  try {
    const data = await api.getLeagueMembership(body);
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
| **cust_id** | `number` | If different from the authenticated member, the following restrictions apply: - Caller cannot be on requested customer\&#39;s block list or an empty list will result; - Requested customer cannot have their online activity preference set to hidden or an empty list will result; - Only leagues for which the requested customer is an admin and the league roster is not private are returned. | [Optional] [Defaults to `undefined`] |
| **include_league** | `boolean` |  | [Optional] [Defaults to `undefined`] |

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


## getLeaguePointsSystems

> IracingAPIResponse getLeaguePointsSystems(league_id, season_id)



### Example

```ts
import {
  Configuration,
  LeagueApi,
} from '@iracing-data/api-client-fetch';
import type { GetLeaguePointsSystemsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LeagueApi(config);

  const body = {
    // number
    league_id: 8.14,
    // number | If included and the season is using custom points (points_system_id:2) then the custom points option is included in the returned list. Otherwise the custom points option is not returned. (optional)
    season_id: 8.14,
  } satisfies GetLeaguePointsSystemsRequest;

  try {
    const data = await api.getLeaguePointsSystems(body);
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
| **league_id** | `number` |  | [Defaults to `undefined`] |
| **season_id** | `number` | If included and the season is using custom points (points_system_id:2) then the custom points option is included in the returned list. Otherwise the custom points option is not returned. | [Optional] [Defaults to `undefined`] |

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


## getLeagueRoster

> IracingAPIResponse getLeagueRoster(league_id, include_licenses)



### Example

```ts
import {
  Configuration,
  LeagueApi,
} from '@iracing-data/api-client-fetch';
import type { GetLeagueRosterRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LeagueApi(config);

  const body = {
    // number
    league_id: 8.14,
    // boolean | For faster responses, only request when necessary. (optional)
    include_licenses: true,
  } satisfies GetLeagueRosterRequest;

  try {
    const data = await api.getLeagueRoster(body);
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
| **league_id** | `number` |  | [Defaults to `undefined`] |
| **include_licenses** | `boolean` | For faster responses, only request when necessary. | [Optional] [Defaults to `undefined`] |

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


## getLeagueSeasonSessions

> IracingAPIResponse getLeagueSeasonSessions(league_id, season_id, results_only)



### Example

```ts
import {
  Configuration,
  LeagueApi,
} from '@iracing-data/api-client-fetch';
import type { GetLeagueSeasonSessionsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LeagueApi(config);

  const body = {
    // number
    league_id: 8.14,
    // number
    season_id: 8.14,
    // boolean | If true include only sessions for which results are available. (optional)
    results_only: true,
  } satisfies GetLeagueSeasonSessionsRequest;

  try {
    const data = await api.getLeagueSeasonSessions(body);
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
| **league_id** | `number` |  | [Defaults to `undefined`] |
| **season_id** | `number` |  | [Defaults to `undefined`] |
| **results_only** | `boolean` | If true include only sessions for which results are available. | [Optional] [Defaults to `undefined`] |

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


## getLeagueSeasonStandings

> IracingAPIResponse getLeagueSeasonStandings(league_id, season_id, car_class_id, car_id)



### Example

```ts
import {
  Configuration,
  LeagueApi,
} from '@iracing-data/api-client-fetch';
import type { GetLeagueSeasonStandingsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LeagueApi(config);

  const body = {
    // number
    league_id: 8.14,
    // number
    season_id: 8.14,
    // number (optional)
    car_class_id: 8.14,
    // number | If car_class_id is included then the standings are for the car in that car class, otherwise they are for the car across car classes. (optional)
    car_id: 8.14,
  } satisfies GetLeagueSeasonStandingsRequest;

  try {
    const data = await api.getLeagueSeasonStandings(body);
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
| **league_id** | `number` |  | [Defaults to `undefined`] |
| **season_id** | `number` |  | [Defaults to `undefined`] |
| **car_class_id** | `number` |  | [Optional] [Defaults to `undefined`] |
| **car_id** | `number` | If car_class_id is included then the standings are for the car in that car class, otherwise they are for the car across car classes. | [Optional] [Defaults to `undefined`] |

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


## getLeagueSeasons

> IracingAPIResponse getLeagueSeasons(league_id, retired)



### Example

```ts
import {
  Configuration,
  LeagueApi,
} from '@iracing-data/api-client-fetch';
import type { GetLeagueSeasonsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LeagueApi(config);

  const body = {
    // number
    league_id: 8.14,
    // boolean | If true include seasons which are no longer active. (optional)
    retired: true,
  } satisfies GetLeagueSeasonsRequest;

  try {
    const data = await api.getLeagueSeasons(body);
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
| **league_id** | `number` |  | [Defaults to `undefined`] |
| **retired** | `boolean` | If true include seasons which are no longer active. | [Optional] [Defaults to `undefined`] |

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

