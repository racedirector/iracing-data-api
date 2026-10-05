# IracingServiceMethodDocs

An iRacing API Service Method object.

## Properties

| Name                  | Type                                                                                                | Description | Notes                             |
| --------------------- | --------------------------------------------------------------------------------------------------- | ----------- | --------------------------------- |
| **link**              | **string**                                                                                          |             | [default to undefined]            |
| **parameters**        | [**{ [key: string]: IracingServiceMethodParametersDocs; }**](IracingServiceMethodParametersDocs.md) |             | [optional] [default to undefined] |
| **note**              | [**IracingServiceMethodDocsNote**](IracingServiceMethodDocsNote.md)                                 |             | [optional] [default to undefined] |
| **expirationSeconds** | **number**                                                                                          |             | [optional] [default to undefined] |

## Example

```typescript
import { IracingServiceMethodDocs } from "@iracing-data/api-client-axios";

const instance: IracingServiceMethodDocs = {
  link,
  parameters,
  note,
  expirationSeconds,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
