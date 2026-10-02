# Dependency updates

Dependabot scans the pnpm workspace once from `/`, alongside a separate GitHub
Actions scan. Do not add root-plus-package scans: the manifests share one root
lockfile and overlapping scans produce duplicate update PRs.

Routine minor/patch lint and formatting packages are grouped together. Routine
production patches are grouped separately. OAuth, routing, schema/OpenAPI, Axios,
and generator packages stay individual even for patches; toolchain upgrades and
all major updates also remain individual. These groups affect version updates;
no update types or security fixes are ignored. Grouping does not imply automatic
approval or merge. Configuration options follow the
[GitHub Dependabot reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference).

For every Dependabot PR, the normal CI job uploads `dependency-impact.json` as the
`dependency-impact` artifact. It uses the PR's exact base SHA and the checked-out
merge revision, with full history available. Root lockfile changes conservatively
flag all workspaces, including examples and managed npm/Cargo release candidates;
they do not automatically require releases. The same canonical `pnpm verify`
contract still runs, with read-only repository permissions and no publishing.

For manual review:

```bash
pnpm impact --base origin/main
pnpm verify
```

For major or protocol/toolchain upgrades, inspect the manifest/lockfile changes,
review upstream migration notes, and confirm generated output and public package
compatibility before choosing releases. Follow [change impact](CHANGE-IMPACT.md)
and [release instructions](RELEASING.md). Generated manifest defaults must still
be corrected in canonical presentation/generation inputs, not edited in isolation.
This change does not close existing duplicate PRs or change package versions.

GitHub's docs currently list pnpm support through v10 while this repository pins
v12.4.2. Configuration validation and local frozen installs cannot prove service
compatibility: inspect the next Dependabot update log and verify nested manifests
and the root lockfile were updated together. If the service cannot handle this
lockfile, fix the updater strategy; do not restore overlapping scans or silently
downgrade the repository's package manager.
