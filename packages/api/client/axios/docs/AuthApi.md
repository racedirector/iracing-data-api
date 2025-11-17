# AuthApi

All URIs are relative to *https://members-ng.iracing.com*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**postAuth**](#postauth) | **POST** /auth | |

# **postAuth**
> postAuth()


### Example

```typescript
import {
    AuthApi,
    Configuration,
    PostAuthRequest
} from '@iracing-data/api-client-axios';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let post_auth_request: PostAuthRequest; // (optional)

const { status, data } = await apiInstance.postAuth(
    post_auth_request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **post_auth_request** | **PostAuthRequest**|  | |


### Return type

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

