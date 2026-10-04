# Issue triage and prioritization

This repository uses GitHub's native **Issue Type** as the canonical classification for what kind of work an issue represents. Labels are reserved for orthogonal metadata: ownership area, priority, exceptional lifecycle state, and contribution suitability.

Avoid encoding the same concept in both Issue Type and labels.

## Issue Type

Every open issue should have exactly one GitHub Issue Type.

Use the organization-defined types as follows:

| Issue Type | Use for |
| --- | --- |
| `Bug` | Existing behavior that is incorrect, unsafe, regressed, or violates its intended contract. |
| `Feature` | New externally consumable capability or materially new public behavior. |
| `Task` | Bounded engineering, maintenance, refactoring, documentation, release, packaging, migration, testing, or operational work. |
| `Epic` | Outcome/coordination issue that owns multiple independently reviewable child issues. Use when the organization has the custom type configured. |
| `Spike` | Time-bounded investigation whose deliverable is evidence and a concrete decision/recommendation rather than implementation. Use when the organization has the custom type configured. |

### Type selection rules

- Prefer `Bug` when the repository already claims or intends behavior and the implementation does not satisfy it.
- Prefer `Feature` only for a new user/developer-facing capability. Do not use it as a generic synonym for “work to do.”
- Prefer `Task` for implementation/support work that does not itself define a new externally consumable capability.
- Use `Spike` only when uncertainty must be resolved before implementation can be specified responsibly.
- Use `Epic` only when the issue coordinates multiple independently reviewable children.
- Do not recreate Issue Type with `type:*` labels.

Public issue forms create `Bug`, `Feature`, or `Task` issues directly through the form's native `type:` metadata. `Epic` and `Spike` are normally maintainer-created during planning/triage.

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

## Priority labels

Every open issue should have exactly one priority label.

| Label | Meaning |
| --- | --- |
| `priority:P0` | Immediate critical work. Active production outage, severe security exposure, data-loss risk, or another condition requiring interruption of normal work. |
| `priority:P1` | High priority. Blocks an active roadmap/epic, fixes a material correctness/security risk, or is a prerequisite for near-term delivery. |
| `priority:P2` | Normal planned work. Valuable and actionable but not currently blocking a critical path. This is the default priority for ordinary backlog items. |
| `priority:P3` | Low priority or deferred. Opportunistic, cleanup-oriented, intentionally postponed, or blocked with no near-term scheduling pressure. |

Priority is a scheduling signal, not a severity synonym. A bug is not automatically P0/P1, and a feature may be P1 if it is on the active critical path.

Use dependencies to express ordering. Use priority to express relative urgency across otherwise actionable work.

## Status labels

`status:*` labels are deliberately sparse. GitHub issue state and explicit dependencies already carry most lifecycle information.

Current statuses:

| Label | Use for |
| --- | --- |
| `status:blocked` | The issue cannot proceed until a concrete dependency, decision, or prerequisite is resolved. |
| `status:ready-to-close` | Work is effectively complete and the remaining action is closure/reconciliation rather than implementation. |

Do not add labels such as `status:ready`, `status:in-progress`, or `status:done` merely to mirror GitHub state. Add a new status only when it provides filtering information GitHub does not already represent well.

## Contribution labels

Labels such as `good first issue` and `help wanted` are separate from Issue Type, area, priority, and status. Apply them only when the issue is genuinely bounded, unblocked, and documented well enough for an external contributor to complete without hidden maintainer context.

## Issue creation and triage workflow

When an issue is created or reviewed:

1. Set exactly one native GitHub Issue Type.
2. Assign exactly one `priority:P0`–`priority:P3` label.
3. Assign the smallest accurate set of `area:*` labels.
4. Add `status:*` only when an exceptional lifecycle state materially improves filtering.
5. Record explicit dependencies in the issue body or GitHub dependency relationship; do not encode dependencies as ad-hoc labels.
6. Remove generic/default labels that duplicate the structured taxonomy.
7. Revisit metadata when scope or scheduling changes. In particular, a completed spike should normally produce implementation issues rather than being converted into a task.

## Useful filters

```text
is:issue is:open type:bug
is:issue is:open type:feature
is:issue is:open type:task
is:issue is:open label:"priority:P0"
is:issue is:open label:"priority:P1"
is:issue is:open label:"priority:P2" -label:"status:blocked"
is:issue is:open label:"priority:P3"
is:issue is:open label:"area:mcp"
is:issue is:open label:"area:oauth" type:bug
is:issue is:open label:"status:blocked"
is:issue is:open -label:"status:blocked" -label:"status:ready-to-close"
```

## Examples

- “Refresh token rotation races under concurrent session restore” → `Bug`, `area:oauth`, typically `priority:P1` when it blocks server-style consumers.
- “Add a first-class Rust client package surface” → `Feature`, `area:rust`, `area:oss`, usually `priority:P2` unless it is on an active release path.
- “Add contributor/security documentation” → `Task`, `area:docs`, `area:oss`, usually `priority:P2`.
- “Determine safe MCP handling for chunked Data API responses” → `Spike`, `area:mcp`, `area:data-api`, `priority:P1` while it blocks the MCP architecture.
- “Define and coordinate the MCP architecture backlog” → `Epic`, `area:mcp`, priority based on the roadmap state.
