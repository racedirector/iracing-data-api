# Workspace ownership and publication policy

[`workspace-policy.json`](../workspace-policy.json) is the classification inventory for every npm workspace, the repository root, and each Cargo member. Ownership names identify repository maintenance areas, not individual maintainers. Later guidance and release tooling should consume this inventory rather than introduce independent package lists.

| Path                                       | Classification          | Ownership area |
| ------------------------------------------ | ----------------------- | -------------- |
| `.`                                        | repository-root         | repository     |
| `packages/api/schema`                      | public-release-target   | api            |
| `packages/oauth/schema`                    | public-release-target   | oauth          |
| `packages/oauth/client`                    | public-release-target   | oauth          |
| `packages/api/client/axios`                | generated-public-client | codegen        |
| `packages/api/client/fetch`                | generated-public-client | codegen        |
| `crates/iracing-data-api-client`           | generated-public-client | codegen        |
| `packages/api/router`                      | internal-tool           | api            |
| `packages/helpers/api-schema-to-openapi`   | internal-tool           | codegen        |
| `packages/helpers/oauth-schema-to-openapi` | internal-tool           | codegen        |
| `examples/oauth-example`                   | example                 | examples       |
| `examples/oauth-example-cli`               | example                 | examples       |
| `examples/oauth-password-limited`          | example                 | examples       |

The public set preserves the existing managed releases in `dist-workspace.toml`. The router remains available for local development but has no managed release and is private. The two OpenAPI generators are repository build tools, invoked through root codegen scripts, and are private. Publishing these tools in the future requires an explicit policy and release-model change.

## Validation

Install dependencies with the pinned pnpm version, then run:

```bash
pnpm check:topology
pnpm test:topology
# Validate a prospective npm release target too:
pnpm check:topology --release @iracing-data/oauth-client
```

The check discovers manifests independently of workspace globs (ignoring dependency and build directories). It verifies classification coverage, package names, private/publish flags, root and public npm MIT metadata, pnpm and Cargo membership, local workspace dependency ownership, all TypeScript reference paths, root TypeScript reference coverage, and exact managed release membership. It fails on unreadable or malformed configuration. CI runs the check and its mutation tests; releases additionally validate the requested public npm package.

`pnpm-workspace.yaml` is the sole npm membership configuration. Positive repository-relative globs are supported, and every glob must match at least one manifest. Do not add a second `workspaces` list to the root manifest. The root `tsconfig.json` references all current npm members, including all three OAuth examples and both generated clients. These references describe the current tree; this policy does not change the packages' compiler options or promise that every package builds successfully.

## Changing topology

1. Add or remove the package and its entry in `workspace-policy.json`, including name, ecosystem, kind, and ownership area.
2. Update pnpm or Cargo membership and the root TypeScript references as appropriate. Remove globs that no longer match any package.
3. Mark internal tools, examples, and the root `private: true` (or `publish = false` for internal Cargo members). Public packages must not be private. Public runtime dependencies must also be public.
4. For public targets, update `dist-workspace.toml`. Keep generated client edits in generator inputs or normalization templates when regeneration could overwrite them.
5. Run both validation commands. The existing npm release workflow only handles public npm targets; classifying a Cargo member does not add a Cargo publishing workflow.
