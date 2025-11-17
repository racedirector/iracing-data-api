
# IracingServiceMethodParametersDocs

An iRacing API Service Method Parameters object.

## Properties

Name | Type
------------ | -------------
`type` | string
`note` | string
`required` | boolean

## Example

```typescript
import type { IracingServiceMethodParametersDocs } from '@iracing-data/api-client-fetch'

// TODO: Update the object below with actual values
const example = {
  "type": null,
  "note": null,
  "required": null,
} satisfies IracingServiceMethodParametersDocs

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as IracingServiceMethodParametersDocs
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


