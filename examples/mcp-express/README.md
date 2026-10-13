# MCP Express example

Run `pnpm dev` to start the stdio transport from TypeScript. Use
`pnpm dev:express` or `pnpm dev:http` for the HTTP transports.

Supply `IRACING_AUTH_CLIENT` through the process environment. Supply
`IRACING_AUTH_SECRET` the same way if your OAuth client requires a secret; otherwise
leave it unset. Empty or whitespace-only values are rejected. The development
scripts also load these variables from `.env`, which is a plaintext file.
Prefer injecting secrets through your launcher or deployment's secret configuration.

The corresponding Commander options are hidden from help and reject command-line
values, even when environment values are also present. Validation runs before
transport startup and does not print the supplied values. Help requires no
credentials. The credential file path remains configurable with `--credentials`
or `IRACING_CREDENTIALS_PATH`.

Tool errors default to production responses: a stable code, fixed recovery message,
retry guidance where applicable, and a request ID. Set
`IRACING_MCP_ERROR_DETAILS=development` in the Inspector-launched server's environment
to include diagnostic messages, stacks, causes, and validation issues in tool
responses. `production` restores the default; other values fail startup. The mode
is environment-only and does not depend on `NODE_ENV` or client identification.
Diagnostics redact known credentials, bearer values, and URLs, omit arbitrary error
properties and HTTP bodies, and bound long strings and cause chains. Redacted
diagnostics are logged with the same request ID in both modes; stdio logs use stderr.
Development responses deliberately disclose more implementation detail and should
only be enabled in a trusted development session.

The root composes one service runner with its logger, process lifecycle, and server
composition function. Each command supplies parsed configuration and a transport.
Express and HTTP transport configuration supplies the listener address (and Express
route); stdio needs no listener configuration. HTTP startup resolves after binding.
The runner registers termination handlers only after successful startup. Its returned
handle closes once and removes the handlers on programmatic shutdown as well as
signals. HTTP close cancels open connections and closes the MCP handler; it does
not provide a graceful drain period.

`src/mcp/results.ts` provides the injected success/error serializer used by
`get_my_driver`. Text and structured content represent the same serialized JSON.
Services preserve diagnostic causes; this MCP boundary controls disclosure.
SDK input/protocol validation remains SDK-owned. The unregistered `find_drivers`
skeleton is not yet migrated.

Run `pnpm build` before `pnpm start`, `pnpm start:stdio`, or `pnpm start:http`.
Run `pnpm typecheck` to check types without bundling the source.
The build checks types with TypeScript, then bundles the local source into
`dist/cli.js` with esbuild. Relative source imports can omit file extensions;
the bundle resolves them for Node's ESM runtime. Package dependencies remain
external and must be installed at runtime.

The CLI composition supplies the MCP server's name and version through `serverInfo`.

`src/services/iracing-link.ts` provides `IRacingLinkService`. Its factory requires
explicit `fetchApi` and `now` dependencies; `now` returns Unix milliseconds. The CLI
supplies `fetch` and `Date.now`. After fetching an API
link envelope, call `links.materialize({ response, schema, signal })` to fetch and
validate its JSON payload. It uses the API package's envelope schema and returns
the parsed payload directly. Link requests carry no API bearer token; expired
links, HTTP failures, and invalid payloads throw. `src/mcp/tools/get-my-driver.ts` shows its use
with the existing driver output schema.

`src/credentials` provides `FileSessionStore`, an OAuth `SessionStore` for the CLI's
bare JSON token document. Pass the credential file path and, optionally, a session
ID (default `local`):

```ts
const sessionStore = new FileSessionStore(
  "/path/to/repository/.iracing-data/credentials.json",
);
```

That is the default output of `iracing-data auth login`. Auth-only login with
`--scope iracing.auth` instead writes
`.iracing-data/iracing-data-mcp/credentials.json`; pass that path if selected.
Paths are explicit so resolution does not depend on the server's working directory.

The store implements `get`, `set`, and `del` for its `sessionId`. Reads load the file
each time; a missing file returns `undefined`, while invalid JSON/token documents
and other I/O errors propagate. Writes replace the token document using a temporary
file and rename. It does not wrap tokens in a session-ID map, cache tokens, refresh
them, or construct an OAuth client. Use one refreshing owner per credential file.
The CLI creates the store and supplies it to its OAuth client.

Readability lint rules apply only to this example: braces on all control-flow
bodies, no nested or redundant ternaries, no comma expressions or chained
assignments, and blank lines around statement groups and comments. The
`write-good-comments` plugin checks repeated words, wordy expressions, and clichés;
Prettier continues to own formatting. Run `pnpm exec eslint examples/mcp-express`
from the repository root. Run the existing tests with
`pnpm --filter mcp-express exec tsx --test test/*.test.ts`.
