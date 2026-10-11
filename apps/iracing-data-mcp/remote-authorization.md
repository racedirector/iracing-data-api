# Remote MCP authorization boundary

`iracing-data-mcp` has two distinct ingress modes.

Local mode is the default. When the remote authorization variables below are absent, `/mcp` keeps the existing trusted-loopback deployment contract and does not require a bearer token. Local Docker onboarding and the iRacing OAuth credential lifecycle are unchanged.

Remote authorization is explicitly opt-in. When configured, this application acts only as an OAuth resource server for `/mcp`. The authorization server is external and operator-selected; this application does not provide `/authorize`, `/token`, login UI, user/password storage, client registration storage, or token issuance.

## Configuration

All five variables are required together. Supplying only part of the set is a startup error.

```text
IRACING_MCP_RESOURCE_URL=https://mcp.example/mcp
IRACING_MCP_AUTH_ISSUER=https://authorization.example/
IRACING_MCP_AUTH_AUDIENCE=https://mcp.example/mcp
IRACING_MCP_AUTH_JWKS_URL=https://authorization.example/.well-known/jwks.json
IRACING_MCP_AUTH_SCOPES=mcp:use
```

The resource URL must be an externally advertised HTTPS `/mcp` URL. The audience is the same resource identifier. Issuer and JWKS URLs must be HTTPS. Wildcards are rejected, and at least one explicit MCP ingress scope is required. `mcp:use` is the initial recommended scope; per-tool RBAC is intentionally outside this boundary.

The authorization server must issue signed access tokens for this MCP resource. The resource server verifies the signature from the configured JWKS, issuer, expiration, audience/resource, and required scopes. A valid token is required on every protected `/mcp` request. Missing or invalid credentials receive an OAuth bearer challenge; insufficient scope receives `403 insufficient_scope`.

MCP ingress credentials are separate from iRacing OAuth credentials. iRacing access and refresh tokens are never valid merely because they are bearer-shaped, and the MCP authorization verifier does not apply iRacing token schemas or scopes.

## Discovery

For a resource URL of `https://mcp.example/mcp`, the server exposes RFC 9728 Protected Resource Metadata at:

```text
https://mcp.example/.well-known/oauth-protected-resource/mcp
```

The document advertises the MCP resource URL, the configured external authorization-server issuer, and the supported MCP scope set. `WWW-Authenticate` challenges reference this metadata URL so OAuth-capable MCP clients can discover the authorization boundary.

The external authorization server owns its OAuth/OIDC authorization-server metadata and any client-registration, PKCE, login, consent, or account policy required by clients. Those are deployment/operator concerns, not MCP application endpoints.

`/healthz` remains separate from MCP bearer authentication and reports only the existing safe health projection.

## Deployment ownership

This boundary does not make the current local Host/Origin policy a public deployment policy. Provider-neutral remote Host allowlists, external Origin policy, trusted proxies/forwarded headers, HTTPS ingress, persistence, replicas, restart/rollback procedures, and the Railway reference deployment remain part of the remote deployment work tracked separately by #443.
