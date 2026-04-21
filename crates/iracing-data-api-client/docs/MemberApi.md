# \MemberApi

All URIs are relative to *https://members-ng.iracing.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_member**](MemberApi.md#get_member) | **GET** /data/member/get | 
[**get_member_award_instances**](MemberApi.md#get_member_award_instances) | **GET** /data/member/award_instances | 
[**get_member_awards**](MemberApi.md#get_member_awards) | **GET** /data/member/awards | 
[**get_member_chart_data**](MemberApi.md#get_member_chart_data) | **GET** /data/member/chart_data | 
[**get_member_info**](MemberApi.md#get_member_info) | **GET** /data/member/info | 
[**get_member_participation_credits**](MemberApi.md#get_member_participation_credits) | **GET** /data/member/participation_credits | 
[**get_member_profile**](MemberApi.md#get_member_profile) | **GET** /data/member/profile | Gets a requested user's profile.



## get_member

> models::IracingApiResponse get_member(cust_ids, include_licenses)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**cust_ids** | **String** | Comma-separated list of customer IDs. Example: ?cust_ids=2,3,4 | [required] |
**include_licenses** | Option<**bool**> |  |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_member_award_instances

> models::IracingApiResponse get_member_award_instances(award_id, cust_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**award_id** | **f64** |  | [required] |
**cust_id** | Option<**f64**> | Defaults to the authenticated member. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_member_awards

> models::IracingApiResponse get_member_awards(cust_id)


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


## get_member_chart_data

> models::IracingApiResponse get_member_chart_data(category_id, chart_type, cust_id)


### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**category_id** | **f64** | 1 - Oval; 2 - Road; 3 - Dirt oval; 4 - Dirt road | [required] |
**chart_type** | **f64** | 1 - iRating; 2 - TT Rating; 3 - License/SR | [required] |
**cust_id** | Option<**f64**> | Defaults to the authenticated member. |  |

### Return type

[**models::IracingApiResponse**](iracingAPIResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## get_member_info

> models::IracingApiResponse get_member_info()


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


## get_member_participation_credits

> models::IracingApiResponse get_member_participation_credits()


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


## get_member_profile

> models::IracingApiResponse get_member_profile(cust_id)
Gets a requested user's profile.

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

