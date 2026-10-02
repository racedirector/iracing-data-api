# Local and CI verification

Install the Node version in `.nvmrc`, pnpm pinned by `package.json`, and Rust pinned by `rust-toolchain.toml` (including rustfmt/clippy). Rust all-feature checks require a native TLS build toolchain: on Ubuntu, `build-essential`, `pkg-config`, and `libssl-dev`. Install JavaScript dependencies with `pnpm install --frozen-lockfile`, then run:

```bash
pnpm verify
```

CI runs this same command on one Ubuntu job. Each step prints its subsystem and stops on failure, preserving the command's exit code. Missing tools fail explicitly. No iRacing login, credentials, or running service is needed.

| Command                 | Coverage                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm verify:repo`      | Workspace policy, policy mutation tests, verification-runner tests, authored ESLint and Prettier checks |
| `pnpm verify:js`        | Authored npm packages/tools and dependency builds, followed by all declared workspace tests             |
| `pnpm verify:examples`  | Every policy-classified example and its dependency builds                                               |
| `pnpm verify:generated` | Generated npm client compilation; output freshness is added in #265                                     |
| `pnpm verify:rust`      | Rustfmt, locked Cargo check/clippy/test, all workspace targets and features                             |

Build selection comes from `workspace-policy.json`; no second package inventory is maintained. Each selected npm package must have a build script. Tests run only where declared; passing verification does not establish OAuth runtime coverage (#266). The password-limited example compiles but does not execute its live upload/authentication flow.

Prettier checks authored files. `.prettierignore` excludes compiled output, generator-owned client/spec output, and pnpm-owned lockfile serialization. Generated source formatting follows generator post-processing; Rustfmt checks the checked-in Rust client. Frozen installation protects the npm lockfile and `--locked` protects Cargo resolution. Clippy uses the workspace warning policy; existing generator warnings are reported, not promoted to errors. This contract does not yet prove regeneration freshness; #265 owns that extension.

For a failing step, rerun its focused command after correcting the owning source. See [root guidance](../AGENTS.md) for authored/generated boundaries. Do not manually patch generated source to bypass a check.
