# CarApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getCar**](#getcar) | **GET** /data/car/get | |
|[**getCarAssets**](#getcarassets) | **GET** /data/car/assets | |
|[**getCarAssetsDocs**](#getcarassetsdocs) | **GET** /data/doc/car/assets | |
|[**getCarDocs**](#getcardocs) | **GET** /data/doc/car | |
|[**getCarGetDocs**](#getcargetdocs) | **GET** /data/doc/car/get | |

# **getCar**
> IracingAPIResponse getCar()


### Example

```typescript
import {
    CarApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new CarApi(configuration);

const { status, data } = await apiInstance.getCar();
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

# **getCarAssets**
> IracingAPIResponse getCarAssets()

image paths are relative to https://images-static.iracing.com/

### Example

```typescript
import {
    CarApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new CarApi(configuration);

const { status, data } = await apiInstance.getCarAssets();
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

# **getCarAssetsDocs**
> IracingServiceMethodDocs getCarAssetsDocs()


### Example

```typescript
import {
    CarApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new CarApi(configuration);

const { status, data } = await apiInstance.getCarAssetsDocs();
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

# **getCarDocs**
> { [key: string]: IracingServiceMethodDocs; } getCarDocs()


### Example

```typescript
import {
    CarApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new CarApi(configuration);

const { status, data } = await apiInstance.getCarDocs();
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

# **getCarGetDocs**
> IracingServiceMethodDocs getCarGetDocs()


### Example

```typescript
import {
    CarApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new CarApi(configuration);

const { status, data } = await apiInstance.getCarGetDocs();
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

