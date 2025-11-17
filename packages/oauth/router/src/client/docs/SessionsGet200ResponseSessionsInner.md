
# SessionsGet200ResponseSessionsInner


## Properties

Name | Type
------------ | -------------
`sessionId` | string
`clientId` | string
`clientName` | string
`clientDeveloperName` | string
`clientDeveloperUrl` | string
`clientDeveloperEmail` | string
`scope` | string
`scopeDescriptions` | string
`currentSession` | boolean
`impersonated` | boolean
`impersonationNote` | string
`firstIp` | string
`firstContinent` | string
`firstCountry` | string
`firstSubdivisions` | string
`firstCity` | string
`firstUserAgentHeader` | string
`firstUserAgentOperatingSystem` | string
`firstUserAgentBrowser` | string
`lastIp` | string
`lastContinent` | string
`lastCountry` | string
`lastSubdivisions` | string
`lastCity` | string
`lastUserAgentHeader` | string
`lastUserAgentOperatingSystem` | string
`lastUserAgentBrowser` | string

## Example

```typescript
import type { SessionsGet200ResponseSessionsInner } from ''

// TODO: Update the object below with actual values
const example = {
  "sessionId": null,
  "clientId": null,
  "clientName": null,
  "clientDeveloperName": null,
  "clientDeveloperUrl": null,
  "clientDeveloperEmail": null,
  "scope": null,
  "scopeDescriptions": null,
  "currentSession": null,
  "impersonated": null,
  "impersonationNote": null,
  "firstIp": null,
  "firstContinent": null,
  "firstCountry": null,
  "firstSubdivisions": null,
  "firstCity": null,
  "firstUserAgentHeader": null,
  "firstUserAgentOperatingSystem": null,
  "firstUserAgentBrowser": null,
  "lastIp": null,
  "lastContinent": null,
  "lastCountry": null,
  "lastSubdivisions": null,
  "lastCity": null,
  "lastUserAgentHeader": null,
  "lastUserAgentOperatingSystem": null,
  "lastUserAgentBrowser": null,
} satisfies SessionsGet200ResponseSessionsInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SessionsGet200ResponseSessionsInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


