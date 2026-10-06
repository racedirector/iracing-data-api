# GetSessions200ResponseSessionsInner

## Properties

| Name                            | Type                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `sessionId`                     | string                                                                                      |
| `clientId`                      | string                                                                                      |
| `clientName`                    | string                                                                                      |
| `clientDeveloperName`           | string                                                                                      |
| `clientDeveloperUrl`            | string                                                                                      |
| `clientDeveloperEmail`          | string                                                                                      |
| `scope`                         | string                                                                                      |
| `scopeDescriptions`             | Array&lt;string&gt;                                                                         |
| `authTime`                      | number                                                                                      |
| `lastActivity`                  | number                                                                                      |
| `sessionExpiration`             | number                                                                                      |
| `currentSession`                | boolean                                                                                     |
| `impersonated`                  | boolean                                                                                     |
| `impersonationNote`             | string                                                                                      |
| `firstIp`                       | [GetSessions200ResponseSessionsInnerFirstIp](GetSessions200ResponseSessionsInnerFirstIp.md) |
| `firstContinent`                | string                                                                                      |
| `firstCountry`                  | string                                                                                      |
| `firstSubdivisions`             | Array&lt;string&gt;                                                                         |
| `firstCity`                     | string                                                                                      |
| `firstUserAgentHeader`          | string                                                                                      |
| `firstUserAgentOperatingSystem` | string                                                                                      |
| `firstUserAgentBrowser`         | string                                                                                      |
| `lastIp`                        | [GetSessions200ResponseSessionsInnerFirstIp](GetSessions200ResponseSessionsInnerFirstIp.md) |
| `lastContinent`                 | string                                                                                      |
| `lastCountry`                   | string                                                                                      |
| `lastSubdivisions`              | Array&lt;string&gt;                                                                         |
| `lastCity`                      | string                                                                                      |
| `lastUserAgentHeader`           | string                                                                                      |
| `lastUserAgentOperatingSystem`  | string                                                                                      |
| `lastUserAgentBrowser`          | string                                                                                      |

## Example

```typescript
import type { GetSessions200ResponseSessionsInner } from "@iracing-data/oauth-client-fetch";

// TODO: Update the object below with actual values
const example = {
  sessionId: null,
  clientId: null,
  clientName: null,
  clientDeveloperName: null,
  clientDeveloperUrl: null,
  clientDeveloperEmail: null,
  scope: null,
  scopeDescriptions: null,
  authTime: null,
  lastActivity: null,
  sessionExpiration: null,
  currentSession: null,
  impersonated: null,
  impersonationNote: null,
  firstIp: null,
  firstContinent: null,
  firstCountry: null,
  firstSubdivisions: null,
  firstCity: null,
  firstUserAgentHeader: null,
  firstUserAgentOperatingSystem: null,
  firstUserAgentBrowser: null,
  lastIp: null,
  lastContinent: null,
  lastCountry: null,
  lastSubdivisions: null,
  lastCity: null,
  lastUserAgentHeader: null,
  lastUserAgentOperatingSystem: null,
  lastUserAgentBrowser: null,
} satisfies GetSessions200ResponseSessionsInner;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(
  exampleJSON,
) as GetSessions200ResponseSessionsInner;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
