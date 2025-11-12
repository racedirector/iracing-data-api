# ConstantsApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getConstantsCategories**](#getconstantscategories) | **GET** /data/constants/categories | |
|[**getConstantsCategoriesDocs**](#getconstantscategoriesdocs) | **GET** /data/doc/constants/categories | |
|[**getConstantsDivisions**](#getconstantsdivisions) | **GET** /data/constants/divisions | |
|[**getConstantsDivisionsDocs**](#getconstantsdivisionsdocs) | **GET** /data/doc/constants/divisions | |
|[**getConstantsDocs**](#getconstantsdocs) | **GET** /data/doc/constants | |
|[**getConstantsEventTypes**](#getconstantseventtypes) | **GET** /data/constants/event_types | |
|[**getConstantsEventTypesDocs**](#getconstantseventtypesdocs) | **GET** /data/doc/constants/event_types | |

# **getConstantsCategories**
> IracingAPIResponse getConstantsCategories()

Constant; returned directly as an array of objects

### Example

```typescript
import {
    ConstantsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ConstantsApi(configuration);

const { status, data } = await apiInstance.getConstantsCategories();
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

# **getConstantsCategoriesDocs**
> IracingServiceMethodDocs getConstantsCategoriesDocs()


### Example

```typescript
import {
    ConstantsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ConstantsApi(configuration);

const { status, data } = await apiInstance.getConstantsCategoriesDocs();
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

# **getConstantsDivisions**
> IracingAPIResponse getConstantsDivisions()

Constant; returned directly as an array of objects

### Example

```typescript
import {
    ConstantsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ConstantsApi(configuration);

const { status, data } = await apiInstance.getConstantsDivisions();
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

# **getConstantsDivisionsDocs**
> IracingServiceMethodDocs getConstantsDivisionsDocs()


### Example

```typescript
import {
    ConstantsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ConstantsApi(configuration);

const { status, data } = await apiInstance.getConstantsDivisionsDocs();
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

# **getConstantsDocs**
> { [key: string]: IracingServiceMethodDocs; } getConstantsDocs()


### Example

```typescript
import {
    ConstantsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ConstantsApi(configuration);

const { status, data } = await apiInstance.getConstantsDocs();
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

# **getConstantsEventTypes**
> IracingAPIResponse getConstantsEventTypes()

Constant; returned directly as an array of objects

### Example

```typescript
import {
    ConstantsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ConstantsApi(configuration);

const { status, data } = await apiInstance.getConstantsEventTypes();
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

# **getConstantsEventTypesDocs**
> IracingServiceMethodDocs getConstantsEventTypesDocs()


### Example

```typescript
import {
    ConstantsApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new ConstantsApi(configuration);

const { status, data } = await apiInstance.getConstantsEventTypesDocs();
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

