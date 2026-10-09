# Dependency updates

[Dependabot configuration](../.github/dependabot.yml) owns scan scope and grouping rationale. [CI](../.github/workflows/ci.yml) owns the dependency-impact artifact and verification execution. Grouping does not imply automatic approval or merge.

For each update, inspect its manifest and lockfile diff and the CI `dependency-impact` artifact. Reproduce planning and verification locally:

```bash
pnpm impact --base origin/main
pnpm verify
```

For major or protocol/toolchain upgrades, review upstream migration notes and confirm generated output and public compatibility before choosing releases. Follow [change impact](CHANGE-IMPACT.md) and [releasing](RELEASING.md). Fix generated metadata in its authored generation/presentation inputs.

Inspect hosted update logs when changing the package-manager version. Confirm nested manifests and the shared root lockfile update together; a successful local frozen install does not prove hosted updater support. If the updater cannot handle the lockfile, review the updater strategy without restoring overlapping scans or silently downgrading pnpm.
