# Local MCP client configuration

Build the app first:

```sh
pnpm --filter '@iracing-data/iracing-data-mcp...' build
```

The checked-in project configurations start the **local stdio server** with
`pnpm exec dotenv -e .env -- iracing-data-mcp`. Dotenv CLI, not the MCP executable,
loads the repository's environment file. Copy [`.env.example`](../../.env.example)
and follow [environment configuration](README.md#environment-configuration).
The MCP client launches its
own process; there is no default HTTP listener or OAuth resource server.
Startup validates registration and the selected credential document without a
network request. For initial setup, run
`pnpm iracing-data auth login --scope iracing.auth`. The runtime independently
loads that document and persists on-demand OAuth refreshes to the same file.

The project includes [`.mcp.json`](../../.mcp.json) for Claude Code and
VS Code; [`.cursor/mcp.json`](../../.cursor/mcp.json) for Cursor;
[`.gemini/settings.json`](../../.gemini/settings.json) for Gemini CLI;
[`.codex/config.toml`](../../.codex/config.toml) for Codex; and
[`opencode.jsonc`](../../opencode.jsonc) for OpenCode.

Open the repository as the project, approve the MCP tool when prompted,
and ensure the client starts its process with the repository root as the
working directory. Preserve other servers when merging project settings.

To select a credential document explicitly, append
`"--credentials", "/absolute/path/to/credentials.json"` to the configured
command array. This overrides `IRACING_MCP_CREDENTIAL_FILE` and the dedicated
MCP default; it does not copy credentials or start another refresh owner.
Reconnect the server after changing the path. Replacing the selected document
does not require reconnecting; each request restores it afresh.

For HTTP integration, mount
`createMcpRouter({resolveActor,resolveCapabilities})` in the existing
authenticated Hono application. The host provides linked iRacing accounts;
do not connect anonymous remote clients to the CLI's local credential
file. See [runtime documentation](README.md).
