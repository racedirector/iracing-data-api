# LeagueApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getLeague**](#getleague) | **GET** /data/league/get | |
|[**getLeagueCustomerLeagueSessions**](#getleaguecustomerleaguesessions) | **GET** /data/league/cust_league_sessions | |
|[**getLeagueCustomerLeagueSessionsDocs**](#getleaguecustomerleaguesessionsdocs) | **GET** /data/doc/league/cust_league_sessions | |
|[**getLeagueDirectory**](#getleaguedirectory) | **GET** /data/league/directory | |
|[**getLeagueDirectoryDocs**](#getleaguedirectorydocs) | **GET** /data/doc/league/directory | |
|[**getLeagueDocs**](#getleaguedocs) | **GET** /data/doc/league | |
|[**getLeagueGetDocs**](#getleaguegetdocs) | **GET** /data/doc/league/get | |
|[**getLeagueGetPointsSystemsDocs**](#getleaguegetpointssystemsdocs) | **GET** /data/doc/league/get_points_systems | |
|[**getLeagueMembership**](#getleaguemembership) | **GET** /data/league/membership | |
|[**getLeagueMembershipDocs**](#getleaguemembershipdocs) | **GET** /data/doc/league/membership | |
|[**getLeaguePointsSystems**](#getleaguepointssystems) | **GET** /data/league/get_points_systems | |
|[**getLeagueRoster**](#getleagueroster) | **GET** /data/league/roster | |
|[**getLeagueRosterDocs**](#getleaguerosterdocs) | **GET** /data/doc/league/roster | |
|[**getLeagueSeasonSessions**](#getleagueseasonsessions) | **GET** /data/league/season_sessions | |
|[**getLeagueSeasonSessionsDocs**](#getleagueseasonsessionsdocs) | **GET** /data/doc/league/season_sessions | |
|[**getLeagueSeasonStandings**](#getleagueseasonstandings) | **GET** /data/league/season_standings | |
|[**getLeagueSeasonStandingsDocs**](#getleagueseasonstandingsdocs) | **GET** /data/doc/league/season_standings | |
|[**getLeagueSeasons**](#getleagueseasons) | **GET** /data/league/seasons | |
|[**getLeagueSeasonsDocs**](#getleagueseasonsdocs) | **GET** /data/doc/league/seasons | |

# **getLeague**
> IracingAPIResponse getLeague()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

let league_id: number; // (default to undefined)
let include_licenses: boolean; //For faster responses, only request when necessary. (optional) (default to undefined)

const { status, data } = await apiInstance.getLeague(
    league_id,
    include_licenses
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **league_id** | [**number**] |  | defaults to undefined|
| **include_licenses** | [**boolean**] | For faster responses, only request when necessary. | (optional) defaults to undefined|


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

# **getLeagueCustomerLeagueSessions**
> IracingAPIResponse getLeagueCustomerLeagueSessions()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

let mine: boolean; //If true, return only sessions created by this user. (optional) (default to undefined)
let package_id: number; //If set, return only sessions using this car or track package ID. (optional) (default to undefined)

const { status, data } = await apiInstance.getLeagueCustomerLeagueSessions(
    mine,
    package_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **mine** | [**boolean**] | If true, return only sessions created by this user. | (optional) defaults to undefined|
| **package_id** | [**number**] | If set, return only sessions using this car or track package ID. | (optional) defaults to undefined|


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

# **getLeagueCustomerLeagueSessionsDocs**
> IracingServiceMethodDocs getLeagueCustomerLeagueSessionsDocs()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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

# **getLeagueDirectory**
> IracingAPIResponse getLeagueDirectory()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

let search: string; //Will search against league name, description, owner, and league ID. (optional) (default to undefined)
let tag: string; //One or more tags, comma-separated. (optional) (default to undefined)
let restrict_to_member: boolean; //If true include only leagues for which customer is a member. (optional) (default to undefined)
let restrict_to_recruiting: boolean; //If true include only leagues which are recruiting. (optional) (default to undefined)
let restrict_to_friends: boolean; //If true include only leagues owned by a friend. (optional) (default to undefined)
let restrict_to_watched: boolean; //If true include only leagues owned by a watched member. (optional) (default to undefined)
let minimum_roster_count: number; //If set include leagues with at least this number of members. (optional) (default to undefined)
let maximum_roster_count: number; //If set include leagues with no more than this number of members. (optional) (default to undefined)
let lowerbound: number; //First row of results to return.  Defaults to 1. (optional) (default to undefined)
let upperbound: number; //Last row of results to return. Defaults to lowerbound + 39. (optional) (default to undefined)
let sort: string; //One of relevance, leaguename, displayname, rostercount. displayname is owners\'s name. Defaults to relevance. (optional) (default to undefined)
let order: string; //One of asc or desc.  Defaults to asc. (optional) (default to undefined)

const { status, data } = await apiInstance.getLeagueDirectory(
    search,
    tag,
    restrict_to_member,
    restrict_to_recruiting,
    restrict_to_friends,
    restrict_to_watched,
    minimum_roster_count,
    maximum_roster_count,
    lowerbound,
    upperbound,
    sort,
    order
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **search** | [**string**] | Will search against league name, description, owner, and league ID. | (optional) defaults to undefined|
| **tag** | [**string**] | One or more tags, comma-separated. | (optional) defaults to undefined|
| **restrict_to_member** | [**boolean**] | If true include only leagues for which customer is a member. | (optional) defaults to undefined|
| **restrict_to_recruiting** | [**boolean**] | If true include only leagues which are recruiting. | (optional) defaults to undefined|
| **restrict_to_friends** | [**boolean**] | If true include only leagues owned by a friend. | (optional) defaults to undefined|
| **restrict_to_watched** | [**boolean**] | If true include only leagues owned by a watched member. | (optional) defaults to undefined|
| **minimum_roster_count** | [**number**] | If set include leagues with at least this number of members. | (optional) defaults to undefined|
| **maximum_roster_count** | [**number**] | If set include leagues with no more than this number of members. | (optional) defaults to undefined|
| **lowerbound** | [**number**] | First row of results to return.  Defaults to 1. | (optional) defaults to undefined|
| **upperbound** | [**number**] | Last row of results to return. Defaults to lowerbound + 39. | (optional) defaults to undefined|
| **sort** | [**string**] | One of relevance, leaguename, displayname, rostercount. displayname is owners\&#39;s name. Defaults to relevance. | (optional) defaults to undefined|
| **order** | [**string**] | One of asc or desc.  Defaults to asc. | (optional) defaults to undefined|


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

# **getLeagueDirectoryDocs**
> IracingServiceMethodDocs getLeagueDirectoryDocs()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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

# **getLeagueMembership**
> IracingAPIResponse getLeagueMembership()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

let cust_id: number; //If different from the authenticated member, the following restrictions apply: - Caller cannot be on requested customer\'s block list or an empty list will result; - Requested customer cannot have their online activity preference set to hidden or an empty list will result; - Only leagues for which the requested customer is an admin and the league roster is not private are returned. (optional) (default to undefined)
let include_league: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.getLeagueMembership(
    cust_id,
    include_league
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cust_id** | [**number**] | If different from the authenticated member, the following restrictions apply: - Caller cannot be on requested customer\&#39;s block list or an empty list will result; - Requested customer cannot have their online activity preference set to hidden or an empty list will result; - Only leagues for which the requested customer is an admin and the league roster is not private are returned. | (optional) defaults to undefined|
| **include_league** | [**boolean**] |  | (optional) defaults to undefined|


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

# **getLeagueMembershipDocs**
> IracingServiceMethodDocs getLeagueMembershipDocs()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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

# **getLeaguePointsSystems**
> IracingAPIResponse getLeaguePointsSystems()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

let league_id: number; // (default to undefined)
let season_id: number; //If included and the season is using custom points (points_system_id:2) then the custom points option is included in the returned list. Otherwise the custom points option is not returned. (optional) (default to undefined)

const { status, data } = await apiInstance.getLeaguePointsSystems(
    league_id,
    season_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **league_id** | [**number**] |  | defaults to undefined|
| **season_id** | [**number**] | If included and the season is using custom points (points_system_id:2) then the custom points option is included in the returned list. Otherwise the custom points option is not returned. | (optional) defaults to undefined|


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

# **getLeagueRoster**
> IracingAPIResponse getLeagueRoster()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

let league_id: number; // (default to undefined)
let include_licenses: boolean; //For faster responses, only request when necessary. (optional) (default to undefined)

const { status, data } = await apiInstance.getLeagueRoster(
    league_id,
    include_licenses
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **league_id** | [**number**] |  | defaults to undefined|
| **include_licenses** | [**boolean**] | For faster responses, only request when necessary. | (optional) defaults to undefined|


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

# **getLeagueRosterDocs**
> IracingServiceMethodDocs getLeagueRosterDocs()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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

# **getLeagueSeasonSessions**
> IracingAPIResponse getLeagueSeasonSessions()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

let league_id: number; // (default to undefined)
let season_id: number; // (default to undefined)
let results_only: boolean; //If true include only sessions for which results are available. (optional) (default to undefined)

const { status, data } = await apiInstance.getLeagueSeasonSessions(
    league_id,
    season_id,
    results_only
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **league_id** | [**number**] |  | defaults to undefined|
| **season_id** | [**number**] |  | defaults to undefined|
| **results_only** | [**boolean**] | If true include only sessions for which results are available. | (optional) defaults to undefined|


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

# **getLeagueSeasonSessionsDocs**
> IracingServiceMethodDocs getLeagueSeasonSessionsDocs()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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

# **getLeagueSeasonStandings**
> IracingAPIResponse getLeagueSeasonStandings()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

let league_id: number; // (default to undefined)
let season_id: number; // (default to undefined)
let car_class_id: number; // (optional) (default to undefined)
let car_id: number; //If car_class_id is included then the standings are for the car in that car class, otherwise they are for the car across car classes. (optional) (default to undefined)

const { status, data } = await apiInstance.getLeagueSeasonStandings(
    league_id,
    season_id,
    car_class_id,
    car_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **league_id** | [**number**] |  | defaults to undefined|
| **season_id** | [**number**] |  | defaults to undefined|
| **car_class_id** | [**number**] |  | (optional) defaults to undefined|
| **car_id** | [**number**] | If car_class_id is included then the standings are for the car in that car class, otherwise they are for the car across car classes. | (optional) defaults to undefined|


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

# **getLeagueSeasonStandingsDocs**
> IracingServiceMethodDocs getLeagueSeasonStandingsDocs()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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

# **getLeagueSeasons**
> IracingAPIResponse getLeagueSeasons()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

let league_id: number; // (default to undefined)
let retired: boolean; //If true include seasons which are no longer active. (optional) (default to undefined)

const { status, data } = await apiInstance.getLeagueSeasons(
    league_id,
    retired
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **league_id** | [**number**] |  | defaults to undefined|
| **retired** | [**boolean**] | If true include seasons which are no longer active. | (optional) defaults to undefined|


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

# **getLeagueSeasonsDocs**
> IracingServiceMethodDocs getLeagueSeasonsDocs()


### Example

```typescript
import {
    LeagueApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LeagueApi(configuration);

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

