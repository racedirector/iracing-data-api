# MCP Express example

Run `pnpm dev` to start the stdio transport from TypeScript. Use
`pnpm dev:express` or `pnpm dev:http` for the HTTP transports.

Run `pnpm build` before `pnpm start`, `pnpm start:stdio`, or `pnpm start:http`.
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
The store is not wired into the example's server or CLI.
