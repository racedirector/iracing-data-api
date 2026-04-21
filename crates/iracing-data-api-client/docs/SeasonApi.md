# \SeasonApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_season_list**](SeasonApi.md#get_season_list) | **GET** /data/season/list | 
[**get_season_race_guide**](SeasonApi.md#get_season_race_guide) | **GET** /data/season/race_guide | 
[**get_season_spectator_subsession_ids**](SeasonApi.md#get_season_spectator_subsession_ids) | **GET** /data/season/spectator_subsessionids | 
[**get_season_spectator_subsession_ids_detail**](SeasonApi.md#get_season_spectator_subsession_ids_detail) | **GET** /data/season/spectator_subsessionids_detail | 



## get_season_list

> models::IracingApiResponse get_season_list(season_year, season_quarter)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_year** | **f64** |  | [required] |
**season_quarter** | **f64** |  | [required] |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_season_race_guide

> models::IracingApiResponse get_season_race_guide(from, include_end_after_from)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**from** | Option<**String**> | ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time. |  |
**include_end_after_from** | Option<**bool**> | Include sessions which start before 'from' but end after. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_season_spectator_subsession_ids

> models::IracingApiResponse get_season_spectator_subsession_ids(event_types)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**event_types** | Option<[**Vec<models::IracingEventType>**](models::IracingEventType.md)> | Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5 |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_season_spectator_subsession_ids_detail

> models::IracingApiResponse get_season_spectator_subsession_ids_detail(event_types, season_ids)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**event_types** | Option<[**Vec<models::IracingEventType>**](models::IracingEventType.md)> | Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5 |  |
**season_ids** | Option<[**Vec<f64>**](f64.md)> | Seasons to include in the search. Defaults to all. ?season_ids=513,937 |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

