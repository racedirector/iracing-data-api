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

## Request authorization and metadata

The server acts as an OAuth resource server. The installed MCP SDK owns Bearer parsing, expiration/resource/scope enforcement, and 401/403 challenges. Verification runs before body parsing and MCP session dispatch on every POST, GET/SSE and DELETE request. MCP session IDs are transport state, never authentication credentials. Verified request-local AuthInfo reaches transport.handleRequest and ctx.http.authInfo; it is never retained on the MCP session.

RFC 9728 Protected Resource Metadata is available without Bearer authorization at the URL computed by the SDK's getOAuthProtectedResourceMetadataUrl. For https://example.com/services/mcp it is https://example.com/.well-known/oauth-protected-resource/services/mcp; a root resource uses /.well-known/oauth-protected-resource. It advertises the exact configured resource and issuer, and scopes_supported only when global scopes are configured. It supports GET, HEAD and OPTIONS with CORS/preflight, and returns 405 with Allow for other methods. Health remains outside the bearer gate, under the existing Host/Origin boundary.

The small issuer-only PRM response is a temporary workaround for [SDK issue #2623](https://github.com/modelcontextprotocol/typescript-sdk/issues/2623), which currently requires a complete authorization-server document. The MCP app neither fabricates nor proxies authorization-server metadata endpoints. Authorization-server JWKS used for token verification is not published as the resource server's own RFC 9728 jwks_uri.

## Credential separation and deployment ownership

MCP ingress tokens come from the configured external authorization server. iRacing OAuth access/refresh tokens remain upstream service credentials and must never be accepted as ingress credentials merely because they are Bearer tokens. The MCP app validates tokens; it implements no authorization server, login UI or token issuer. Provider/client registration belongs to deployment/operator configuration.

HTTPS resource URLs, JOSE as the default verifier, JWKS discovery policy, audience defaults and optional global scopes are repository/default-verifier policy. Request authorization, SDK Bearer challenges and protected-resource discovery are the standards boundary. Production Host/Origin defaults remain local until #443 defines final remote Host/Origin/trusted-proxy policy. Railway/provider registration, routing, volume lifecycle and operational guidance remain #443; this document alone does not authorize public deployment.

Deterministic tests use local signing keys and metadata/JWKS fixtures. They establish application behavior, not live IdP, ChatGPT, Railway or iRacing interoperability.
