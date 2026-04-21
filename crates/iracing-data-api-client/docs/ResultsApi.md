# \ResultsApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_results**](ResultsApi.md#get_results) | **GET** /data/results/get | 
[**get_results_event_log**](ResultsApi.md#get_results_event_log) | **GET** /data/results/event_log | 
[**get_results_lap_chart_data**](ResultsApi.md#get_results_lap_chart_data) | **GET** /data/results/lap_chart_data | 
[**get_results_lap_data**](ResultsApi.md#get_results_lap_data) | **GET** /data/results/lap_data | 
[**get_results_search_hosted**](ResultsApi.md#get_results_search_hosted) | **GET** /data/results/search_hosted | 
[**get_results_search_series**](ResultsApi.md#get_results_search_series) | **GET** /data/results/search_series | 
[**get_results_season_results**](ResultsApi.md#get_results_season_results) | **GET** /data/results/season_results | 



## get_results

> models::IracingApiResponse get_results(subsession_id, include_licenses)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**subsession_id** | **f64** |  | [required] |
**include_licenses** | Option<**bool**> |  |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_results_event_log

> models::IracingApiResponse get_results_event_log(subsession_id, simsession_number)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**subsession_id** | **f64** |  | [required] |
**simsession_number** | **f64** | The main event is 0; the preceding event is -1, and so on. | [required] |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_results_lap_chart_data

> models::IracingApiResponse get_results_lap_chart_data(subsession_id, simsession_number)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**subsession_id** | **f64** |  | [required] |
**simsession_number** | **f64** | The main event is 0; the preceding event is -1, and so on. | [required] |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_results_lap_data

> models::IracingApiResponse get_results_lap_data(subsession_id, simsession_number, cust_id, team_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**subsession_id** | **f64** |  | [required] |
**simsession_number** | **f64** | The main event is 0; the preceding event is -1, and so on. | [required] |
**cust_id** | Option<**f64**> | Required if the subsession was a single-driver event. Optional for team events. If omitted for a team event then the laps driven by all the team's drivers will be included. |  |
**team_id** | Option<**f64**> | Required if the subsession was a team event. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_results_search_hosted

> models::IracingApiResponse get_results_search_hosted(start_range_begin, start_range_end, finish_range_begin, finish_range_end, cust_id, team_id, host_cust_id, session_name, league_id, league_season_id, car_id, track_id, category_ids)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**start_range_begin** | Option<**String**> | Session start times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". |  |
**start_range_end** | Option<**String**> | ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if start_range_begin is less than 90 days in the past. |  |
**finish_range_begin** | Option<**String**> | Session finish times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". |  |
**finish_range_end** | Option<**String**> | ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. |  |
**cust_id** | Option<**f64**> | The participant's customer ID. Ignored if team_id is supplied. |  |
**team_id** | Option<**f64**> | The team ID to search for. Takes priority over cust_id if both are supplied. |  |
**host_cust_id** | Option<**f64**> | The host's customer ID. |  |
**session_name** | Option<**String**> | Part or all of the session's name. |  |
**league_id** | Option<**f64**> | Include only results for the league with this ID. |  |
**league_season_id** | Option<**f64**> | Include only results for the league season with this ID. |  |
**car_id** | Option<**f64**> | One of the cars used by the session. |  |
**track_id** | Option<**f64**> | The ID of the track used by the session. |  |
**category_ids** | Option<**String**> | Track categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4 |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_results_search_series

> models::IracingApiResponse get_results_search_series(season_year, season_quarter, start_range_begin, start_range_end, finish_range_begin, finish_range_end, cust_id, team_id, series_id, race_week_num, official_only, event_types, category_ids)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_year** | Option<**f64**> | Required when using season_quarter. |  |
**season_quarter** | Option<**f64**> | Required when using season_year. |  |
**start_range_begin** | Option<**String**> | Session start times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". |  |
**start_range_end** | Option<**String**> | ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if start_range_begin is less than 90 days in the past. |  |
**finish_range_begin** | Option<**String**> | Session finish times. ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". |  |
**finish_range_end** | Option<**String**> | ISO-8601 UTC time zero offset: \"2022-04-01T15:45Z\". Exclusive. May be omitted if finish_range_begin is less than 90 days in the past. |  |
**cust_id** | Option<**f64**> | Include only sessions in which this customer participated. Ignored if team_id is supplied. |  |
**team_id** | Option<**f64**> | Include only sessions in which this team participated. Takes priority over cust_id if both are supplied. |  |
**series_id** | Option<**f64**> | Include only sessions for series with this ID. |  |
**race_week_num** | Option<**f64**> | Include only sessions with this race week number. |  |
**official_only** | Option<**bool**> | If true, include only sessions earning championship points. Defaults to all. |  |
**event_types** | Option<**String**> | Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5 |  |
**category_ids** | Option<**String**> | License categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4 |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_results_season_results

> models::IracingApiResponse get_results_season_results(season_id, event_type, race_week_num)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_id** | **f64** |  | [required] |
**event_type** | Option<[**IracingEventType**](.md)> | Retrict to one event type: 2 - Practice; 3 - Qualify; 4 - Time Trial; 5 - Race |  |
**race_week_num** | Option<**f64**> | The first race week of a season is 0. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

