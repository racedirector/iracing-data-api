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

Read the report's direct changes, dependents, derived artifacts, generated clients,
verification commands and managed release candidates as review inputs. The
[current graph and propagation rationale](../scripts/workspace-impact.mjs) and
[regression tests](../scripts/workspace-impact.test.mjs) own these computations.
Run `pnpm check:topology` before trusting a report after topology edits.

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
