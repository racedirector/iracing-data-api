# Local MCP client configuration

Build the app first:

```sh
pnpm --filter '@iracing-data/iracing-data-mcp...' build
```

The checked-in project configurations start the **local stdio server** with
`node apps/iracing-data-mcp/dist/main.js`. The MCP client launches its
own process; there is no default HTTP listener or OAuth resource server.
The CLI's dedicated MCP credential file is consulted only when a tool
actually calls the iRacing API. Use the CLI to log in and renew credentials.

The project includes [`.mcp.json`](../../.mcp.json) for Claude Code and
VS Code; [`.cursor/mcp.json`](../../.cursor/mcp.json) for Cursor;
[`.gemini/settings.json`](../../.gemini/settings.json) for Gemini CLI;
[`.codex/config.toml`](../../.codex/config.toml) for Codex; and
[`opencode.json`](../../opencode.json) for OpenCode.

Open the repository as the project, approve the MCP tool when prompted,
and ensure the client starts its process with the repository root as the
working directory. Preserve other servers when merging project settings.

For HTTP integration, mount
`createMcpRouter({resolveActor,resolveCapabilities})` in the existing
authenticated Hono application. The host provides linked iRacing accounts;
do not connect anonymous remote clients to the CLI's local credential
file. See [runtime documentation](README.md).
