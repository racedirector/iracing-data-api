# DefaultApi

All URIs are relative to *https://oauth.iracing.com/oauth2*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**iracingProfileGet**](DefaultApi.md#iracingprofileget) | **GET** /iracing/profile |  |
| [**revokeClientPost**](DefaultApi.md#revokeclientpost) | **POST** /revoke/client |  |
| [**revokeCurrentPost**](DefaultApi.md#revokecurrentpost) | **POST** /revoke/current |  |
| [**revokeSessionsPost**](DefaultApi.md#revokesessionspost) | **POST** /revoke/sessions |  |
| [**sessionsGet**](DefaultApi.md#sessionsget) | **GET** /sessions |  |



## iracingProfileGet

> IracingProfileGet200Response iracingProfileGet()



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { IracingProfileGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.iracingProfileGet();
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

[**IracingProfileGet200Response**](IracingProfileGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-request-id -  <br>  |
| **401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## revokeClientPost

> revokeClientPost()



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { RevokeClientPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.revokeClientPost();
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

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Session(s) were successfully revoked. |  * x-request-id -  <br>  |
| **401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## revokeCurrentPost

> revokeCurrentPost(forget_browser)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { RevokeCurrentPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // boolean (optional)
    forget_browser: true,
  } satisfies RevokeCurrentPostRequest;

  try {
    const data = await api.revokeCurrentPost(body);
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
| **forget_browser** | `boolean` |  | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Session(s) were successfully revoked. |  * x-request-id -  <br>  |
| **401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## revokeSessionsPost

> revokeSessionsPost(session_ids)



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { RevokeSessionsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // Array<string | null>
    session_ids: ...,
  } satisfies RevokeSessionsPostRequest;

  try {
    const data = await api.revokeSessionsPost(body);
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
| **session_ids** | `Array<string | null>` |  | |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Session(s) were successfully revoked. |  * x-request-id -  <br>  |
| **401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## sessionsGet

> SessionsGet200Response sessionsGet()



### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { SessionsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.sessionsGet();
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

[**SessionsGet200Response**](SessionsGet200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  * x-request-id -  <br>  |
| **401** | Access token is missing or invalid. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

