# MCP app dead-code and dependency audit

Reviewed on 2026-11-17 against the working tree on `feature/mcp-cli`.

## Removed

- **Awilix:** the composition wrapper registered only existing values. Explicit
  owner-scoped query getters replace it; pnpm also pruned its otherwise-unused
  transitive dependencies from the lockfile.
- **Internal HTTP readiness callback:** `isReady` had no consumers and reported
  true even before the listener bound. Removed the callback and its backing state
  from the non-public CLI listener handle; retained idempotent shutdown.
- **Stdio identity plumbing:** the transport no longer accepts an actor/resolver
  just to compose services. Both transports accept `IracingToolServices`.
- Updated stale Awilix and actor-based stdio documentation/examples.
- **Legacy credential implementation:** removed `src/credentials.ts` and its
  `createFileAccessTokenProvider`, `createFileCapabilities`, and
  `validateFileSession` exports by explicit maintainer decision. Moved the
  active provider from `src/cli/access-token.ts` to `src/access-token.ts`;
  `createTokenProvider` is now the shared public entry point. Hosts inject the
  document store and session key, then compose Fetch queries separately.
  Restart after replacing credentials; there is no reload queue or provider-owned
  logging/error translation. Lifecycle tests target the active provider.

## Retained deliberately

| Surface                                    | Reason                                                                                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commander`                                | Required runtime peer of `@commander-js/extra-typings`, whose runtime re-exports it. Not an unused dependency despite having no direct source import. |
| `pino-pretty`                              | Used by the executable for stderr logging; required in an installed runtime, not only development.                                                    |
| `@modelcontextprotocol/client`             | Used by transport and packaging smoke tests; remains a dev dependency.                                                                                |
| `@types/node`                              | Supplies Node types during compilation; remains a dev dependency.                                                                                     |
| `composeMcpServices`, actor/resolver types | Package-root exports for custom embedding hosts. Not removed solely because the CLI no longer uses them.                                              |

All remaining runtime dependencies have direct source imports except the
documented Commander peer. A TypeScript import/re-export graph rooted at
`src/main.ts` and `src/index.ts` reaches all 23 source files. This is a static
reachability check, not proof that every export is used by external consumers.
TypeScript's `noUnusedLocals` and `noUnusedParameters` checks also pass.

## Follow-ups

1. **Grant-looking inputs are not automatic login:** username/password metadata
   is accepted by `serve`, but the current provider only restores/refreshes.
   Explicit recovery policy and grant orchestration remain separate OAuth work.
2. **Generated build leftovers:** TypeScript builds do not remove outputs for
   deleted source paths. Source reachability must be audited from `src`, not
   stale `dist` files. No derived files were hand-edited for this audit.
3. **Registration validation:** the serve schema has an existing test expectation
   mismatch. It was not hidden by relaxing assertions.

Public credential-helper removal and stdio option changes are intentional API
changes for this branch. Grant behavior and MCP core contracts are unchanged.
