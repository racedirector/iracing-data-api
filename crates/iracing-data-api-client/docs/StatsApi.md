# \StatsApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_stats_member_bests**](StatsApi.md#get_stats_member_bests) | **GET** /data/stats/member_bests | 
[**get_stats_member_career**](StatsApi.md#get_stats_member_career) | **GET** /data/stats/member_career | 
[**get_stats_member_division**](StatsApi.md#get_stats_member_division) | **GET** /data/stats/member_division | 
[**get_stats_member_recap**](StatsApi.md#get_stats_member_recap) | **GET** /data/stats/member_recap | 
[**get_stats_member_recent_races**](StatsApi.md#get_stats_member_recent_races) | **GET** /data/stats/member_recent_races | 
[**get_stats_member_summary**](StatsApi.md#get_stats_member_summary) | **GET** /data/stats/member_summary | 
[**get_stats_member_yearly**](StatsApi.md#get_stats_member_yearly) | **GET** /data/stats/member_yearly | 
[**get_stats_season_driver_standings**](StatsApi.md#get_stats_season_driver_standings) | **GET** /data/stats/season_driver_standings | 
[**get_stats_season_qualify_results**](StatsApi.md#get_stats_season_qualify_results) | **GET** /data/stats/season_qualify_results | 
[**get_stats_season_supersession_standings**](StatsApi.md#get_stats_season_supersession_standings) | **GET** /data/stats/season_supersession_standings | 
[**get_stats_season_team_standings**](StatsApi.md#get_stats_season_team_standings) | **GET** /data/stats/season_team_standings | 
[**get_stats_season_time_trial_results**](StatsApi.md#get_stats_season_time_trial_results) | **GET** /data/stats/season_time_trial_results | 
[**get_stats_season_time_trial_standings**](StatsApi.md#get_stats_season_time_trial_standings) | **GET** /data/stats/season_time_trial_standings | 
[**get_stats_world_records**](StatsApi.md#get_stats_world_records) | **GET** /data/stats/world_records | 



## get_stats_member_bests

> models::IracingApiResponse get_stats_member_bests(cust_id, car_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**cust_id** | Option<**f64**> | Defaults to the authenticated member. |  |
**car_id** | Option<**f64**> | First call should exclude car_id; use cars_driven list in return for subsequent calls. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_member_career

> models::IracingApiResponse get_stats_member_career(cust_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**cust_id** | Option<**f64**> | Defaults to the authenticated member. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_member_division

> models::IracingApiResponse get_stats_member_division(season_id, event_type)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_id** | **f64** |  | [required] |
**event_type** | **f64** | The event type code for the division type: 4 - Time Trial; 5 - Race | [required] |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_member_recap

> models::IracingApiResponse get_stats_member_recap(cust_id, year, season)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**cust_id** | Option<**f64**> | Defaults to the authenticated member. |  |
**year** | Option<**f64**> | Season year; if not supplied the current calendar year (UTC) is used. |  |
**season** | Option<**f64**> | Season (quarter) within the year; if not supplied the recap will be for the entire year. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_member_recent_races

> models::IracingApiResponse get_stats_member_recent_races(cust_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**cust_id** | Option<**f64**> | Defaults to the authenticated member. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_member_summary

> models::IracingApiResponse get_stats_member_summary(cust_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**cust_id** | Option<**f64**> | Defaults to the authenticated member. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_member_yearly

> models::IracingApiResponse get_stats_member_yearly(cust_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**cust_id** | Option<**f64**> | Defaults to the authenticated member. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_season_driver_standings

> models::IracingApiResponse get_stats_season_driver_standings(season_id, car_class_id, division, race_week_num)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_id** | **f64** |  | [required] |
**car_class_id** | **f64** |  | [required] |
**division** | Option<[**IracingDivision**](.md)> |  |  |
**race_week_num** | Option<**f64**> | The first race week of a season is 0. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_season_qualify_results

> models::IracingApiResponse get_stats_season_qualify_results(season_id, car_class_id, race_week_num, division)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_id** | **f64** |  | [required] |
**car_class_id** | **f64** |  | [required] |
**race_week_num** | **f64** | The first race week of a season is 0. | [required] |
**division** | Option<[**IracingDivision**](.md)> |  |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_season_supersession_standings

> models::IracingApiResponse get_stats_season_supersession_standings(season_id, car_class_id, division, race_week_num)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_id** | **f64** |  | [required] |
**car_class_id** | **f64** |  | [required] |
**division** | Option<[**IracingDivision**](.md)> |  |  |
**race_week_num** | Option<**f64**> | The first race week of a season is 0. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_season_team_standings

> models::IracingApiResponse get_stats_season_team_standings(season_id, car_class_id, race_week_num)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_id** | **f64** |  | [required] |
**car_class_id** | **f64** |  | [required] |
**race_week_num** | Option<**f64**> | The first race week of a season is 0. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_season_time_trial_results

> models::IracingApiResponse get_stats_season_time_trial_results(season_id, car_class_id, race_week_num, division)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_id** | **f64** |  | [required] |
**car_class_id** | **f64** |  | [required] |
**race_week_num** | **f64** | The first race week of a season is 0. | [required] |
**division** | Option<[**IracingDivision**](.md)> |  |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_season_time_trial_standings

> models::IracingApiResponse get_stats_season_time_trial_standings(season_id, car_class_id, division, race_week_num)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**season_id** | **f64** |  | [required] |
**car_class_id** | **f64** |  | [required] |
**division** | Option<[**IracingDivision**](.md)> |  |  |
**race_week_num** | Option<**f64**> | The first race week of a season is 0. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_stats_world_records

> models::IracingApiResponse get_stats_world_records(car_id, track_id, season_year, season_quarter)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**car_id** | **f64** |  | [required] |
**track_id** | **f64** |  | [required] |
**season_year** | Option<**f64**> | Limit best times to a given year. |  |
**season_quarter** | Option<**f64**> | Limit best times to a given quarter; only applicable when year is used. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

