---
name: iracing-data-cli-add-command
description: Add a command to apps/iracing-data-cli using its command, scope, and composition modules, shared helpers, and offline tests.
---

# Add a CLI command

Follow the repository's [AGENTS.md](../../../../AGENTS.md) and scoped guidance for files you touch. All `src/` and `test/` paths below are relative to `apps/iracing-data-cli`.

## 1. Pick an example

Read the closest command and its tests:

- `src/commands/whoami/`, `test/whoami.test.cjs`: authenticated read with JSON stdout.
- `src/commands/docs/`, `test/docs.test.cjs`: Data API request with JSON/YAML stdout or file output.
- `src/commands/assets/car/`, `test/assets.test.cjs`: nested leaf that materializes a returned Data API link.
- `src/commands/auth/login/`, `test/auth-scope.test.cjs`: option normalization and authentication lifecycle.

## 2. Create the leaf modules

Add `src/commands/<command-path>/` with:

- **`command.ts`**: import `Command` from `@commander-js/extra-typings`. Define option/invocation types, the scope's capability interface, and a factory accepting `{ createScope }`. Declare arguments/options; normalize and validate them in the async action; call `createScope(invocation)` once; invoke the capability and write its result. Await asynchronous output. Failures reject `parseAsync()`.
- **`scope.ts`**: define injectable dependencies and their production defaults. Export `create<Name>CommandScopeFactory(diagnostics, dependencies = defaultDependencies)`. Its returned factory resolves credentials, constructs the client, and binds the capabilities needed by the action for each invocation. Keep transport/error mapping and output implementation here.
- **`index.ts`**: export `create<Name>Command({ diagnostics, dependencies? })`. Wire the scope factory into the command factory and re-export the dependency type. Use `.js` import specifiers, as existing TypeScript modules do.

Command construction and help are free of I/O; credentials and clients are resolved when the action runs. Match the existing exported-interface and JSDoc style.

## 3. Wire it into the hierarchy

For a top-level command, import its module entry point in `src/program.ts` and call `program.addCommand(create<Name>Command({ diagnostics }))`.

For a nested command, register it in its parent's `index.ts`. A structural group only creates a `Command` and adds children; see `src/commands/assets/index.ts`. It needs no `command.ts` or `scope.ts` unless the parent itself executes an action.

## 4. Bind the shared helpers

Use the helpers relevant to the requested behavior:

- **Credentials**: accept `--credentials <path>`, use `CredentialOptions` and `resolveAccessToken` from `src/credentials.ts`. This preserves explicit-file, environment, then default-file precedence.
- **Data API**: construct the appropriate `@iracing-data/api-client-fetch` API with `new Configuration({ accessToken })` in the scope. Inspect the typed operation and response before calling it.
- **OAuth**: use the supported `@iracing-data/oauth-client` interfaces; `whoami/scope.ts` shows identity access.
- **Returned asset links**: reuse `materializeReturnedDataApiLink` from `src/commands/assets/returned-data-api-link.ts` for the exact returned link; it validates HTTPS and fetches without the bearer token. The link envelope is not the payload.
- **JSON stdout**: inject a `writeStdout` dependency and serialize with indentation and a trailing newline, as `whoami` does.
- **File/format output**: follow `docs/scope.ts` and reuse `resolveTokenFormat` and `writeDocumentOutput` from `src/token-output.ts` when these options are requested.
- **Diagnostics**: use the supplied `Diagnostics` sink for stderr. Map service errors to safe, actionable messages in the scope; the process error handler prints their message verbatim. Keep tokens, response bodies, and signed URLs out of errors.

If the required client operation is missing, follow the owning schema/runtime module's scoped guidance. Existing client operations need no regeneration.

## 5. Test and document it

Add `test/<command>.test.cjs` with `node:test`, `node:assert/strict`, and dynamic imports from `../dist/...`. Test the action with an injected scope and test the module entry point with injected credential/client/output dependencies.

Cover parsed options, one scope per action, expected service/output calls, failures, construction/help without I/O, and registration in the real hierarchy. Use synthetic data and offline dependencies. For asset leaves, also review `test/assets-help.test.cjs` and `test/assets-parity.test.cjs`.

Add usage examples and the command's options/output behavior to the app README. Run from the repository root, checking current scripts in the app manifest:

```bash
pnpm --filter '@iracing-data/cli...' build
pnpm --filter @iracing-data/cli test
pnpm exec eslint <changed-source-and-test-paths>
pnpm exec prettier --check <changed-paths>
pnpm check:service-client-boundary
git diff --check
```

See [verification](../../../../docs/VERIFICATION.md) for pre-merge checks and `pnpm check:topology` for workspace invariants. Report the implemented invocation and check results. Use the adjacent [prompt](prompt.md) to specify a new command.
