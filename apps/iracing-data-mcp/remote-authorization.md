# MCP ingress verifier configuration

Remote authorization is opt-in: with all remote settings absent, local behavior is unchanged. Any remote setting requires `IRACING_MCP_RESOURCE_URL` and `IRACING_MCP_AUTH_ISSUER`. Production configuration requires HTTPS URLs without credentials or fragments; issuers also reject queries. Resource paths may be root, `/mcp`, or another externally mapped path. This does not change the listener's `/mcp` route or Host/Origin policy; deployment mapping belongs to #443.

| Setting                     | Policy                                                              |
| --------------------------- | ------------------------------------------------------------------- |
| `IRACING_MCP_RESOURCE_URL`  | Required canonical external resource URI                            |
| `IRACING_MCP_AUTH_ISSUER`   | Required exact trusted issuer                                       |
| `IRACING_MCP_AUTH_AUDIENCE` | Optional; defaults to resource URI, permits another audience        |
| `IRACING_MCP_AUTH_SCOPES`   | Optional space-delimited required scopes; opaque and case-sensitive |
| `IRACING_MCP_AUTH_JWKS_URL` | Optional explicit HTTPS JWKS override                               |

The app-local default verifier uses `jose` for signature, issuer, audience and temporal validation, requires expiration, and returns the configured canonical resource in `AuthInfo`. Client identity uses `client_id`, then `azp`, then `sub` as a final compatibility fallback for generic provider JWTs. RFC 9068 and `typ=at+jwt` are not mandatory. The HTTP boundary consumes the SDK `OAuthTokenVerifier` interface; a future introspection verifier can replace JWT verification.

Without an explicit JWKS URL, startup discovers metadata from the configured issuer: RFC 8414 first, OIDC fallback on HTTP 404 or metadata without `jwks_uri`. Returned issuer agreement is exact. Invalid metadata, unsafe JWKS URLs, non-404 HTTP failures, redirects, and network failures fail startup closed. Each metadata request has a five-second timeout. JWKS retrieval and caching are owned by JOSE; unavailable or untrusted keys reject access tokens.

Scopes are optional. `*` is a literal scope, never a wildcard. `mcp:use` is an operator-defined convention, not an MCP standard scope. Providers/client registration are operator choices. These tokens are external MCP ingress credentials; iRacing access/refresh tokens remain separate upstream service credentials.
