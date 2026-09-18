# iRacing OAuth protocol baseline

Last audited: **2026-09-18**

This concise baseline helps future audits establish historical evidence. It is not a frozen specification and never replaces live official documentation. Update it only after completing a live audit; retain meaningful prior versions in git history so a later audit can distinguish confirmed upstream change from a newly discovered repository mismatch.

## Official pages examined

- [Introduction](https://oauth.iracing.com/oauth2/book/introduction.html)
- [Authentication and Authorization](https://oauth.iracing.com/oauth2/book/auth_overview.html)
- [Authentication Flows](https://oauth.iracing.com/oauth2/book/authentication_flows_overview.html)
- [Authorization Code Flow](https://oauth.iracing.com/oauth2/book/authorization_code_flow.html)
- [Password Limited Flow](https://oauth.iracing.com/oauth2/book/password_limited_flow.html)
- [`/authorize`](https://oauth.iracing.com/oauth2/book/authorize_endpoint.html)
- [`/token`](https://oauth.iracing.com/oauth2/book/token_endpoint.html)
- [PKCE Challenges and Verifiers](https://oauth.iracing.com/oauth2/book/pkce_overview.html)
- [Tokens](https://oauth.iracing.com/oauth2/book/tokens_overview.html)
- [Access Token](https://oauth.iracing.com/oauth2/book/access_token.html)
- [Refresh Token](https://oauth.iracing.com/oauth2/book/refresh_token.html)
- [Scopes](https://oauth.iracing.com/oauth2/book/scopes.html)
- [Client Types](https://oauth.iracing.com/oauth2/book/client_types_overview.html)
- [Client Roles](https://oauth.iracing.com/oauth2/book/client_roles_overview.html)
- [Client Registration](https://oauth.iracing.com/oauth2/book/client_registration.html)
- [Errors](https://oauth.iracing.com/oauth2/book/errors.html)
- [`x-request-id`](https://oauth.iracing.com/oauth2/book/x_request_id.html)
- [Session Management](https://oauth.iracing.com/oauth2/book/sessions_overview.html)
- [`/sessions`](https://oauth.iracing.com/oauth2/book/sessions_endpoint.html)
- [`/revoke/current`](https://oauth.iracing.com/oauth2/book/revoke_current_endpoint.html)
- [`/revoke/sessions`](https://oauth.iracing.com/oauth2/book/revoke_sessions_endpoint.html)
- [`/revoke/client`](https://oauth.iracing.com/oauth2/book/revoke_client_endpoint.html)
- [`/iracing/profile`](https://oauth.iracing.com/oauth2/book/iracing_profile_endpoint.html)
- [Workflows](https://oauth.iracing.com/oauth2/book/workflows_overview.html)
- [Data API Workflow](https://oauth.iracing.com/oauth2/book/data_api_workflow.html)
- [Identity Verification Workflow](https://oauth.iracing.com/oauth2/book/identity_verification_workflow.html)

## Contract snapshot

- Service endpoints are rooted at `https://oauth.iracing.com/oauth2`. `/authorize` is GET; `/token` is POST with `application/x-www-form-urlencoded` data. Protected profile/session/revocation endpoints use Bearer authorization.
- `/authorize` requires `client_id`, exact registered `redirect_uri`, and `response_type=code`. PKCE is required for clients unable to keep a secret and recommended otherwise. `code_challenge_method` supports `S256` and `plain`, defaulting to `plain`; `state`, `scope`, and `prompt` are optional. The documented prompt value is `verify` and unknown prompt values are ignored.
- PKCE verifiers are 43-128 characters from the unreserved character set. The documented S256 challenge is SHA-256 followed by unpadded URL-safe Base64.
- `/token` supports `authorization_code`, `refresh_token`, and iRacing's `password_limited` grants. A client secret is required when issued and is sent masked. A code verifier is conditionally required when the authorization request used a challenge.
- Successful token JSON uses exact `token_type` value `Bearer`; `access_token` and `expires_in` are present. `refresh_token`, `refresh_token_expires_in`, and `scope` may be omitted. Granted scopes may differ from requested scopes.
- Refresh tokens are opaque, single-use, typically seven days but runtime lifetime fields are authoritative. A used refresh token is replaced by the newly returned token for continued refresh.
- Secret masking is SHA-256 over UTF-8 `secret + trim(identifier).toLowerCase()`, encoded with standard padded Base64. Masking occurs before form percent encoding. Client secrets use `client_id`; passwords use `username`.
- Password Limited is for confidential, pre-authorized headless clients and should normally be called once at startup. It exposes `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset`; an exceeded limit is documented as HTTP 400 `unauthorized_client` plus `Retry-After`.
- Current requestable scopes are `iracing.auth` and `iracing.profile`. The service may grant fewer requested scopes or add others, so request validation and response parsing have different extensibility needs.
- Authorization errors may be redirect query parameters; unidentified-client errors may be JSON. The general JSON fields are `status`, `status_reason`, `error`, `error_description`, and `error_uri`; redirect errors may include `state`. The Errors page records the current code/status table.
- Access tokens are currently signed JWT/JWS values, but the docs instruct ordinary clients to treat them as opaque and warn that claims may change or be added. Advanced validation requires signature verification plus time, issuer, audience, scope, and conditional environment checks. `alg=none` is forbidden; `jku` has HTTPS/domain/component restrictions and must not be fetched through redirects.
- `/iracing/profile` returns `iracing_name` and numeric `iracing_cust_id` for tokens granted `iracing.profile`.
- `/sessions` returns session objects including `auth_time`, `last_activity`, and `session_expiration`; `scope_descriptions`, `first_subdivisions`, and `last_subdivisions` are arrays when non-null. Session identifiers are opaque.
- Revocation forms use `forget_browser` for `/revoke/current` and `session_ids` for `/revoke/sessions`; successful revocation returns HTTP 200 with no body. `/revoke/client` has no request parameters and requires a user session.
- Responses expose `x-request-id` for support correlation. The Data API workflow uses `iracing.auth`, Bearer access tokens, refresh-token rotation, and reauthentication only after no valid token remains.

## Baseline maintenance

After a future live audit, update the date, page list, and only contract facts that materially affect compatibility. In the audit report, cite the git diff or historical version of this file before labeling a difference a confirmed upstream change. Do not paste large sections of the external documentation here.
