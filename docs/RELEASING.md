# Releasing

This document describes the end-to-end process for publishing `@iracing-data` packages to npm — from finishing a feature through to a live release on the registry.

## Published packages

Each package is versioned and released independently.

| Package                          | Path                        | Current version    |
| -------------------------------- | --------------------------- | ------------------ |
| `@iracing-data/oauth-schema`     | `packages/oauth/schema`     | see `package.json` |
| `@iracing-data/oauth-client`     | `packages/oauth/client`     | see `package.json` |
| `@iracing-data/api-schema`       | `packages/api/schema`       | see `package.json` |
| `@iracing-data/api-client-fetch` | `packages/api/client/fetch` | see `package.json` |
| `@iracing-data/api-client-axios` | `packages/api/client/axios` | see `package.json` |

The workspace is declared in [`dist-workspace.toml`](../dist-workspace.toml) following the [cargo-dist JavaScript quickstart](https://axodotdev.github.io/cargo-dist/book/quickstart/javascript.html).

## Tag format

Every release is driven by a per-package git tag:

```
@iracing-data/<package-name>@<version>
```

Examples:

```
@iracing-data/oauth-client@0.1.0
@iracing-data/oauth-client@0.1.0-alpha.0
@iracing-data/api-schema@0.0.1
```

Pushing a tag matching this pattern triggers the [release workflow](../.github/workflows/release.yml), which:

1. Parses the package name from the tag.
2. Verifies the tag version matches the `version` field in that package's `package.json`.
3. Builds the package and any workspace dependencies.
4. Publishes the package to npm.
5. Creates a GitHub Release with auto-generated notes.

Pre-release versions (anything containing a `-`, e.g. `0.1.0-alpha.0`) are automatically published under the `next` dist-tag so they do not become the default install. Stable versions are published to `latest`.

## Prerequisites

- Write access to [racedirector/iracing-data-api](https://github.com/racedirector/iracing-data-api).
- The repository's `npm` GitHub environment must be configured for npm publishing. The automated workflow uses GitHub Actions OIDC/trusted publishing rather than a local npm login.
- For manual fallback publishing only, an npm account that is a member of the `@iracing-data` organisation.

## End-to-end release process

### 1. Develop the feature

Work on a feature branch, following the normal development workflow.

```bash
git checkout -b feature/my-change
# ... make changes ...
git push -u origin feature/my-change
```

### 2. Decide which packages need a release

Release each package independently. Only tag a package when that package has a user-visible change, a public API change, or a packaging/build change that needs to be published.

To compare a package with its latest release tag:

```bash
git diff --name-status "@iracing-data/oauth-client@0.0.1-alpha.7"..HEAD -- packages/oauth/client
git diff --name-status "@iracing-data/oauth-schema@0.0.1-alpha.3"..HEAD -- packages/oauth/schema/src
```

If a client package changed but its schema package did not, release only the client. If both changed, release the schema first, then the client.

### 3. Open a pull request and include the version bump

Before requesting review, bump the version of every package whose public API changed. Use [Semantic Versioning](https://semver.org/):

| Change                           | Version part | Example           |
| -------------------------------- | ------------ | ----------------- |
| Breaking API change              | `major`      | `0.1.0` → `1.0.0` |
| New backwards-compatible feature | `minor`      | `0.1.0` → `0.2.0` |
| Bug fix                          | `patch`      | `0.1.0` → `0.1.1` |

Edit `version` in the package's `package.json` directly. Avoid `pnpm version` for these workspace packages; it can fail on `workspace:*` dependencies and may still partially edit `package.json`.

If a dependant package is also changing (e.g. `oauth-client` depends on a new `oauth-schema` release), bump both packages in the same PR and note that `oauth-schema` must be tagged and published first.

Commit the bump alongside the rest of the feature work:

```bash
git add packages/oauth/client/package.json
git commit -m "chore(oauth-client): bump to 0.1.0"
```

> Including the version bump in the feature PR keeps the commit history clean and ensures the version is reviewed alongside the code change.

### 4. Get the PR reviewed and merged

Open a pull request against `main`, address feedback, and merge once approved.

### 5. Validate the package locally

Run the narrowest checks for the package before tagging. At minimum, run the package build. If the package has tests, run them too.

```bash
pnpm --filter @iracing-data/oauth-client test
pnpm --filter @iracing-data/oauth-client build
```

The release workflow runs `pnpm --filter "<package>..." build`, which builds the package and its workspace dependencies. CI on `main` is responsible for the broader lint/test suite.

### 6. Create and push the release tag

After the PR is merged, pull the latest `main` and create the tag on the merge commit.

```bash
git checkout main
git pull

# Confirm the version in package.json matches what you are about to tag.
node -p "require('./packages/oauth/client/package.json').version"
# → 0.1.0

git tag -a "@iracing-data/oauth-client@0.1.0" -m "Release @iracing-data/oauth-client 0.1.0"
git push origin "@iracing-data/oauth-client@0.1.0"
```

> **Note:** wrap the tag in quotes in shell commands to avoid shell-specific interpretation of `@` or scoped package names.

The push triggers the release workflow. You can monitor progress in the **Actions** tab.

```bash
gh run list --limit 10
gh run watch <run-id> --exit-status
```

### 7. Verify the release

Once the workflow completes:

- Check the package on [npmjs.com](https://www.npmjs.com/org/iracing-data).
- Confirm the GitHub Release was created with generated notes.
- Do a quick smoke test: `npm install @iracing-data/oauth-client@0.1.0`.

## Releasing multiple packages

When multiple packages change together (e.g. a new `oauth-schema` that `oauth-client` also adopts), release them in dependency order — publish dependencies before dependants:

1. Tag and push `@iracing-data/oauth-schema@<version>` first.
2. Wait for the workflow to complete.
3. Tag and push `@iracing-data/oauth-client@<version>`.

This ensures the dependency exists on the registry when `pnpm` rewrites `workspace:*` references during the dependant's publish step.

## Pre-release versions

Include a pre-release identifier in the version (e.g. `-alpha.0`, `-beta.1`) and the workflow automatically publishes to the `next` dist-tag:

```bash
git tag "@iracing-data/oauth-client@0.1.0-alpha.0"
git push origin "@iracing-data/oauth-client@0.1.0-alpha.0"
```

Users install pre-releases explicitly:

```bash
npm install @iracing-data/oauth-client@next
# or
npm install @iracing-data/oauth-client@0.1.0-alpha.0
```

To promote a pre-release to `latest` once it is stable:

```bash
npm dist-tag add @iracing-data/oauth-client@0.1.0 latest
```

## Manual release

Use this as a fallback if the automated workflow is unavailable.

```bash
# 1. Install and build.
pnpm install --frozen-lockfile
pnpm --filter "@iracing-data/oauth-client..." build

# 2. Authenticate.
npm login

# 3. Publish.
pnpm --filter @iracing-data/oauth-client publish --access public --tag latest
```

Publish dependencies before dependants, following the same order as above.

> `pnpm publish` rewrites `workspace:*` references to pinned version numbers automatically — you do not need to edit `package.json` files manually.

## Manual workflow dispatch

The release workflow can also be run from the Actions UI with `workflow_dispatch`, supplying a package name and npm dist-tag. Prefer tag-triggered releases for normal publishing because tag releases verify the tag version against `package.json` and create a GitHub Release. Manual dispatch is intended for operational fallback cases, such as retrying a publish after an infrastructure issue.

## dist CLI (optional)

[dist](https://github.com/axodotdev/cargo-dist) can assist with release planning. If you have it installed:

```bash
# Preview what the release will produce.
dist plan

# Re-generate the release workflow after editing dist-workspace.toml.
dist init --yes
```

The workspace members are declared in [`dist-workspace.toml`](../dist-workspace.toml).

For the Rust library crate (`crates/iracing-data-api-client`), use an explicit tag when planning or releasing with `dist`:

```bash
dist plan --tag=iracing-data-api-client-v0.0.1
```

## Verify package presentation and provenance

Before each stable release, inspect the package description, keywords, MIT license metadata, repository directory, homepage, bugs link, and README on the release commit. The Fetch client is the default entry point; generated client presentation is maintained under `scripts/client-presentation`.

For each package, confirm its npm trusted publisher settings name the GitHub owner `racedirector`, repository `iracing-data-api`, workflow `release.yml`, and environment `npm`. These registry settings cannot be verified from the repository alone. The release job grants `id-token: write` and clears token variables for OIDC publishing. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for current requirements.

After publishing, verify the exact version rather than only the mutable `latest` tag:

```bash
pnpm view @iracing-data/api-client-fetch@0.0.1 dist.attestations --json
```

Check the provenance link on that version's npm page and verify that it identifies this repository, the `release.yml` workflow, and the intended release commit. Record the version and workflow run in the release notes. Missing attestations or an unexpected source must be investigated before marking stable-release verification complete. A successful build or `id-token: write` alone does not prove provenance.

Auditing and deprecating older packages in the npm scope is a separate maintenance task: confirm ownership and migration paths before changing registry deprecation messages.

On 2026-09-19, the public attestation for `@iracing-data/oauth-schema@0.0.1` identified this repository, `.github/workflows/release.yml`, tag `@iracing-data/oauth-schema@0.0.1`, and commit `5225abf7a62e6dc7108693743ea4025ce48b8ce8` ([release run](https://github.com/racedirector/iracing-data-api/actions/runs/35360484040)). The other seven workspace packages did not yet have a stable `0.0.1` version on npm; repeat the check when each is published. This observation does not verify private npm trusted publisher settings.
