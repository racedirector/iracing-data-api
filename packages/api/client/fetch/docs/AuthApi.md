# AuthApi

All URIs are relative to *https://members-ng.iracing.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**postAuth**](AuthApi.md#postauthoperation) | **POST** /auth |  |



## postAuth

> postAuth(post_auth_request)



### Example

```ts
import {
  Configuration,
  AuthApi,
} from '@iracing-data/api-client-fetch';
import type { PostAuthOperationRequest } from '@iracing-data/api-client-fetch';

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AuthApi(config);

  const body = {
    // PostAuthRequest (optional)
    post_auth_request: ...,
  } satisfies PostAuthOperationRequest;

  try {
    const data = await api.postAuth(body);
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
| **post_auth_request** | [PostAuthRequest](PostAuthRequest.md) |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

