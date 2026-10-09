# DefaultApi

All URIs are relative to *https://oauth.iracing.com/oauth2*

| Method                                             | HTTP request              | Description |
| -------------------------------------------------- | ------------------------- | ----------- |
| [**authorize**](DefaultApi.md#authorize)           | **GET** /authorize        |             |
| [**exchangeToken**](DefaultApi.md#exchangetoken)   | **POST** /token           |             |
| [**getProfile**](DefaultApi.md#getprofile)         | **GET** /iracing/profile  |             |
| [**getSessions**](DefaultApi.md#getsessions)       | **GET** /sessions         |             |
| [**revokeClient**](DefaultApi.md#revokeclient)     | **POST** /revoke/client   |             |
| [**revokeCurrent**](DefaultApi.md#revokecurrent)   | **POST** /revoke/current  |             |
| [**revokeSessions**](DefaultApi.md#revokesessions) | **POST** /revoke/sessions |             |

## authorize

> authorize(client_id, redirect_uri, response_type, code_challenge, code_challenge_method, state, scope, prompt)

### Example

```ts
import { Configuration, DefaultApi } from "@iracing-data/oauth-client-fetch";
import type { AuthorizeRequest } from "@iracing-data/oauth-client-fetch";

async function example() {
  console.log("🚀 Testing @iracing-data/oauth-client-fetch SDK...");
  const api = new DefaultApi();

  const body = {
    // string | The client identifier issued during client registration.
    client_id: client_id_example,
    // string | A redirect URI registered to the client, which must match exactly.
    redirect_uri: redirect_uri_example,
    // 'code' | The only valid value for this is code.
    response_type: response_type_example,
    // string | A PKCE code challenge. We require this of any client which cannot reasonably keep a secret, and encourage server-side applications to implement it regardless. (optional)
    code_challenge: code_challenge_example,
    // 'plain' | 'S256' | The PKCE code challenge method. Either S256 (recommended) or plain. (optional)
    code_challenge_method: code_challenge_method_example,
    // string | This state value will be returned unmodified at the end of the authentication and authorization flow. It may be used to store request-specific data and in the prevention of CSRF attacks. (optional)
    state: state_example,
    // string (optional)
    scope: scope_example,
    // string | Space-delimited, case-sensitive list of ASCII string values which influence how the authorization server interacts with the user. (optional)
    prompt: prompt_example,
  } satisfies AuthorizeRequest;

  try {
    const data = await api.authorize(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                      | Type            | Description                                                                                                                                                                                | Notes                                                          |
| ------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| **client_id**             | `string`        | The client identifier issued during client registration.                                                                                                                                   | [Defaults to `undefined`]                                      |
| **redirect_uri**          | `string`        | A redirect URI registered to the client, which must match exactly.                                                                                                                         | [Defaults to `undefined`]                                      |
| **response_type**         | `code`          | The only valid value for this is code.                                                                                                                                                     | [Defaults to `undefined`] [Enum: code]                         |
| **code_challenge**        | `string`        | A PKCE code challenge. We require this of any client which cannot reasonably keep a secret, and encourage server-side applications to implement it regardless.                             | [Optional] [Defaults to `undefined`]                           |
| **code_challenge_method** | `plain`, `S256` | The PKCE code challenge method. Either S256 (recommended) or plain.                                                                                                                        | [Optional] [Defaults to `&#39;plain&#39;`] [Enum: plain, S256] |
| **state**                 | `string`        | This state value will be returned unmodified at the end of the authentication and authorization flow. It may be used to store request-specific data and in the prevention of CSRF attacks. | [Optional] [Defaults to `undefined`]                           |
| **scope**                 | `string`        |                                                                                                                                                                                            | [Optional] [Defaults to `undefined`]                           |
| **prompt**                | `string`        | Space-delimited, case-sensitive list of ASCII string values which influence how the authorization server interacts with the user.                                                          | [Optional] [Defaults to `undefined`]                           |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description                                | Response headers |
| ----------- | ------------------------------------------ | ---------------- |
| **302**     | Redirect back to the provided redirect_uri | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## exchangeToken

> TokenGrantResponse exchangeToken(grant_type, client_id, client_secret, code, redirect_uri, code_verifier, refresh_token, username, password, scope)

### Example

```ts
import { Configuration, DefaultApi } from "@iracing-data/oauth-client-fetch";
import type { ExchangeTokenRequest } from "@iracing-data/oauth-client-fetch";

async function example() {
  console.log("🚀 Testing @iracing-data/oauth-client-fetch SDK...");
  const api = new DefaultApi();

  const body = {
    // string (optional)
    grant_type: grant_type_example,
    // string | The client identifier issued during client registration. (optional)
    client_id: client_id_example,
    // string | The client secret issued during registration. (optional)
    client_secret: client_secret_example,
    // string | As returned to the redirect_uri of the client. (optional)
    code: code_example,
    // string | The same redirect_uri used to `/authorize`. (optional)
    redirect_uri: redirect_uri_example,
    // string | The PKCE code verifier which is only required if a code_challenge was used to `/authorize``. (optional)
    code_verifier: code_verifier_example,
    // string | As returned in the `/token` response. (optional)
    refresh_token: refresh_token_example,
    // string | The email address or other issued identifier for a user. (optional)
    username: username_example,
    // string | The password of the user. Password must be masked with the `username` before it is sent to the server. (optional)
    password: password_example,
    // string | One or more scopes to request, if any, separated by whitespace. (optional)
    scope: scope_example,
  } satisfies ExchangeTokenRequest;

  try {
    const data = await api.exchangeToken(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type               | Description                                                                                                      | Notes                                                         |
| ----------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **grant_type**    | `password_limited` |                                                                                                                  | [Optional] [Defaults to `undefined`] [Enum: password_limited] |
| **client_id**     | `string`           | The client identifier issued during client registration.                                                         | [Optional] [Defaults to `undefined`]                          |
| **client_secret** | `string`           | The client secret issued during registration.                                                                    | [Optional] [Defaults to `undefined`]                          |
| **code**          | `string`           | As returned to the redirect_uri of the client.                                                                   | [Optional] [Defaults to `undefined`]                          |
| **redirect_uri**  | `string`           | The same redirect_uri used to &#x60;/authorize&#x60;.                                                            | [Optional] [Defaults to `undefined`]                          |
| **code_verifier** | `string`           | The PKCE code verifier which is only required if a code_challenge was used to &#x60;/authorize&#x60;&#x60;.      | [Optional] [Defaults to `undefined`]                          |
| **refresh_token** | `string`           | As returned in the &#x60;/token&#x60; response.                                                                  | [Optional] [Defaults to `undefined`]                          |
| **username**      | `string`           | The email address or other issued identifier for a user.                                                         | [Optional] [Defaults to `undefined`]                          |
| **password**      | `string`           | The password of the user. Password must be masked with the &#x60;username&#x60; before it is sent to the server. | [Optional] [Defaults to `undefined`]                          |
| **scope**         | `string`           | One or more scopes to request, if any, separated by whitespace.                                                  | [Optional] [Defaults to `undefined`]                          |

### Return type

[**TokenGrantResponse**](TokenGrantResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description               | Response headers      |
| ----------- | ------------------------- | --------------------- |
| **200**     | Success                   | * x-request-id - <br> |
| **400**     | Failure                   | * x-request-id - <br> |
| **403**     | The request is forbidden. | * x-request-id - <br> |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getProfile

> GetProfile200Response getProfile()

### Example

```ts
import { Configuration, DefaultApi } from "@iracing-data/oauth-client-fetch";
import type { GetProfileRequest } from "@iracing-data/oauth-client-fetch";

async function example() {
  console.log("🚀 Testing @iracing-data/oauth-client-fetch SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.getProfile();
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

[**GetProfile200Response**](GetProfile200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                         | Response headers      |
| ----------- | ----------------------------------- | --------------------- |
| **200**     | Success                             | * x-request-id - <br> |
| **401**     | Access token is missing or invalid. | * x-request-id - <br> |
| **403**     | The request is forbidden.           | * x-request-id - <br> |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getSessions

> GetSessions200Response getSessions()

### Example

```ts
import { Configuration, DefaultApi } from "@iracing-data/oauth-client-fetch";
import type { GetSessionsRequest } from "@iracing-data/oauth-client-fetch";

async function example() {
  console.log("🚀 Testing @iracing-data/oauth-client-fetch SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.getSessions();
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

[**GetSessions200Response**](GetSessions200Response.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                         | Response headers      |
| ----------- | ----------------------------------- | --------------------- |
| **200**     | Success                             | * x-request-id - <br> |
| **401**     | Access token is missing or invalid. | * x-request-id - <br> |
| **403**     | The request is forbidden.           | * x-request-id - <br> |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## revokeClient

> revokeClient()

### Example

```ts
import { Configuration, DefaultApi } from "@iracing-data/oauth-client-fetch";
import type { RevokeClientRequest } from "@iracing-data/oauth-client-fetch";

async function example() {
  console.log("🚀 Testing @iracing-data/oauth-client-fetch SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  try {
    const data = await api.revokeClient();
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

| Status code | Description                           | Response headers      |
| ----------- | ------------------------------------- | --------------------- |
| **200**     | Session(s) were successfully revoked. | * x-request-id - <br> |
| **401**     | Access token is missing or invalid.   | * x-request-id - <br> |
| **403**     | The request is forbidden.             | * x-request-id - <br> |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## revokeCurrent

> revokeCurrent(forget_browser)

### Example

```ts
import { Configuration, DefaultApi } from "@iracing-data/oauth-client-fetch";
import type { RevokeCurrentRequest } from "@iracing-data/oauth-client-fetch";

async function example() {
  console.log("🚀 Testing @iracing-data/oauth-client-fetch SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // boolean (optional)
    forget_browser: true,
  } satisfies RevokeCurrentRequest;

  try {
    const data = await api.revokeCurrent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name               | Type      | Description | Notes                                |
| ------------------ | --------- | ----------- | ------------------------------------ |
| **forget_browser** | `boolean` |             | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                           | Response headers      |
| ----------- | ------------------------------------- | --------------------- |
| **200**     | Session(s) were successfully revoked. | * x-request-id - <br> |
| **401**     | Access token is missing or invalid.   | * x-request-id - <br> |
| **403**     | The request is forbidden.             | * x-request-id - <br> |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## revokeSessions

> revokeSessions(session_ids)

### Example

```ts
import { Configuration, DefaultApi } from "@iracing-data/oauth-client-fetch";
import type { RevokeSessionsRequest } from "@iracing-data/oauth-client-fetch";

async function example() {
  console.log("🚀 Testing @iracing-data/oauth-client-fetch SDK...");
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DefaultApi(config);

  const body = {
    // string
    session_ids: session_ids_example,
  } satisfies RevokeSessionsRequest;

  try {
    const data = await api.revokeSessions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name            | Type     | Description | Notes                     |
| --------------- | -------- | ----------- | ------------------------- |
| **session_ids** | `string` |             | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description                           | Response headers      |
| ----------- | ------------------------------------- | --------------------- |
| **200**     | Session(s) were successfully revoked. | * x-request-id - <br> |
| **401**     | Access token is missing or invalid.   | * x-request-id - <br> |
| **403**     | The request is forbidden.             | * x-request-id - <br> |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
