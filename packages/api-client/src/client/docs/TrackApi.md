# TrackApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**dataDocTrackAssetsGet**](#datadoctrackassetsget) | **GET** /data/doc/track/assets | |
|[**dataDocTrackGet**](#datadoctrackget) | **GET** /data/doc/track | |
|[**dataDocTrackGetGet**](#datadoctrackgetget) | **GET** /data/doc/track/get | |
|[**getTrack**](#gettrack) | **GET** /data/track/get | |
|[**getTrackAssets**](#gettrackassets) | **GET** /data/track/assets | |

# **dataDocTrackAssetsGet**
> IracingServiceMethodDocs dataDocTrackAssetsGet()


### Example

```typescript
import {
    TrackApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new TrackApi(configuration);

const { status, data } = await apiInstance.dataDocTrackAssetsGet();
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

# **dataDocTrackGet**
> { [key: string]: IracingServiceMethodDocs; } dataDocTrackGet()


### Example

```typescript
import {
    TrackApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new TrackApi(configuration);

const { status, data } = await apiInstance.dataDocTrackGet();
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

# **dataDocTrackGetGet**
> IracingServiceMethodDocs dataDocTrackGetGet()


### Example

```typescript
import {
    TrackApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new TrackApi(configuration);

const { status, data } = await apiInstance.dataDocTrackGetGet();
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

# **getTrack**
> IracingAPIResponse getTrack()


### Example

```typescript
import {
    TrackApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new TrackApi(configuration);

const { status, data } = await apiInstance.getTrack();
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

# **getTrackAssets**
> IracingAPIResponse getTrackAssets()


### Example

```typescript
import {
    TrackApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new TrackApi(configuration);

const { status, data } = await apiInstance.getTrackAssets();
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

