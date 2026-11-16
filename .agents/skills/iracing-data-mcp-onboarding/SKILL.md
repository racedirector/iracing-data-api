---
name: iracing-data-mcp-onboarding
description: Set up the iRacing MCP over local stdio, or embed its Hono router in an existing authenticated HTTP service.
---

# iRacing Data MCP onboarding

Read [repository guidance](../../../AGENTS.md),
[MCP app guidance](../../../apps/iracing-data-mcp/AGENTS.md), and
[app README](../../../apps/iracing-data-mcp/README.md).

## Local stdio

From the repository root, install dependencies and build:

```sh
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/iracing-data-mcp...' build
```

Use `pnpm iracing-data auth login --scope iracing.auth` to create
the **dedicated** MCP credential document at
`.iracing-data/iracing-data-mcp/credentials.json`. Do not paste the
client secret, access/refresh token, or file contents into chat.
`IRACING_MCP_CREDENTIAL_FILE` can select another existing document.
The executable also accepts `--credentials /absolute/path/to/credentials.json`;
this overrides the environment setting and default. Append the flag and path
to the MCP client's command array for explicit injection. Reconnect after
changing the selected path. Each request restores the selected file afresh,
so replacing its contents does not require reconnecting.
Do not silently fall back to another account's credential file.

Run `pnpm mcp:local` for a manual stdio session, or configure the MCP
client to execute `pnpm exec iracing-data-mcp` from the
repository root. After publication, consumers may install
`@iracing-data/iracing-data-mcp@next` and execute `iracing-data-mcp` directly.
Use `--env-file-if-exists /path/to/.env` for optional environment-file loading;
otherwise pass OAuth registration environment through the client configuration.
Never put ordinary logs on stdout: it belongs to MCP.
The runtime restores the session only when a tool needs it. Its OAuth client
refreshes expired access tokens and persists rotated credentials through the
token-document session store. Set `IRACING_AUTH_CLIENT` and, for confidential
clients, `IRACING_AUTH_SECRET` to the registration used for CLI login.
The CLI is the current setup path for initial login, not a dependency of the
file loader. Run only one credential owner
per document; do not refresh the same credentials concurrently from the CLI.

## HTTP embedding

HTTP is not the default local setup. `createMcpRouter({resolveActor,
resolveCapabilities})` is a Hono router for mounting in an existing
authenticated application: `app.route("/mcp", createMcpRouter(...))`.
For a separate HTTP process, `startMcpHttpServer({config, resolveActor,
resolveCapabilities})` uses `parseConfig(process.env)` with default
host `127.0.0.1` and port `3000`.

The actor resolver must verify each request using host-owned authentication
such as Better Auth. A null actor is denied before resolving capabilities.
The capability resolver finds the actor's linked iRacing account and supplies
the required domain query services. The HTTP host must **never** select the local
CLI account by default. An ingress bearer token is not itself an iRacing
credential or linked-account authorization.

## Verification

Run the MCP workspace build/test and `pnpm verify`. Run the user/client's
actual tool-list and `get_my_driver` smoke if credentials are available and
the user wants upstream verification. Local synthetic tests cannot prove
live iRacing authorization. Do not imply an HTTP deployment is secured unless
the embedding host's actor resolver and network policy have been validated.

Do not bring back Docker import/recovery, OAuth resource metadata, JWT
verification, or a custom session registry merely to support onboarding.
