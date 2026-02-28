# Releasing

This document describes how to publish the `@iracing-data` packages to npm.

## Published packages

| Package | Path |
|---|---|
| `@iracing-data/oauth-schema` | `packages/oauth/schema` |
| `@iracing-data/oauth-client` | `packages/oauth/client` |
| `@iracing-data/api-schema` | `packages/api/schema` |
| `@iracing-data/api-client-fetch` | `packages/api/client/fetch` |
| `@iracing-data/api-client-axios` | `packages/api/client/axios` |

The workspace is declared in [`dist-workspace.toml`](../dist-workspace.toml) following the [cargo-dist JavaScript quickstart](https://axodotdev.github.io/cargo-dist/book/quickstart/javascript.html).

## Prerequisites

- Write access to the [racedirector/iracing-data-api](https://github.com/racedirector/iracing-data-api) repository.
- An npm account that is a member of the `@iracing-data` organisation.
- `NPM_TOKEN` secret configured in the repository's **npm** GitHub Actions environment (Settings → Environments → npm → Secrets). The token must have **Publish** scope for the `@iracing-data` org.

## Automated release (recommended)

Releases are driven by a git tag. Pushing a tag triggers the [release workflow](../.github/workflows/release.yml), which builds every package and publishes them to npm in dependency order, then creates a GitHub Release with auto-generated notes.

### Steps

1. **Bump versions** in the relevant `package.json` files.

   All five packages use independent versions. Only bump a package whose public API has changed. Follow [Semantic Versioning](https://semver.org/):
   - `patch` — backwards-compatible bug fixes.
   - `minor` — new backwards-compatible functionality.
   - `major` — breaking changes.

   ```bash
   # Example: bump oauth-client to 0.1.0
   pnpm --filter @iracing-data/oauth-client version 0.1.0
   ```

   If `oauth-client` depends on a freshly released `oauth-schema`, update the dependency version in `packages/oauth/client/package.json` too (pnpm converts `workspace:*` to a pinned version on publish automatically, but the version must exist on the registry first).

2. **Commit the version bumps.**

   ```bash
   git add packages/oauth/client/package.json
   git commit -m "chore: bump @iracing-data/oauth-client to 0.1.0"
   ```

3. **Tag the release.** The tag drives what ends up in the GitHub Release title and notes. Use a single unified tag for coordinated releases.

   ```bash
   git tag v0.1.0
   git push origin main --tags
   ```

   The tag triggers the [Release workflow](../.github/workflows/release.yml). Monitor progress in the **Actions** tab. Each publish step runs sequentially so that packages with internal dependencies are available on the registry before their dependants are published.

4. **Verify** the published packages on [npmjs.com](https://www.npmjs.com/org/iracing-data).

## Manual release

Use this only if the automated workflow is unavailable.

```bash
# 1. Install dependencies and build everything.
pnpm install --frozen-lockfile
pnpm build

# 2. Authenticate with npm.
npm login

# 3. Publish leaves first (no intra-workspace deps), then dependants.
pnpm --filter @iracing-data/oauth-schema publish --access public
pnpm --filter @iracing-data/api-schema    publish --access public
pnpm --filter @iracing-data/oauth-client  publish --access public
pnpm --filter @iracing-data/api-client-fetch publish --access public
pnpm --filter @iracing-data/api-client-axios publish --access public
```

> `pnpm publish` rewrites `workspace:*` references to pinned version numbers before uploading, so you do not need to edit `package.json` files manually.

## Pre-release versions

Pre-release versions (e.g. `0.1.0-alpha.0`) are published to the `next` dist-tag so they do not become the default install for `npm install @iracing-data/oauth-client`:

```bash
pnpm --filter @iracing-data/oauth-client publish --access public --tag next
```

Promote a pre-release to latest once it is stable:

```bash
npm dist-tag add @iracing-data/oauth-client@0.1.0 latest
```

## dist CLI (optional)

[dist](https://github.com/axodotdev/cargo-dist) can assist with release planning and generating the release workflow. If you have it installed:

```bash
# Preview what the release will produce without publishing.
dist plan

# Re-generate the release workflow after updating dist-workspace.toml.
dist init --yes
```

The workspace members are declared in [`dist-workspace.toml`](../dist-workspace.toml) at the repository root.
