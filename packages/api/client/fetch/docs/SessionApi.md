# SessionApi

All URIs are relative to *https://members-ng.iracing.com*

| Method                                                                       | HTTP request                           | Description |
| ---------------------------------------------------------------------------- | -------------------------------------- | ----------- |
| [**getSessionRegisteredDrivers**](SessionApi.md#getsessionregistereddrivers) | **GET** /data/session/reg_drivers_list |             |

## getSessionRegisteredDrivers

> IracingAPIResponse getSessionRegisteredDrivers(subsession_id)

### Example

```ts
import { Configuration, SessionApi } from "@iracing-data/api-client-fetch";
import type { GetSessionRegisteredDriversRequest } from "@iracing-data/api-client-fetch";

async function example() {
  console.log("🚀 Testing @iracing-data/api-client-fetch SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SessionApi(config);

  const body = {
    // number
    subsession_id: 8.14,
  } satisfies GetSessionRegisteredDriversRequest;

  try {
    const data = await api.getSessionRegisteredDrivers(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type     | Description | Notes                     |
| ----------------- | -------- | ----------- | ------------------------- |
| **subsession_id** | `number` |             | [Defaults to `undefined`] |

### Return type

[**IracingAPIResponse**](IracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                         | Response headers                                                                     |
| ----------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| **200**     | Success                             | * x-ratelimit-limit - <br> * x-ratelimit-remaining - <br> * x-ratelimit-reset - <br> |
| **401**     | Access token is missing or invalid. | -                                                                                    |
| **429**     | Rate limited                        | * x-ratelimit-limit - <br> * x-ratelimit-remaining - <br> * x-ratelimit-reset - <br> |
| **503**     | Maintenance                         | -                                                                                    |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
