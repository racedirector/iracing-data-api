# \SeriesApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_series**](SeriesApi.md#get_series) | **GET** /data/series/get | 
[**get_series_assets**](SeriesApi.md#get_series_assets) | **GET** /data/series/assets | 
[**get_series_past_seasons**](SeriesApi.md#get_series_past_seasons) | **GET** /data/series/past_seasons | 
[**get_series_season_list**](SeriesApi.md#get_series_season_list) | **GET** /data/series/season_list | 
[**get_series_season_schedule**](SeriesApi.md#get_series_season_schedule) | **GET** /data/series/season_schedule | 
[**get_series_seasons**](SeriesApi.md#get_series_seasons) | **GET** /data/series/seasons | 
[**get_series_stats_series**](SeriesApi.md#get_series_stats_series) | **GET** /data/series/stats_series | 



## get_series

> models::IracingApiResponse get_series()


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


## get_series_assets

> models::IracingApiResponse get_series_assets()


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


## get_series_past_seasons

> models::IracingApiResponse get_series_past_seasons(series_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**series_id** | **f64** |  | [required] |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_series_season_list

> models::IracingApiResponse get_series_season_list(include_series, season_year, season_quarter)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**include_series** | Option<**bool**> |  |  |
**season_year** | Option<**f64**> |  |  |
**season_quarter** | Option<**f64**> |  |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_series_season_schedule

> models::IracingApiResponse get_series_season_schedule(season_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_id** | **f64** |  | [required] |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_series_seasons

> models::IracingApiResponse get_series_seasons(include_series, season_year, season_quarter)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**include_series** | Option<**bool**> |  |  |
**season_year** | Option<**f64**> | To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. |  |
**season_quarter** | Option<**f64**> | To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_series_stats_series

> models::IracingApiResponse get_series_stats_series()


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

