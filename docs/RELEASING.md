# Releasing

This document describes the end-to-end process for publishing `@iracing-data` packages to npm — from finishing a feature through to a live release on the registry.

## Select release targets

Public packages are independently versioned. Read [classification](../workspace-policy.json), [managed release membership](../dist-workspace.toml), current package manifests and [topology enforcement](../scripts/check-topology.js). A private tool is not a release target; publication requires a separate reviewed policy/workflow decision. For an ineligible target, report downstream impact as review context without preparing versions or tags.

[release.yml](../.github/workflows/release.yml) owns automated npm publication, validation and trusted-publishing mechanics. This procedure supplies maintainer decisions and recovery steps.

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

Pushing a matching tag triggers [release.yml](../.github/workflows/release.yml). Inspect its guards and output before using fallback paths. Prerelease tags select `next`; stable tags select `latest`. Confirm the resulting dist-tag after publication.

## Prerequisites

- Write access to [racedirector/iracing-data-api](https://github.com/racedirector/iracing-data-api).
- The repository's `npm` GitHub environment must be configured for npm publishing. The automated workflow uses GitHub Actions OIDC/trusted publishing rather than a local npm login.
- For manual fallback publishing only, an npm account that is a member of the `@iracing-data` organisation.

## End-to-end release process

### 1. Develop the feature

Work on a feature branch, following the normal development workflow.

```bash
git checkout -b codex/my-change
# ... make changes ...
git push -u origin codex/my-change
```

### 2. Decide which packages need a release

Start with `pnpm impact --base <ref>` (or `--json`) to identify candidate packages, regeneration/verification commands, and dependency order. See [change impact](CHANGE-IMPACT.md). The report does not select versions or prove publish readiness; confirm the actual release set with the checks below.

Release each package independently. Only tag a package when that package has a user-visible change, a public API change, or a packaging/build change that needs to be published.

To compare a package with its latest release tag:

```bash
git tag --merged HEAD --list "<package>@*" --sort=-version:refname
git diff --name-status "<package>@<latest-version>"..HEAD -- <package-path>
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
pnpm --filter '@iracing-data/oauth-client...' build
pnpm --filter @iracing-data/oauth-client test
```

Confirm the canonical verification result for the intended mainline release commit. Read the [workflow](../.github/workflows/release.yml) for its narrower publication gates; it does not replace pre-release verification.

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
- Confirm the GitHub Release identifies the package/version, includes package-specific changes and the installation command, and marks prereleases correctly.
- Do a quick smoke test: `npm install @iracing-data/oauth-client@0.1.0`.

## Package-specific GitHub Releases

After tag-triggered npm publication succeeds, the workflow creates a GitHub Release with the package name and exact version, an exact-version installation command, and package-relevant changes. Manual workflow dispatch continues to publish without creating a GitHub Release.

Release notes use the canonical [change-impact graph](CHANGE-IMPACT.md): package changes, internal dependency changes, and owned generation/presentation changes are included; global-only CI/toolchain maintenance is omitted. Previous-release selection uses the highest lower SemVer same-package tag reachable from the release commit, with a lexical tag tie-break for versions that differ only by build metadata. Commit history follows the first parent, including merged changes. A first release covers reachable package history.

SemVer prereleases are published to `next` and marked as GitHub prereleases, without becoming the latest GitHub Release. A hyphen in build metadata alone does not make a version a prerelease. Stable releases use `latest` on npm.

To inspect notes, check out the exact release tag with full Git history, install frozen dependencies, then run the helper with the actual version:

```bash
node scripts/release-notes.mjs '@iracing-data/oauth-client@<version>'
```

`pnpm test:release` validates filtering, previous-release selection, SemVer classification, and workflow integration. The notes helper does not change versions, create tags, publish packages, or modify the registry.

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

For the Rust library crate, use its own reviewed Cargo version when planning with `dist`, for example:

```bash
dist plan --tag=iracing-data-api-client-v0.1.0
```

## Rust crate releases

`iracing-data-api-client` is an independently versioned public library. Its version lives in `crates/iracing-data-api-client/Cargo.toml`; the npm workflow does not publish it. Managed release membership and `dist plan` do not authorize or perform Cargo publication.

1. Review the crate's changes since its previous package release, select its version independently of npm packages, and merge the version and presentation changes through a PR. Edit presentation in `scripts/client-presentation/rust.json` and `rust.md`, then apply `node scripts/normalize-rust-presentation.mjs`; do not hand-edit generated metadata or the README introduction.
2. On the intended mainline release commit, run `pnpm verify` and inspect the Cargo package before publication:

   ```bash
   cargo package -p iracing-data-api-client --locked --list
   cargo publish -p iracing-data-api-client --locked --dry-run
   ```

   Confirm the archive contains the maintained README and examples, has MIT license metadata and the correct repository/homepage/documentation links, and builds independently of the checkout. A dry run does not publish the crate.

3. An authorized maintainer with crates.io ownership and credentials publishes the reviewed version explicitly:

   ```bash
   cargo publish -p iracing-data-api-client --locked
   ```

4. Verify that exact version on [crates.io](https://crates.io/crates/iracing-data-api-client) and [docs.rs](https://docs.rs/iracing-data-api-client), including metadata, README, documentation, and installation with a TLS feature. Record the source commit and publication evidence in a package-specific GitHub Release using `iracing-data-api-client-v<version>`; create the tag only for the reviewed release commit. SemVer prereleases must be marked as GitHub prereleases. Cargo versions have no npm `latest`/`next` dist-tags.

If ownership, credentials, or release approval is unavailable, record the exact external action still required. Prepared source and a successful dry run do not establish published package state.

## Verify package presentation and provenance

Before each stable release, inspect the package description, keywords, MIT license metadata, repository directory, homepage, bugs link, and README on the release commit. The Fetch client is the default entry point; generated client presentation is maintained under `scripts/client-presentation`.

For each package, confirm its npm trusted publisher settings name the GitHub owner `racedirector`, repository `iracing-data-api`, workflow `release.yml`, and environment `npm`. These registry settings cannot be verified from the repository alone. The release job grants `id-token: write` and clears token variables for OIDC publishing. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for current requirements.

After publishing, verify the exact version rather than only the mutable `latest` tag:

```bash
pnpm view @iracing-data/api-client-fetch@0.0.1 dist.attestations --json
```

Check the provenance link on that version's npm page and verify that it identifies this repository, the `release.yml` workflow, and the intended release commit. Record the version and workflow run in the release notes. Missing attestations or an unexpected source must be investigated before marking stable-release verification complete. A successful build or `id-token: write` alone does not prove provenance.

Auditing and deprecating older packages in the npm scope is a separate maintenance task: confirm ownership and migration paths before changing registry deprecation messages.

See [repository protection and recovery](REPOSITORY-PROTECTION.md) for release-tag protections and exceptional maintainer bypass.
