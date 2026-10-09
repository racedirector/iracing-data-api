# Local and CI verification

Install Node from [.nvmrc](../.nvmrc), pnpm pinned by [package.json](../package.json), Java 17 for OpenAPI Generator, and Rust from [rust-toolchain.toml](../rust-toolchain.toml), including rustfmt/clippy. Rust all-feature checks require native TLS build tools: on Ubuntu, `build-essential`, `pkg-config` and `libssl-dev`. First generation may download public generator tooling.

```bash
pnpm install --frozen-lockfile
pnpm verify
```

[verify.mjs](../scripts/verify.mjs) owns subsystem composition, build selection, failure semantics and offline evidence limits. [CI](../.github/workflows/ci.yml) runs the same command. No iRacing credentials or running service are required.

For a failed step, correct its owning source and rerun the focused command: `verify:repo`, `verify:js`, `verify:examples`, `verify:generated` or `verify:rust`. Finish with `pnpm verify`. Report missing tools and skipped checks accurately. Do not patch generated output to bypass checks; [check-generated.mjs](../scripts/check-generated.mjs) owns temporary regeneration and freshness enforcement.

For focused OAuth and OpenAPI coverage, build before declared tests:

```bash
pnpm --filter '@iracing-data/oauth-client...' --filter '@iracing-data/api-schema-to-openapi...' --filter '@iracing-data/oauth-schema-to-openapi...' build
pnpm --filter @iracing-data/oauth-client --filter @iracing-data/api-schema-to-openapi --filter @iracing-data/oauth-schema-to-openapi test
```

Use [change impact](CHANGE-IMPACT.md) for planning. Guidance, skills, ownership or workflow changes also require the five manual [agent regression scenarios](../agent-regressions/README.md); CI validates fixtures, not model reasoning. Live [upstream capture](UPSTREAM-CONTRACT.md) is opt-in and separate from verification. [Repository protection](REPOSITORY-PROTECTION.md) describes required-check recovery.

For coverage details, descend directly to [schema compatibility tests](../tests/schema-compatibility/compatibility.test.cjs), [offline generated wire tests](../tests/data-contract), [OAuth tests](../packages/oauth/client/test) and [MCP tests](../apps/iracing-data-mcp/test). Synthetic fixtures do not establish live authentication or upstream compatibility.

## Offline Docker recovery

```bash
pnpm verify:docker
```

This additional contract requires a running Linux-container Docker daemon, frozen dependencies, repository Node/pnpm versions, space for image/layer inspection and a POSIX host user with nonzero UID/GID. Linux CI provides Docker; macOS requires Docker Desktop. First builds may download public images and locked npm dependencies.

CI configures the Docker daemon to use [Google’s public Docker Hub cache](https://docs.cloud.google.com/artifact-registry/docs/pull-cached-dockerhub-images) before the build to avoid shared-runner anonymous pull limits. The production Dockerfile retains its pinned image digest, and existing daemon settings are preserved. Cache misses fall back to Docker Hub, so a base-image pull failure still blocks Docker verification; it is not a passing recovery result.

The [recovery harness](../apps/iracing-data-mcp/test/docker/recovery.mjs) owns synthetic production-image, persistence, quarantine, shutdown and stopped-importer scenarios. The [Docker CI job](../.github/workflows/ci.yml) runs the same command. Follow the [local container guide](../apps/iracing-data-mcp/local-container.md) for credential ownership and stopped recovery commands.

Record actual Docker, Node, image and host architecture for each run. Claim platform evidence only for executed builds. Windows ACL semantics, native desktop UI and live upstream authorization require separate evidence. After forced termination or cleanup failure, keep the service stopped and re-login before restart as described in the container guide.
