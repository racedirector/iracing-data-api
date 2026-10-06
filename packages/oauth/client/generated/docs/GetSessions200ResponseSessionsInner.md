# GetSessions200ResponseSessionsInner

## Properties

| Name                                | Type                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `session_id`                        | string                                                                                      |
| `client_id`                         | string                                                                                      |
| `client_name`                       | string                                                                                      |
| `client_developer_name`             | string                                                                                      |
| `client_developer_url`              | string                                                                                      |
| `client_developer_email`            | string                                                                                      |
| `scope`                             | string                                                                                      |
| `scope_descriptions`                | Array&lt;string&gt;                                                                         |
| `auth_time`                         | number                                                                                      |
| `last_activity`                     | number                                                                                      |
| `session_expiration`                | number                                                                                      |
| `current_session`                   | boolean                                                                                     |
| `impersonated`                      | boolean                                                                                     |
| `impersonation_note`                | string                                                                                      |
| `first_ip`                          | [GetSessions200ResponseSessionsInnerFirstIp](GetSessions200ResponseSessionsInnerFirstIp.md) |
| `first_continent`                   | string                                                                                      |
| `first_country`                     | string                                                                                      |
| `first_subdivisions`                | Array&lt;string&gt;                                                                         |
| `first_city`                        | string                                                                                      |
| `first_user_agent_header`           | string                                                                                      |
| `first_user_agent_operating_system` | string                                                                                      |
| `first_user_agent_browser`          | string                                                                                      |
| `last_ip`                           | [GetSessions200ResponseSessionsInnerFirstIp](GetSessions200ResponseSessionsInnerFirstIp.md) |
| `last_continent`                    | string                                                                                      |
| `last_country`                      | string                                                                                      |
| `last_subdivisions`                 | Array&lt;string&gt;                                                                         |
| `last_city`                         | string                                                                                      |
| `last_user_agent_header`            | string                                                                                      |
| `last_user_agent_operating_system`  | string                                                                                      |
| `last_user_agent_browser`           | string                                                                                      |

## Example

```typescript
import type { GetSessions200ResponseSessionsInner } from "@iracing-data/oauth-client-fetch";

// TODO: Update the object below with actual values
const example = {
  session_id: null,
  client_id: null,
  client_name: null,
  client_developer_name: null,
  client_developer_url: null,
  client_developer_email: null,
  scope: null,
  scope_descriptions: null,
  auth_time: null,
  last_activity: null,
  session_expiration: null,
  current_session: null,
  impersonated: null,
  impersonation_note: null,
  first_ip: null,
  first_continent: null,
  first_country: null,
  first_subdivisions: null,
  first_city: null,
  first_user_agent_header: null,
  first_user_agent_operating_system: null,
  first_user_agent_browser: null,
  last_ip: null,
  last_continent: null,
  last_country: null,
  last_subdivisions: null,
  last_city: null,
  last_user_agent_header: null,
  last_user_agent_operating_system: null,
  last_user_agent_browser: null,
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
