# \LeagueApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_league**](LeagueApi.md#get_league) | **GET** /data/league/get | 
[**get_league_customer_league_sessions**](LeagueApi.md#get_league_customer_league_sessions) | **GET** /data/league/cust_league_sessions | 
[**get_league_directory**](LeagueApi.md#get_league_directory) | **GET** /data/league/directory | 
[**get_league_membership**](LeagueApi.md#get_league_membership) | **GET** /data/league/membership | 
[**get_league_points_systems**](LeagueApi.md#get_league_points_systems) | **GET** /data/league/get_points_systems | 
[**get_league_roster**](LeagueApi.md#get_league_roster) | **GET** /data/league/roster | 
[**get_league_season_sessions**](LeagueApi.md#get_league_season_sessions) | **GET** /data/league/season_sessions | 
[**get_league_season_standings**](LeagueApi.md#get_league_season_standings) | **GET** /data/league/season_standings | 
[**get_league_seasons**](LeagueApi.md#get_league_seasons) | **GET** /data/league/seasons | 



## get_league

> models::IracingApiResponse get_league(league_id, include_licenses)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**league_id** | **f64** |  | [required] |
**include_licenses** | Option<**bool**> | For faster responses, only request when necessary. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_league_customer_league_sessions

> models::IracingApiResponse get_league_customer_league_sessions(mine, package_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**mine** | Option<**bool**> | If true, return only sessions created by this user. |  |
**package_id** | Option<**f64**> | If set, return only sessions using this car or track package ID. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_league_directory

> models::IracingApiResponse get_league_directory(search, tag, restrict_to_member, restrict_to_recruiting, restrict_to_friends, restrict_to_watched, minimum_roster_count, maximum_roster_count, lowerbound, upperbound, sort, order)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**search** | Option<**String**> | Will search against league name, description, owner, and league ID. |  |
**tag** | Option<**String**> | One or more tags, comma-separated. |  |
**restrict_to_member** | Option<**bool**> | If true include only leagues for which customer is a member. |  |
**restrict_to_recruiting** | Option<**bool**> | If true include only leagues which are recruiting. |  |
**restrict_to_friends** | Option<**bool**> | If true include only leagues owned by a friend. |  |
**restrict_to_watched** | Option<**bool**> | If true include only leagues owned by a watched member. |  |
**minimum_roster_count** | Option<**f64**> | If set include leagues with at least this number of members. |  |
**maximum_roster_count** | Option<**f64**> | If set include leagues with no more than this number of members. |  |
**lowerbound** | Option<**f64**> | First row of results to return.  Defaults to 1. |  |
**upperbound** | Option<**f64**> | Last row of results to return. Defaults to lowerbound + 39. |  |
**sort** | Option<**String**> | One of relevance, leaguename, displayname, rostercount. displayname is owners's name. Defaults to relevance. |  |
**order** | Option<**String**> | One of asc or desc.  Defaults to asc. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_league_membership

> models::IracingApiResponse get_league_membership(cust_id, include_league)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**cust_id** | Option<**f64**> | If different from the authenticated member, the following restrictions apply: - Caller cannot be on requested customer's block list or an empty list will result; - Requested customer cannot have their online activity preference set to hidden or an empty list will result; - Only leagues for which the requested customer is an admin and the league roster is not private are returned. |  |
**include_league** | Option<**bool**> |  |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_league_points_systems

> models::IracingApiResponse get_league_points_systems(league_id, season_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**league_id** | **f64** |  | [required] |
**season_id** | Option<**f64**> | If included and the season is using custom points (points_system_id:2) then the custom points option is included in the returned list. Otherwise the custom points option is not returned. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_league_roster

> models::IracingApiResponse get_league_roster(league_id, include_licenses)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**league_id** | **f64** |  | [required] |
**include_licenses** | Option<**bool**> | For faster responses, only request when necessary. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_league_season_sessions

> models::IracingApiResponse get_league_season_sessions(league_id, season_id, results_only)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**league_id** | **f64** |  | [required] |
**season_id** | **f64** |  | [required] |
**results_only** | Option<**bool**> | If true include only sessions for which results are available. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_league_season_standings

> models::IracingApiResponse get_league_season_standings(league_id, season_id, car_class_id, car_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**league_id** | **f64** |  | [required] |
**season_id** | **f64** |  | [required] |
**car_class_id** | Option<**f64**> |  |  |
**car_id** | Option<**f64**> | If car_class_id is included then the standings are for the car in that car class, otherwise they are for the car across car classes. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_league_seasons

> models::IracingApiResponse get_league_seasons(league_id, retired)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**league_id** | **f64** |  | [required] |
**retired** | Option<**bool**> | If true include seasons which are no longer active. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

