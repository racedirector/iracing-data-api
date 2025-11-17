
# IracingServiceMethodDocs

An iRacing API Service Method object.

## Properties

Name | Type
------------ | -------------
`link` | string
`parameters` | [{ [key: string]: IracingServiceMethodParametersDocs; }](IracingServiceMethodParametersDocs.md)
`expirationSeconds` | number

## Example

```typescript
import type { IracingServiceMethodDocs } from '@iracing-data/api-client-fetch'

// TODO: Update the object below with actual values
const example = {
  "link": null,
  "parameters": null,
  "expirationSeconds": null,
} satisfies IracingServiceMethodDocs

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as IracingServiceMethodDocs
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


