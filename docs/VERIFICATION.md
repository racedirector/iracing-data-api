# Local and CI verification

Install the Node version in `.nvmrc`, pnpm pinned by `package.json`, Java 17 for OpenAPI Generator, and Rust pinned by `rust-toolchain.toml` (including rustfmt/clippy). Rust all-feature checks require a native TLS build toolchain: on Ubuntu, `build-essential`, `pkg-config`, and `libssl-dev`. Install JavaScript dependencies with `pnpm install --frozen-lockfile`, then run:

```bash
pnpm verify
```

CI runs this same command on one Ubuntu job. Each step prints its subsystem and stops on failure, preserving the command's exit code. Missing tools fail explicitly. No iRacing login, credentials, or running service is needed.

| Command                 | Coverage                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm verify:repo`      | Workspace policy, policy mutation tests, verification-runner and offline upstream-contract tests, authored ESLint and Prettier checks                                                                               |
| `pnpm verify:js`        | Authored npm packages/tools and dependency builds, followed by all declared workspace tests                                                                                                                         |
| `pnpm verify:examples`  | Every policy-classified example and its dependency builds                                                                                                                                                           |
| `pnpm verify:generated` | Presentation/diff regression tests; isolated regeneration of all OpenAPI JSON/YAML and Fetch/Axios/Rust clients; stale-output comparison; generated npm client compilation and offline Data API wire-contract tests |
| `pnpm verify:rust`      | Rustfmt, locked Cargo check/clippy/test, all workspace targets and features                                                                                                                                         |

Build selection comes from `workspace-policy.json`; no second package inventory is maintained. Each selected npm package must have a build script. Tests run only where declared. OAuth client tests cover PKCE/state consumption, token form encoding, success/error processing, refresh rotation, session persistence, and memory/disk storage. Both authored OpenAPI tools generate temporary JSON/YAML contracts and check representative mapping invariants, unique operation IDs, and local reference resolution. These tests exercise built authored code; they do not unit-test generated SDK implementation details or establish live upstream compatibility. The password-limited example compiles but does not execute its live upload/authentication flow.

Prettier checks authored files. `.prettierignore` excludes compiled output, generator-owned client/spec output, and pnpm-owned lockfile serialization. Generated source formatting follows generator post-processing; Rustfmt checks the checked-in Rust client. Frozen installation protects the npm lockfile and `--locked` protects Cargo resolution. Clippy uses the workspace warning policy; existing generator warnings are reported, not promoted to errors. `verify:generated` regenerates into a temporary directory, compares bytes and file sets, and fails on changed/missing/obsolete output without changing local artifacts. Authored `AGENTS.md`, Rust examples, ignored build/release settings, and compiled outputs are preserved. `pnpm codegen` runs the same generation with `--write` to replace generator-owned output; review and commit the diff. Only run it when generated-output replacement is intended.

OpenAPI Generator is pinned by `openapitools.json`; Prettier configuration and Rust toolchain are pinned in repository files. npm client versions are passed explicitly from their manifests; Rust build/dependency/version settings remain authored in `Cargo.toml`, while public presentation metadata comes from `scripts/client-presentation/rust.json`. Generator network downloads may be required on the first run.

For a failing step, rerun its focused command after correcting the owning source. See [root guidance](../AGENTS.md) for authored/generated boundaries. Do not manually patch generated source to bypass a check.

Workspace impact regression tests run in `verify:repo` via `pnpm test:impact`. See [change impact](CHANGE-IMPACT.md) for read-only package and release planning.

For focused OAuth/contract coverage, build before running the declared tests:

```bash
pnpm --filter '@iracing-data/oauth-client...' --filter '@iracing-data/api-schema-to-openapi...' --filter '@iracing-data/oauth-schema-to-openapi...' build
pnpm --filter @iracing-data/oauth-client --filter @iracing-data/api-schema-to-openapi --filter @iracing-data/oauth-schema-to-openapi test
```

`verify:js` performs these dependency builds and discovers the new test scripts through the existing workspace test command. `verify:examples` compiles all example consumers, including OAuth examples, without using credentials. OAuth Fetch tests reject unexpected requests and use synthetic token payloads; JWT expiry fixtures are structural test data, not signature validation evidence.

Agent regression fixtures and validator tests run in `verify:repo`. When guidance,
skills, ownership, or workflow tooling changes, run the five manual reasoning
scenarios described in [agent regressions](../agent-regressions/README.md). CI
checks fixture structure/references only and never runs a live model evaluation.

Upstream evidence capture is opt-in and separate from verification. See [upstream contract tooling](UPSTREAM-CONTRACT.md) for live capture, credential handling, fixture mode, and automation. Verification never requires an iRacing token.

The canonical CI result is enforced on main by the [repository protection rules](REPOSITORY-PROTECTION.md), which also document recovery from a broken required check.

`pnpm test:data-contract` exercises the built Fetch and Axios clients with synthetic offline responses. It verifies documentation-note preservation, direct constants arrays, time-trial paths, calendar-year requests and CSV spectator filters. It runs after generated client builds in `verify:generated`; it never reads credentials or calls iRacing. The Rust crate registers an authored documentation deserialization test outside generated source.
