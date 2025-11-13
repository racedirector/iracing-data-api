# MemberApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMember**](#getmember) | **GET** /data/member/get | |
|[**getMemberAwardInstances**](#getmemberawardinstances) | **GET** /data/member/award_instances | |
|[**getMemberAwardInstancesDocs**](#getmemberawardinstancesdocs) | **GET** /data/doc/member/award_instances | |
|[**getMemberAwards**](#getmemberawards) | **GET** /data/member/awards | |
|[**getMemberAwardsDocs**](#getmemberawardsdocs) | **GET** /data/doc/member/awards | |
|[**getMemberChartData**](#getmemberchartdata) | **GET** /data/member/chart_data | |
|[**getMemberChartDataDocs**](#getmemberchartdatadocs) | **GET** /data/doc/member/chart_data | |
|[**getMemberDocs**](#getmemberdocs) | **GET** /data/doc/member | |
|[**getMemberGetDocs**](#getmembergetdocs) | **GET** /data/doc/member/get | |
|[**getMemberInfo**](#getmemberinfo) | **GET** /data/member/info | |
|[**getMemberInfoDocs**](#getmemberinfodocs) | **GET** /data/doc/member/info | |
|[**getMemberParticipationCredits**](#getmemberparticipationcredits) | **GET** /data/member/participation_credits | |
|[**getMemberParticipationCreditsDocs**](#getmemberparticipationcreditsdocs) | **GET** /data/doc/member/participation_credits | |
|[**getMemberProfile**](#getmemberprofile) | **GET** /data/member/profile | Gets a requested user\&#39;s profile.|
|[**getMemberProfileDocs**](#getmemberprofiledocs) | **GET** /data/doc/member/profile | |

# **getMember**
> IracingAPIResponse getMember()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

let cust_ids: string; //Comma-separated list of customer IDs. Example: ?cust_ids=2,3,4 (default to undefined)
let include_licenses: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMember(
    cust_ids,
    include_licenses
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cust_ids** | [**string**] | Comma-separated list of customer IDs. Example: ?cust_ids&#x3D;2,3,4 | defaults to undefined|
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

# **getMemberAwardInstances**
> IracingAPIResponse getMemberAwardInstances()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

let award_id: number; // (default to undefined)
let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)

const { status, data } = await apiInstance.getMemberAwardInstances(
    award_id,
    cust_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **award_id** | [**number**] |  | defaults to undefined|
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

# **getMemberAwardInstancesDocs**
> IracingServiceMethodDocs getMemberAwardInstancesDocs()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberAwardInstancesDocs();
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

# **getMemberAwards**
> IracingAPIResponse getMemberAwards()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)

const { status, data } = await apiInstance.getMemberAwards(
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

# **getMemberAwardsDocs**
> IracingServiceMethodDocs getMemberAwardsDocs()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberAwardsDocs();
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

# **getMemberChartData**
> IracingAPIResponse getMemberChartData()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

let category_id: number; //1 - Oval; 2 - Road; 3 - Dirt oval; 4 - Dirt road (default to undefined)
let chart_type: number; //1 - iRating; 2 - TT Rating; 3 - License/SR (default to undefined)
let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)

const { status, data } = await apiInstance.getMemberChartData(
    category_id,
    chart_type,
    cust_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category_id** | [**number**] | 1 - Oval; 2 - Road; 3 - Dirt oval; 4 - Dirt road | defaults to undefined|
| **chart_type** | [**number**] | 1 - iRating; 2 - TT Rating; 3 - License/SR | defaults to undefined|
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

# **getMemberChartDataDocs**
> IracingServiceMethodDocs getMemberChartDataDocs()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberChartDataDocs();
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

# **getMemberDocs**
> { [key: string]: IracingServiceMethodDocs; } getMemberDocs()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberDocs();
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

# **getMemberGetDocs**
> IracingServiceMethodDocs getMemberGetDocs()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberGetDocs();
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

# **getMemberInfo**
> IracingAPIResponse getMemberInfo()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberInfo();
```

### Parameters
This endpoint does not have any parameters.


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

# **getMemberInfoDocs**
> IracingServiceMethodDocs getMemberInfoDocs()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberInfoDocs();
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

# **getMemberParticipationCredits**
> IracingAPIResponse getMemberParticipationCredits()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberParticipationCredits();
```

### Parameters
This endpoint does not have any parameters.


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

# **getMemberParticipationCreditsDocs**
> IracingServiceMethodDocs getMemberParticipationCreditsDocs()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberParticipationCreditsDocs();
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

# **getMemberProfile**
> IracingAPIResponse getMemberProfile()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

let cust_id: number; //Defaults to the authenticated member. (optional) (default to undefined)

const { status, data } = await apiInstance.getMemberProfile(
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

# **getMemberProfileDocs**
> IracingServiceMethodDocs getMemberProfileDocs()


### Example

```typescript
import {
    MemberApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

const { status, data } = await apiInstance.getMemberProfileDocs();
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

