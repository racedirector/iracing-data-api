# TeamApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getTeam**](TeamApi.md#getteam) | **GET** /data/team/get |  |
| [**getTeamMembership**](TeamApi.md#getteammembership) | **GET** /data/team/membership |  |



## getTeam

> IracingAPIResponse getTeam(team_id, include_licenses)



### Example

```ts
import {
  Configuration,
  TeamApi,
} from '@iracing-data/api-client-fetch';
import type { GetTeamRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TeamApi(config);

  const body = {
    // number
    team_id: 8.14,
    // boolean | For faster responses, only request when necessary. (optional)
    include_licenses: true,
  } satisfies GetTeamRequest;

  try {
    const data = await api.getTeam(body);
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
| **team_id** | `number` |  | [Defaults to `undefined`] |
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


## getTeamMembership

> IracingAPIResponse getTeamMembership()



### Example

```ts
import {
  Configuration,
  TeamApi,
} from '@iracing-data/api-client-fetch';
import type { GetTeamMembershipRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TeamApi(config);

  try {
    const data = await api.getTeamMembership();
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

