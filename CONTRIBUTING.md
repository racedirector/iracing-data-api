# Contributing

Start with the [package selection and first-call guide](README.md) if you are new to the project. For bugs, improvements, or questions about a proposed change, use the [issue forms](https://github.com/racedirector/iracing-data-api/issues/new/choose). Report vulnerabilities through the private route in [SECURITY.md](SECURITY.md).

## Set up a checkout

Fork the repository, clone your fork, and create a branch for one bounded change. Run commands from the repository root. Install Node from [.nvmrc](.nvmrc), the pnpm version pinned in [package.json](package.json), Java 17 for OpenAPI Generator, and the Rust toolchain specified in [rust-toolchain.toml](rust-toolchain.toml).

```bash
git clone https://github.com/<your-username>/iracing-data-api.git
cd iracing-data-api
git checkout -b my-change
pnpm install --frozen-lockfile
pnpm verify
```

The [verification guide](docs/VERIFICATION.md) describes native build prerequisites, focused commands, and the additional Docker recovery contract. Normal verification uses offline fixtures; no iRacing account, credentials, or running service is required. Live authentication and upstream checks are separate opt-in work. If a check fails, record the command and error; do not count missing tools or skipped checks as passing.

## Find the owning source

The repository contains authored TypeScript schemas and OAuth runtime code, generated Data API clients for Fetch, Axios, and Rust, private development tools, and examples. [Workspace policy](docs/WORKSPACE-POLICY.md) explains package classification and publication boundaries. Read package identities, scripts, and dependencies from their manifests.

Read [repository guidance](AGENTS.md) and the nearest scoped guide before editing. These guides identify the owning files and commands without requiring you to infer ownership from generated output:

- [Data API schemas](packages/api/AGENTS.md) and [OAuth schemas/runtime](packages/oauth/AGENTS.md).
- [OpenAPI mappings and helpers](packages/helpers/AGENTS.md) and [OpenAPI output](openapi/AGENTS.md).
- [Generated TypeScript clients](packages/api/client/AGENTS.md) and [Rust client](crates/iracing-data-api-client/AGENTS.md).
- [Local MCP application](apps/iracing-data-mcp/AGENTS.md).

Change schemas or mappings to change an OpenAPI contract. Change generator configuration, post-processing, or the templates in [scripts/client-presentation](scripts/client-presentation) to change generated client behavior or presentation. The OAuth client is authored runtime code; OAuth OpenAPI does not generate it.

## Validate and regenerate

Add meaningful tests for changed behavior and use the affected package's declared build and test scripts. Build its dependencies with `pnpm --filter '<package-name>...' build`. The [verification guide](docs/VERIFICATION.md) provides focused subsystem checks; finish with `pnpm verify`, the same contract used by CI.

When schemas, mappings, or generation inputs change, build the relevant generator with dependencies, then run the owning generation commands from the scoped guide. Commit the affected OpenAPI JSON/YAML pairs, generated client source, generated documentation, and generator bookkeeping alongside the authored changes. Inspect the diff for unexpectedly broad churn. Never repair generated output by hand. Do not commit `dist/` or TypeScript build caches.

`pnpm codegen` regenerates the complete graph; use it when the whole graph is affected. `pnpm verify:generated` regenerates in isolation and checks committed freshness. Documentation-only changes need no codegen; check edited Markdown with `pnpm exec prettier --check <paths>` and run `git diff --check`. Changes to guidance, skills, ownership policy, or workflow tooling also require the manual [agent regression scenarios](agent-regressions/README.md).

## Submit a pull request

Choose an existing unblocked issue or describe the problem before starting a broad change. The [issue triage guide](docs/ISSUE-TRIAGE.md) owns classification, priority, dependencies, and contribution-label policy. Maintainers curate [good first issues](https://github.com/racedirector/iracing-data-api/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) and [help wanted work](https://github.com/racedirector/iracing-data-api/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22); those lists may be empty when no suitable work is available.

Open a focused PR against `main` using the [PR template](.github/pull_request_template.md). Link its issue, explain the problem and resulting behavior, list affected packages, and report validation and limitations. List exact generation commands and affected generated files, or state that none were regenerated. Address review feedback and CI failures before requesting merge. Do not include real tokens, credentials, or private account data in fixtures, logs, issues, or PRs.

## Package and release boundaries

Public packages are independently versioned. Run `pnpm impact --base <ref>` to identify affected package and verification candidates; [change impact](docs/CHANGE-IMPACT.md) explains how to interpret the report. It does not authorize version bumps or publication.

Coordinate package-specific version decisions with maintainers using [release instructions](docs/RELEASING.md). Guidance-only edits need no version bump. Preserve reviewed versions when regenerating manifests, and identify dependency release order when needed. Publishing, release tags, registry changes, and public contract decisions require maintainer review; opening a PR does not perform a release.
