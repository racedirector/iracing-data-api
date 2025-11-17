# IracingServiceMethodDocs

An iRacing API Service Method object.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**link** | **string** |  | [default to undefined]
**parameters** | [**{ [key: string]: IracingServiceMethodParametersDocs; }**](IracingServiceMethodParametersDocs.md) |  | [default to undefined]
**expirationSeconds** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { IracingServiceMethodDocs } from '@iracing-data/api-client-axios';

const instance: IracingServiceMethodDocs = {
    link,
    parameters,
    expirationSeconds,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
