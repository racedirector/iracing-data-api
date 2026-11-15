# \SessionApi

All URIs are relative to *https://members-ng.iracing.com*

| Method                                                                             | HTTP request                           | Description |
| ---------------------------------------------------------------------------------- | -------------------------------------- | ----------- |
| [**get_session_registered_drivers**](SessionApi.md#get_session_registered_drivers) | **GET** /data/session/reg_drivers_list |

## get_session_registered_drivers

> models::IracingApiResponse get_session_registered_drivers(subsession_id)

### Parameters

| Name              | Type    | Description | Required   | Notes |
| ----------------- | ------- | ----------- | ---------- | ----- |
| **subsession_id** | **f64** |             | [required] |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
