# Connect an MCP client

Run the [local Docker workflow](local-container.md) first. One container owns the
iRacing credentials; every client connects to that same process. The checked-in
configurations contain no credentials, model choices, provider keys, or commands
that start another server. They do not install a client or complete OAuth setup.

```sh
pnpm install --frozen-lockfile
pnpm mcp:local login
```

For later starts with valid imported credentials, use `pnpm mcp:local up`.
Keep Docker and the container running during client use.

## Local clients

Open the repository as the client's project and accept its normal workspace/server
trust prompt. Existing user-level configuration may take precedence or supply
additional servers; merge entries rather than overwriting a user's configuration.
These are configurations for common clients, not a popularity ranking.

| Client                   | Checked-in configuration                                 | Remaining client step                                                                                                                                                                                                                                                                    |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code              | [`.mcp.json`](../../.mcp.json)                           | Start in the repository and approve the project MCP entry when prompted; inspect with `claude mcp list` or `/mcp`.                                                                                                                                                                       |
| VS Code / GitHub Copilot | [`.mcp.json`](../../.mcp.json)                           | Trust the workspace, then use **MCP: List Servers** to start/inspect `iracing-data`. Current VS Code supports this portable format. Older versions can use a `.vscode/mcp.json` with a top-level `servers` object containing the same entry. Do not configure both copies in one client. |
| Cursor                   | [`.cursor/mcp.json`](../../.cursor/mcp.json)             | Open the repository and inspect the server in MCP settings; reload the client if needed.                                                                                                                                                                                                 |
| Gemini CLI               | [`.gemini/settings.json`](../../.gemini/settings.json)   | Start in the repository; inspect with `gemini mcp list` or `/mcp`. Tool approvals remain enabled (`trust: false`).                                                                                                                                                                       |
| Codex                    | [`.codex/config.toml`](../../.codex/config.toml)         | Trust the project and reload the client. The project entry avoids a separate global registration.                                                                                                                                                                                        |
| OpenCode                 | [`opencode.json`](../../opencode.json)                   | Start in the repository; inspect with `opencode mcp list`. MCP OAuth is disabled for this server.                                                                                                                                                                                        |
| Cline                    | [`client-configs/cline.json`](client-configs/cline.json) | In Cline's MCP settings, merge its `iracing-data` entry into the configuration opened by the client. It uses `streamableHttp` and an empty auto-approval list.                                                                                                                           |

The server uses **Streamable HTTP** at `http://127.0.0.1:3000/mcp`, with **no MCP
authentication**. iRacing authorization stays inside the server's Docker-managed
volume. Never put iRacing secrets, credentials, or the root `.env` into client
configuration. A client's `remote` or `http` transport name describes the protocol,
not public exposure. Gemini's `httpUrl` is intentional: its `url` selects legacy SSE.

Sources checked 2026-10-09: [Claude Code](https://code.claude.com/docs/en/mcp),
[VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers),
[Cursor](https://prod.cursor.com/help/customization/mcp),
[Gemini CLI](https://geminicli.com/docs/tools/mcp-server/),
[Codex](https://developers.openai.com/codex/mcp),
[OpenCode](https://docs.opencode.ai/docs/mcp-servers/), and
[Cline](https://github.com/cline/cline/blob/main/docs/mcp/mcp-overview.mdx).
These files are format-checked by the app's offline tests; this does not establish
live behavior in every client/version. Check the current official documentation
when a client's installed version disagrees with this guide.

## Ollama and other agent frameworks

Ollama supplies a model; an MCP-capable host such as OpenCode supplies the MCP
client. From the repository root, run `ollama launch opencode` and select a local
model supporting tool calling. Model capability, context length, and hardware
readiness are separate from MCP server readiness. See the official
[Ollama/OpenCode integration](https://docs.ollama.com/integrations/opencode).
The repository config does not select or download a model or change global
provider settings.

For another framework, create a Streamable HTTP client targeting the endpoint
above. The server supports MCP protocol versions `2025-11-25`, `2025-06-18`, and
`2025-03-26`. It does not expose stdio or a legacy `/sse` endpoint. Stdio-only
clients need an explicitly chosen, separately maintained bridge; these configs do
not install one. Do not assume Claude Desktop's local config accepts an HTTP URL
just because Claude Code does.

Clients must run in the host network context that can reach this loopback address.
Inside WSL, a container, a remote IDE, or a cloud agent, `127.0.0.1` may refer to a
different machine/network namespace. Do not solve reachability by publishing this
unauthenticated local server to a public interface.

## ChatGPT

ChatGPT web needs a private tunnel rather than a repository config file.
Follow the skill's [ChatGPT integration reference](../../.agents/skills/iracing-data-mcp-onboarding/references/chatgpt.md).
Use the existing container as the tunnel target; do not copy its iRacing credentials
or start another refresh-token owner. Availability depends on the account's current
custom-MCP and Platform tunnel access.

## Verify only as much as requested

The skill's `verify.mjs` checks local process/auth readiness and credential
permissions. Client server listings or the tools list check registration/transport
without starting model inference. If the user defers model or upstream testing,
stop there and report those limits. When authorized, use one bounded read-only
tool such as `get_my_driver` for an upstream smoke. A successful health check or
tool listing does not prove model tool-selection behavior or every upstream API.

Offline configuration coverage runs with
`node --test apps/iracing-data-mcp/test/client-configs.test.cjs` and is also part of
the app's declared test script. No model, live service, or account is needed.
