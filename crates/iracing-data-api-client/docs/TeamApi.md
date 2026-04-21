# \TeamApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_team**](TeamApi.md#get_team) | **GET** /data/team/get | 
[**get_team_membership**](TeamApi.md#get_team_membership) | **GET** /data/team/membership | 



## get_team

> models::IracingApiResponse get_team(team_id, include_licenses)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**team_id** | **f64** |  | [required] |
**include_licenses** | Option<**bool**> | For faster responses, only request when necessary. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_team_membership

> models::IracingApiResponse get_team_membership()


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

