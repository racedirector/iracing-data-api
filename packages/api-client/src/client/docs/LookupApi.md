# LookupApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getLookup**](#getlookup) | **GET** /data/lookup/get | |
|[**getLookupCountries**](#getlookupcountries) | **GET** /data/lookup/countries | |
|[**getLookupCountriesDocs**](#getlookupcountriesdocs) | **GET** /data/doc/lookup/countries | |
|[**getLookupDocs**](#getlookupdocs) | **GET** /data/doc/lookup | |
|[**getLookupDrivers**](#getlookupdrivers) | **GET** /data/lookup/drivers | |
|[**getLookupDriversDocs**](#getlookupdriversdocs) | **GET** /data/doc/lookup/drivers | |
|[**getLookupFlairs**](#getlookupflairs) | **GET** /data/lookup/flairs | |
|[**getLookupFlairsDocs**](#getlookupflairsdocs) | **GET** /data/doc/lookup/flairs | |
|[**getLookupGetDocs**](#getlookupgetdocs) | **GET** /data/doc/lookup/get | |
|[**getLookupLicenses**](#getlookuplicenses) | **GET** /data/lookup/licenses | |
|[**getLookupLicensesDocs**](#getlookuplicensesdocs) | **GET** /data/doc/lookup/licenses | |

# **getLookup**
> IracingAPIResponse getLookup()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookup();
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

# **getLookupCountries**
> IracingAPIResponse getLookupCountries()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookupCountries();
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

# **getLookupCountriesDocs**
> IracingServiceMethodDocs getLookupCountriesDocs()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookupCountriesDocs();
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

# **getLookupDocs**
> { [key: string]: IracingServiceMethodDocs; } getLookupDocs()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookupDocs();
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

# **getLookupDrivers**
> IracingAPIResponse getLookupDrivers()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

let search_term: string; //A cust_id or partial name for which to search. (default to undefined)
let league_id: number; //Narrow the search to the roster of the given league. (optional) (default to undefined)

const { status, data } = await apiInstance.getLookupDrivers(
    search_term,
    league_id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **search_term** | [**string**] | A cust_id or partial name for which to search. | defaults to undefined|
| **league_id** | [**number**] | Narrow the search to the roster of the given league. | (optional) defaults to undefined|


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

# **getLookupDriversDocs**
> IracingServiceMethodDocs getLookupDriversDocs()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookupDriversDocs();
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

# **getLookupFlairs**
> IracingAPIResponse getLookupFlairs()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookupFlairs();
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

# **getLookupFlairsDocs**
> IracingServiceMethodDocs getLookupFlairsDocs()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookupFlairsDocs();
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

# **getLookupGetDocs**
> IracingServiceMethodDocs getLookupGetDocs()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookupGetDocs();
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

# **getLookupLicenses**
> IracingAPIResponse getLookupLicenses()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookupLicenses();
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

# **getLookupLicensesDocs**
> IracingServiceMethodDocs getLookupLicensesDocs()


### Example

```typescript
import {
    LookupApi,
    Configuration
} from '@iracing-data/api-client';

const configuration = new Configuration();
const apiInstance = new LookupApi(configuration);

const { status, data } = await apiInstance.getLookupLicensesDocs();
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

