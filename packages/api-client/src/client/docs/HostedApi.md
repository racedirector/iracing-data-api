# HostedApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getHostedCombinedSessions**](#gethostedcombinedsessions) | **GET** /data/hosted/combined_sessions | |
|[**getHostedCombinedSessionsDocs**](#gethostedcombinedsessionsdocs) | **GET** /data/doc/hosted/combined_sessions | |
|[**getHostedDocs**](#gethosteddocs) | **GET** /data/doc/hosted | |
|[**getHostedSessions**](#gethostedsessions) | **GET** /data/hosted/sessions | |
|[**getHostedSessionsDocs**](#gethostedsessionsdocs) | **GET** /data/doc/hosted/sessions | |

# **getHostedCombinedSessions**
> IracingAPIResponse getHostedCombinedSessions()

Sessions that can be joined as a driver or spectator, and also includes non-league pending sessions for the user.

### Example

```typescript
import {
    HostedApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new HostedApi(configuration);

let package_id: number; //If set, return only sessions using this car or track package ID. (optional) (default to undefined)

const { status, data } = await apiInstance.getHostedCombinedSessions(
    package_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **getHostedCombinedSessionsDocs**
> IracingServiceMethodDocs getHostedCombinedSessionsDocs()


### Example

```typescript
import {
    HostedApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new HostedApi(configuration);

const { status, data } = await apiInstance.getHostedCombinedSessionsDocs();
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

# **getHostedDocs**
> { [key: string]: IracingServiceMethodDocs; } getHostedDocs()


### Example

```typescript
import {
    HostedApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new HostedApi(configuration);

const { status, data } = await apiInstance.getHostedDocs();
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

# **getHostedSessions**
> IracingAPIResponse getHostedSessions()

Sessions that can be joined as a driver. Without spectator and non-league pending sessions for the user.

### Example

```typescript
import {
    HostedApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new HostedApi(configuration);

const { status, data } = await apiInstance.getHostedSessions();
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

# **getHostedSessionsDocs**
> IracingServiceMethodDocs getHostedSessionsDocs()


### Example

```typescript
import {
    HostedApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new HostedApi(configuration);

const { status, data } = await apiInstance.getHostedSessionsDocs();
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

