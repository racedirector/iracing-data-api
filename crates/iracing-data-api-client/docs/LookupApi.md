# \LookupApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_lookup**](LookupApi.md#get_lookup) | **GET** /data/lookup/get | 
[**get_lookup_countries**](LookupApi.md#get_lookup_countries) | **GET** /data/lookup/countries | 
[**get_lookup_drivers**](LookupApi.md#get_lookup_drivers) | **GET** /data/lookup/drivers | 
[**get_lookup_flairs**](LookupApi.md#get_lookup_flairs) | **GET** /data/lookup/flairs | 
[**get_lookup_licenses**](LookupApi.md#get_lookup_licenses) | **GET** /data/lookup/licenses | 



## get_lookup

> models::IracingApiResponse get_lookup()


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


## get_lookup_countries

> models::IracingApiResponse get_lookup_countries()


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


## get_lookup_drivers

> models::IracingApiResponse get_lookup_drivers(search_term, league_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**search_term** | **String** | A cust_id or partial name for which to search. | [required] |
**league_id** | Option<**f64**> | Narrow the search to the roster of the given league. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_lookup_flairs

> models::IracingApiResponse get_lookup_flairs()


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


## get_lookup_licenses

> models::IracingApiResponse get_lookup_licenses()


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

