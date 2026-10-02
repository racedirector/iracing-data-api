# Local and CI verification

Install the Node version in `.nvmrc`, pnpm pinned by `package.json`, Java 17 for OpenAPI Generator, and Rust pinned by `rust-toolchain.toml` (including rustfmt/clippy). Rust all-feature checks require a native TLS build toolchain: on Ubuntu, `build-essential`, `pkg-config`, and `libssl-dev`. Install JavaScript dependencies with `pnpm install --frozen-lockfile`, then run:

```bash
pnpm verify
```

CI runs this same command on one Ubuntu job. Each step prints its subsystem and stops on failure, preserving the command's exit code. Missing tools fail explicitly. No iRacing login, credentials, or running service is needed.

| Command                 | Coverage                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm verify:repo`      | Workspace policy, policy mutation tests, verification-runner tests, authored ESLint and Prettier checks                                                                    |
| `pnpm verify:js`        | Authored npm packages/tools and dependency builds, followed by all declared workspace tests                                                                                |
| `pnpm verify:examples`  | Every policy-classified example and its dependency builds                                                                                                                  |
| `pnpm verify:generated` | Presentation/diff regression tests; isolated regeneration of all OpenAPI JSON/YAML and Fetch/Axios/Rust clients; stale-output comparison; generated npm client compilation |
| `pnpm verify:rust`      | Rustfmt, locked Cargo check/clippy/test, all workspace targets and features                                                                                                |

Build selection comes from `workspace-policy.json`; no second package inventory is maintained. Each selected npm package must have a build script. Tests run only where declared; passing verification does not establish OAuth runtime coverage (#266). The password-limited example compiles but does not execute its live upload/authentication flow.

Prettier checks authored files. `.prettierignore` excludes compiled output, generator-owned client/spec output, and pnpm-owned lockfile serialization. Generated source formatting follows generator post-processing; Rustfmt checks the checked-in Rust client. Frozen installation protects the npm lockfile and `--locked` protects Cargo resolution. Clippy uses the workspace warning policy; existing generator warnings are reported, not promoted to errors. `verify:generated` regenerates into a temporary directory, compares bytes and file sets, and fails on changed/missing/obsolete output without changing local artifacts. Authored `AGENTS.md`, Rust examples, ignored build/release settings, and compiled outputs are preserved. `pnpm codegen` runs the same generation with `--write` to replace generator-owned output; review and commit the diff. Only run it when generated-output replacement is intended.

OpenAPI Generator is pinned by `openapitools.json`; Prettier configuration and Rust toolchain are pinned in repository files. npm client versions are passed explicitly from their manifests; Rust build/dependency/version settings remain authored in `Cargo.toml`, while public presentation metadata comes from `scripts/client-presentation/rust.json`. Generator network downloads may be required on the first run.

For a failing step, rerun its focused command after correcting the owning source. See [root guidance](../AGENTS.md) for authored/generated boundaries. Do not manually patch generated source to bypass a check.
