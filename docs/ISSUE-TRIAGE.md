# Issue triage and labeling

This repository uses a small, namespaced label taxonomy so issues can be sorted by **what kind of work they represent**, **where the work belongs**, and **whether a lifecycle state materially affects whether it can be picked up**.

The labels are intentionally orthogonal. Avoid encoding the same concept in multiple labels.

## Primary issue type

Every open issue should have exactly one `type:*` label.

| Label | Use for |
| --- | --- |
| `type:epic` | Outcome/coordination issues that own a backlog of smaller issues. Epics should not be the normal implementation unit. |
| `type:feature` | New externally consumable capability or materially new public behavior. |
| `type:bug` | Existing behavior that is incorrect, unsafe, regressed, or violates its intended contract. |
| `type:task` | Bounded engineering, maintenance, refactoring, documentation, release, packaging, migration, or operational work. |
| `type:spike` | Time-bounded investigation whose deliverable is evidence and a concrete decision/recommendation rather than implementation. |

### Type selection rules

- Prefer `type:bug` when the repository already claims or intends behavior and the implementation does not satisfy it.
- Prefer `type:feature` only for a new user/developer-facing capability. Do not use it as a generic synonym for “work to do.”
- Prefer `type:task` for implementation/support work that does not itself define a new externally consumable capability.
- Use `type:spike` only when uncertainty must be resolved before implementation can be specified responsibly.
- Use `type:epic` only when the issue coordinates multiple independently reviewable children.
- Do not assign more than one `type:*` label.

Public issue forms create `type:bug`, `type:feature`, or `type:task` issues. `type:epic` and `type:spike` are normally maintainer-created during planning/triage.

## Area labels

Use one or more `area:*` labels to identify ownership/domain. Multiple areas are expected for cross-cutting work.

Current areas:

| Label | Scope |
| --- | --- |
| `area:repository` | Monorepo topology, CI, policy, developer tooling, repository automation, agent workflow. |
| `area:oss` | Public package-family adoption, registry presentation, contributor-facing OSS workflow. |
| `area:docs` | Documentation where documentation itself is a primary deliverable. |
| `area:release` | Publishing, release automation, package/version/release presentation. |
| `area:rust` | Rust generated client and Rust-specific public/runtime concerns. |
| `area:oauth` | OAuth schemas, client runtime, token/session lifecycle, authorization behavior. |
| `area:data-api` | Data API schemas, generated transports, upstream Data API behavior and contracts. |
| `area:mcp` | Agent-facing MCP application, transport, tools, Docker/local MCP runtime. |

Area labels should describe the code/product ownership affected, not the technology mentioned incidentally in the issue.

When a genuinely new stable ownership area emerges, add a new `area:*` label rather than overloading an unrelated existing area.

## Status labels

`status:*` labels are deliberately sparse. GitHub issue state and explicit dependencies already carry most lifecycle information.

Current statuses:

| Label | Use for |
| --- | --- |
| `status:blocked` | The issue cannot proceed until a concrete dependency, decision, or prerequisite is resolved. |
| `status:ready-to-close` | Work is effectively complete and the remaining action is closure/reconciliation rather than implementation. |

Do not add labels such as `status:ready`, `status:in-progress`, or `status:done` merely to mirror GitHub state. Add a new status only when it provides filtering information GitHub does not already represent well.

## Priority

The repository does not currently use `priority:*` labels. Dependencies, epic ordering, and issue scope are the preferred scheduling signals.

Add a priority axis only if maintainers need to make explicit cross-epic ordering decisions that cannot be represented by dependencies or backlog order.

## Contribution labels

Labels such as `good first issue` and `help wanted` are separate from issue type and area. Apply them only when the issue is genuinely bounded, unblocked, and documented well enough for an external contributor to complete without hidden maintainer context.

Do not use contribution labels as substitutes for `type:*`, `area:*`, or `status:*` labels.

## Issue creation and triage workflow

When an issue is created or reviewed:

1. Assign exactly one `type:*` label.
2. Assign the smallest accurate set of `area:*` labels.
3. Add `status:*` only when an exceptional lifecycle state materially improves filtering.
4. Record explicit dependencies in the issue body or GitHub dependency relationship; do not encode dependencies as ad-hoc labels.
5. Remove generic/default labels that duplicate the namespaced taxonomy.
6. Revisit labels when scope changes. In particular, a completed spike should normally produce implementation issues rather than being relabeled into a task.

## Useful filters

```text
is:issue is:open label:"type:bug"
is:issue is:open label:"type:feature"
is:issue is:open label:"type:task" -label:"status:blocked"
is:issue is:open label:"type:spike"
is:issue is:open label:"type:epic"
is:issue is:open label:"area:mcp"
is:issue is:open label:"area:oauth" label:"type:bug"
is:issue is:open label:"status:blocked"
is:issue is:open -label:"status:blocked" -label:"status:ready-to-close"
```

## Examples

- “Refresh token rotation races under concurrent session restore” → `type:bug`, `area:oauth`.
- “Add a first-class Rust client package surface” → `type:feature`, `area:rust`, `area:oss`.
- “Add contributor/security documentation” → `type:task`, `area:docs`, `area:oss`.
- “Determine safe MCP handling for chunked Data API responses” → `type:spike`, `area:mcp`, `area:data-api`.
- “Define and coordinate the MCP architecture backlog” → `type:epic`, `area:mcp`.
