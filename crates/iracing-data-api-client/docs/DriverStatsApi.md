# \DriverStatsApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_driver_stats_by_category**](DriverStatsApi.md#get_driver_stats_by_category) | **GET** /data/driver_stats_by_category/{category} | 



## get_driver_stats_by_category

> models::IracingApiResponse get_driver_stats_by_category(category)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**category** | [**IracingCategory**](.md) | Racing category. | [required] |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

