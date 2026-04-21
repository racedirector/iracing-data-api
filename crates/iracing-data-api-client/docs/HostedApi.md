# \HostedApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_hosted_combined_sessions**](HostedApi.md#get_hosted_combined_sessions) | **GET** /data/hosted/combined_sessions | 
[**get_hosted_sessions**](HostedApi.md#get_hosted_sessions) | **GET** /data/hosted/sessions | 



## get_hosted_combined_sessions

> models::IracingApiResponse get_hosted_combined_sessions(package_id)


Sessions that can be joined as a driver or spectator, and also includes non-league pending sessions for the user.

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**package_id** | Option<**f64**> | If set, return only sessions using this car or track package ID. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_hosted_sessions

> models::IracingApiResponse get_hosted_sessions()


Sessions that can be joined as a driver. Without spectator and non-league pending sessions for the user.

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

