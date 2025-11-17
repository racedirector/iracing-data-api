# MemberApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getMember**](MemberApi.md#getmember) | **GET** /data/member/get |  |
| [**getMemberAwardInstances**](MemberApi.md#getmemberawardinstances) | **GET** /data/member/award_instances |  |
| [**getMemberAwards**](MemberApi.md#getmemberawards) | **GET** /data/member/awards |  |
| [**getMemberChartData**](MemberApi.md#getmemberchartdata) | **GET** /data/member/chart_data |  |
| [**getMemberInfo**](MemberApi.md#getmemberinfo) | **GET** /data/member/info |  |
| [**getMemberParticipationCredits**](MemberApi.md#getmemberparticipationcredits) | **GET** /data/member/participation_credits |  |
| [**getMemberProfile**](MemberApi.md#getmemberprofile) | **GET** /data/member/profile | Gets a requested user\&#39;s profile. |



## getMember

> IracingAPIResponse getMember(cust_ids, include_licenses)



### Example

```ts
import {
  Configuration,
  MemberApi,
} from '@iracing-data/api-client-fetch';
import type { GetMemberRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new MemberApi(config);

  const body = {
    // string | Comma-separated list of customer IDs. Example: ?cust_ids=2,3,4
    cust_ids: cust_ids_example,
    // boolean (optional)
    include_licenses: true,
  } satisfies GetMemberRequest;

  try {
    const data = await api.getMember(body);
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
| **cust_ids** | `string` | Comma-separated list of customer IDs. Example: ?cust_ids&#x3D;2,3,4 | [Defaults to `undefined`] |
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


## getMemberAwardInstances

> IracingAPIResponse getMemberAwardInstances(award_id, cust_id)



### Example

```ts
import {
  Configuration,
  MemberApi,
} from '@iracing-data/api-client-fetch';
import type { GetMemberAwardInstancesRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new MemberApi(config);

  const body = {
    // number
    award_id: 8.14,
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
  } satisfies GetMemberAwardInstancesRequest;

  try {
    const data = await api.getMemberAwardInstances(body);
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
| **award_id** | `number` |  | [Defaults to `undefined`] |
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


## getMemberAwards

> IracingAPIResponse getMemberAwards(cust_id)



### Example

```ts
import {
  Configuration,
  MemberApi,
} from '@iracing-data/api-client-fetch';
import type { GetMemberAwardsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new MemberApi(config);

  const body = {
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
  } satisfies GetMemberAwardsRequest;

  try {
    const data = await api.getMemberAwards(body);
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


## getMemberChartData

> IracingAPIResponse getMemberChartData(category_id, chart_type, cust_id)



### Example

```ts
import {
  Configuration,
  MemberApi,
} from '@iracing-data/api-client-fetch';
import type { GetMemberChartDataRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new MemberApi(config);

  const body = {
    // number | 1 - Oval; 2 - Road; 3 - Dirt oval; 4 - Dirt road
    category_id: 8.14,
    // number | 1 - iRating; 2 - TT Rating; 3 - License/SR
    chart_type: 8.14,
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
  } satisfies GetMemberChartDataRequest;

  try {
    const data = await api.getMemberChartData(body);
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
| **category_id** | `number` | 1 - Oval; 2 - Road; 3 - Dirt oval; 4 - Dirt road | [Defaults to `undefined`] |
| **chart_type** | `number` | 1 - iRating; 2 - TT Rating; 3 - License/SR | [Defaults to `undefined`] |
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


## getMemberInfo

> IracingAPIResponse getMemberInfo()



### Example

```ts
import {
  Configuration,
  MemberApi,
} from '@iracing-data/api-client-fetch';
import type { GetMemberInfoRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new MemberApi(config);

  try {
    const data = await api.getMemberInfo();
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


## getMemberParticipationCredits

> IracingAPIResponse getMemberParticipationCredits()



### Example

```ts
import {
  Configuration,
  MemberApi,
} from '@iracing-data/api-client-fetch';
import type { GetMemberParticipationCreditsRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new MemberApi(config);

  try {
    const data = await api.getMemberParticipationCredits();
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


## getMemberProfile

> IracingAPIResponse getMemberProfile(cust_id)

Gets a requested user\&#39;s profile.

### Example

```ts
import {
  Configuration,
  MemberApi,
} from '@iracing-data/api-client-fetch';
import type { GetMemberProfileRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new MemberApi(config);

  const body = {
    // number | Defaults to the authenticated member. (optional)
    cust_id: 8.14,
  } satisfies GetMemberProfileRequest;

  try {
    const data = await api.getMemberProfile(body);
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

