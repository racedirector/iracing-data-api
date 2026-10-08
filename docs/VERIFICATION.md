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

## Offline Docker recovery

`pnpm verify:docker` builds MCP dependencies and the digest-pinned production image,
then exercises local persistence/recovery using synthetic credentials. The separate
**Docker offline recovery** Ubuntu CI job runs the same command with frozen pnpm
installation. Ordinary `pnpm verify` retains its service-free contract; Docker
validation is an additional explicit contract, not a workspace unit test.

Prerequisites are a running Linux-container Docker daemon, the repository Node/pnpm
versions, frozen dependencies, enough space for an image/layer inspection, and a
POSIX host user with **nonzero UID and GID**. Linux runners provide Docker; macOS
requires Docker Desktop. First build may download public Node images and locked
npm dependencies. Runtime grant/Data API requests are synthetic and intercepted
only in the read-only mounted harness; unexpected external requests fail closed.
The suite executes the actual image `dist/main.js`, session store, gateway, HTTP
and termination handlers. The test harness and fault controls are excluded from
production packaging, with no runtime test configuration or image publication.

Coverage includes image/layer secret exclusion, non-root/read-only/capability and
loopback/mount assertions, missing/corrupt/unsafe credential health and official MCP
initialize/listing, concurrent single-flight refresh, atomic rotation across restart,
write/file-fsync/rename/directory-fsync failures and quarantine, stopped re-login and
logout, unsupported hot replacement, one-owner test orchestration, and the stopped
named-volume importer. Synthetic grants verify each replacement credential is used
exactly once; no browser, account, keychain or real iRacing grant is involved.
Termination during a consumed in-flight grant must preserve safe uncertainty rather
than leave a reusable consumed credential. Containers, named volumes, synthetic
files and saved-image inspection artifacts are removed in `finally` cleanup.

The normal schema selector targets `tests/schema-compatibility`; generated Fetch
and Axios wire tests belong exclusively to `tests/data-contract`, after SDK builds
in `verify:generated`. A regression check keeps the selectors disjoint so a clean
`verify:js` run does not accidentally load unbuilt Axios output.

Record actual Docker/Node/image and host architecture from each run. Only exercised
builds establish platform evidence; Windows host ACL semantics and an unexecuted
architecture must not be claimed as tested. See the [local container guide](../apps/iracing-data-mcp/local-container.md)
for credential ownership and stopped recovery commands.

## MCP application contract evidence

The private MCP package tests use the official client over local HTTP with synthetic
OAuth/Data API/cache boundaries. They cover eight strict tool schemas and six user
workflows, input/output/error snapshots and generated-method mappings, redaction,
complete serialized result caps, cancellation/admission, cooldown and cursor replay/expiry.
They are discovered through the declared package test script in `verify:js`; they
require neither a model nor an account. See the [tool and recovery guide](../apps/iracing-data-mcp/README.md)
and [composition lifetimes](../apps/iracing-data-mcp/architecture.md).

Local Docker recovery passed 22 acceptance groups on 2026-10-06 with macOS arm64,
linux/arm64 image, Docker 29.5.2 and Node 24.21.0. The same 22 groups
[passed in parent #360 / PR #391 recovery CI](https://github.com/racedirector/iracing-data-api/actions/runs/37411801261/job/112101646317)
(run `37411801261`, head `2bfe946078b6ae2872cea6893ddce384128bc959`)
on Ubuntu 24.04.5/Linux amd64 with Docker 28.0.4 and Node 24.21.0. This records
parent platform evidence, not a result from PR #392's documentation head.
PR #392's subsequent [CI run `37699272600`](https://github.com/racedirector/iracing-data-api/actions/runs/37699272600)
passed Verify and Docker offline recovery for head
`29344a87ef8780816547e3d890cd75362bce25e4`; later review fixes require fresh checks.
Unexecuted platforms and native desktop UI/live upstream authorization
are not established by synthetic tests. Shutdown cleanup failure exits nonzero;
forced termination cannot ensure durable quarantine. Keep stopped and re-login
before restarting after either condition, with no automatic restart or restoration
of consumed credentials.
