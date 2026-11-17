# Local MCP client configuration

Build the app first:

```sh
pnpm --filter '@iracing-data/iracing-data-mcp...' build
```

To start the **local stdio server**, use
`pnpm exec dotenv -e .env -- iracing-data-mcp serve`. Dotenv CLI, not the MCP executable,
loads the repository's environment file. Copy [`.env.example`](../../.env.example)
and follow [environment configuration](README.md#environment-configuration).
The MCP client launches its
own process; there is no default HTTP listener or OAuth resource server.
The command validates options at startup and reads credentials on demand.
For initial setup, run
`pnpm iracing-data auth login --scope iracing.auth`. The runtime independently
loads that document and persists on-demand OAuth refreshes to the same file.

The project maintains only [`opencode.jsonc`](../../opencode.jsonc) for
agent MCP configuration. Other clients can configure the command above in
their own settings; their project configurations are not maintained here.

Open the repository as the project, approve the MCP tool when prompted,
and ensure the client starts its process with the repository root as the
working directory. Preserve other servers when merging project settings.

To select a credential document explicitly, append
`"--credentials", "/absolute/path/to/credentials.json"` to the configured
command array after `serve`. This overrides `IRACING_CREDENTIALS` and the dedicated
MCP default; it does not copy credentials or start another refresh owner.
Restart the server process after changing the path or replacing the selected
document. The retained session store loads once; there is no file watch/reload.

For HTTP integration, use `createHttpTransport({services, serveOptions})` and
mount its `fetch` handler at the host's chosen path. The host owns authentication
and account selection. The development command `iracing-data-mcp serve --transport http`
uses local credentials without caller authentication at `127.0.0.1:3000/mcp`;
do not expose it publicly. See [runtime documentation](README.md).
