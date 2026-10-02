# Workspace change impact

Run from the repository root with installed dependencies:

```bash
pnpm impact --base origin/main
pnpm impact --base origin/main --json
```

The read-only report compares the merge-base of the supplied commit with HEAD
against the current working tree, including staged, unstaged, deleted, renamed
and non-ignored untracked files. Fetch the intended base first; an unavailable
reference fails rather than silently reporting no impact. In CI, fetch sufficient
history for the merge-base. JSON output from `node scripts/workspace-impact.mjs`
is suitable for automation without pnpm's command banner.

Workspace identities and publication classifications come from
`workspace-policy.json`; dependencies and versions come from current npm/Cargo
manifests. Managed release candidates are intersected with `dist-workspace.toml`.
Run `pnpm check:topology` before trusting a report after topology edits.

The report separates direct changes, authored packages, internal dependents,
derived OpenAPI artifacts, generated SDKs, release candidates, generation commands
and verification commands. Data API schema/mapping changes propagate through
OpenAPI to all three SDKs and their manifest dependents. OAuth schema/mapping
changes propagate to OAuth OpenAPI and manifest dependents, without treating the
Data API SDKs as OAuth generator output. Generator/presentation inputs conservatively
flag all Data API SDKs. Root dependency/toolchain/CI changes conservatively affect
all workspaces. Cargo configuration/lock changes affect Cargo workspaces.

Generation edges are repository-owned behavior in `scripts/workspace-impact.mjs`;
update its regression tests when introducing a new pipeline. All internal manifest
dependency categories participate in impact and release ordering. Data API schema
releases precede affected generated SDK releases even though SDK manifests do not
import the schema package. Cycles fail explicitly.

## Release readiness

This report is a checklist, not proof that anything is ready to publish. It does
not execute generation or validation, query registries, select versions, or mutate
files. A dependency or global tooling change can list a package whose published
payload ultimately needs no release. Review the diff and choose the actual release
set; the reported order applies only to candidates selected for publication.

Before releasing, run the reported checks, review generated output and package
presentation, confirm successful mainline CI, choose versions explicitly, and
verify tag/registry conflicts and trusted publishing. Follow
[Releasing](RELEASING.md) and the existing npm-release skill for those operational
checks. Rust candidates use the documented Cargo release path, not the npm workflow.
