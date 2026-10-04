# Issue triage and prioritization

This repository uses GitHub's native **Issue Type** as the canonical classification for what kind of work an issue represents. Labels are reserved for orthogonal metadata: ownership area, priority, exceptional lifecycle state, and contribution suitability.

Avoid encoding the same concept in both Issue Type and labels.

## Issue Type

Every ordinary implementation issue should have exactly one native GitHub Issue Type.

| Issue Type | Use for                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Bug`      | Existing behavior that is incorrect, unsafe, regressed, or violates its intended contract.                                 |
| `Feature`  | New externally consumable capability or materially new public behavior.                                                    |
| `Task`     | Bounded engineering, maintenance, refactoring, documentation, release, packaging, migration, testing, or operational work. |

GitHub provides `Bug`, `Feature`, and `Task` as the default organization issue types. Public issue forms set these types directly through the form's top-level `type:` metadata.

### Planning types

The repository also uses two planning concepts:

| Planning type | Use for                                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Epic`        | Outcome/coordination issue that owns multiple independently reviewable child issues.                                        |
| `Spike`       | Time-bounded investigation whose deliverable is evidence and a concrete decision/recommendation rather than implementation. |

`Epic` and `Spike` should be configured as native organization issue types. Until those custom types are available, retain the existing `Epic:` and `Spike:` title prefixes for planning issues rather than creating `type:*` labels.

### Type selection rules

- Prefer `Bug` when the repository already claims or intends behavior and the implementation does not satisfy it.
- Prefer `Feature` only for a new user/developer-facing capability. Do not use it as a generic synonym for work to do.
- Prefer `Task` for implementation/support work that does not itself define a new externally consumable capability.
- Use `Spike` only when uncertainty must be resolved before implementation can be specified responsibly.
- Use `Epic` only when the issue coordinates multiple independently reviewable children.
- Do not recreate Issue Type with `type:*` labels.

### Existing-issue backfill

The temporary `type:*` labels from the initial backlog-normalization pass have been removed from the active backlog.

Existing issues should be backfilled to the equivalent native GitHub Issue Type. The current repository automation surface can manage labels but does not expose Issue Type assignment, so that one-time migration must use an Issue Type-capable GitHub API/UI/CLI path. New issues created from the repository forms are typed correctly automatically.

## Area labels

Use one or more `area:*` labels to identify ownership/domain. Multiple areas are expected for cross-cutting work.

| Label             | Scope                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `area:repository` | Monorepo topology, CI, policy, developer tooling, repository automation, agent workflow. |
| `area:oss`        | Public package-family adoption, registry presentation, contributor-facing OSS workflow.  |
| `area:docs`       | Documentation where documentation itself is a primary deliverable.                       |
| `area:release`    | Publishing, release automation, package/version/release presentation.                    |
| `area:rust`       | Rust generated client and Rust-specific public/runtime concerns.                         |
| `area:oauth`      | OAuth schemas, client runtime, token/session lifecycle, authorization behavior.          |
| `area:data-api`   | Data API schemas, generated transports, upstream Data API behavior and contracts.        |
| `area:mcp`        | Agent-facing MCP application, transport, tools, Docker/local MCP runtime.                |

Area labels describe the code/product ownership affected, not technologies mentioned incidentally.

## Priority labels

Every open issue should have exactly one priority label.

| Label         | Meaning                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `priority:P0` | Immediate critical work: active production outage, severe security exposure, data-loss risk, release-stop condition, or equivalent interruption-worthy incident. |
| `priority:P1` | High priority: blocks an active roadmap/epic, fixes material correctness/security risk, or is a near-term prerequisite.                                          |
| `priority:P2` | Normal planned work: valuable and actionable but not currently blocking a critical path. This is the default priority for ordinary backlog items.                |
| `priority:P3` | Low priority or deferred: opportunistic, cleanup-oriented, intentionally postponed, or closure/reconciliation work.                                              |

Priority is a scheduling signal, not a severity synonym. A bug is not automatically P0/P1, and a feature may be P1 when it sits on the active critical path.

Use dependencies to express ordering. Use priority to express relative urgency across otherwise actionable work.

GitHub also supports organization-level custom issue fields, including single-select fields suitable for priority. If this repository later adopts a native Priority field, use `P0`–`P3` as the option set and retire the priority labels rather than maintaining both representations.

## Status labels

`status:*` labels are deliberately sparse. GitHub issue state and explicit dependencies already carry most lifecycle information.

| Label                   | Use for                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `status:blocked`        | The issue cannot proceed until a concrete dependency, decision, or prerequisite is resolved.                |
| `status:ready-to-close` | Work is effectively complete and the remaining action is closure/reconciliation rather than implementation. |

Do not add labels such as `status:ready`, `status:in-progress`, or `status:done` merely to mirror GitHub state.

## Taxonomy label colors

Use this exact palette for existing taxonomy labels. Priority carries the strongest
visual hierarchy: critical red, urgent orange/red, planned amber, then quiet pale
blue. Status uses danger red and completion green. Area colors keep the proposed
hue families but use lighter, muted shades so ownership does not compete with
urgency; documentation uses teal to distinguish it from the two API/auth blues.
Release green is deliberately lighter than completion green.

| Label                   | Hex      |
| ----------------------- | -------- |
| `priority:P0`           | `B60205` |
| `priority:P1`           | `D93F0B` |
| `priority:P2`           | `FBCA04` |
| `priority:P3`           | `C5DEF5` |
| `status:blocked`        | `B60205` |
| `status:ready-to-close` | `0E8A16` |
| `area:mcp`              | `BAA2EF` |
| `area:oauth`            | `8FB4E8` |
| `area:data-api`         | `9EC9F0` |
| `area:rust`             | `E6B8EC` |
| `area:repository`       | `BFC5CC` |
| `area:release`          | `B6D8BA` |
| `area:docs`             | `A7DDDE` |
| `area:oss`              | `CCBFFD` |

Hex values omit the leading `#` for GitHub's API/CLI. Color is a scanning aid;
retain the explicit label names so meaning does not depend on color perception.
For a new taxonomy label, choose an explicit color before creating it: reserve
strong red/orange/amber for urgency, strong red/green for exceptional status, and
muted distinct hues for areas. Compare it with the existing palette and record
its exact hex here; do not accept GitHub's default `EDEDED`.

Update existing definitions in place with `gh label edit` or
`PATCH /repos/{owner}/{repo}/labels/{name}`. Never delete/recreate labels to recolor
them. Query definitions afterward to verify colors and unchanged label IDs, and
compare issue label assignments before/after. Recoloring must not change issue
priorities, statuses, areas, or native Issue Types, or reintroduce `type:*` labels.

## Contribution labels

Labels such as `good first issue` and `help wanted` are separate from Issue Type, area, priority, and status. Apply them only when the issue is genuinely bounded, unblocked, and documented well enough for an external contributor to complete without hidden maintainer context.

## Issue creation and triage workflow

When an issue is created or reviewed:

1. Set exactly one native GitHub Issue Type.
2. Assign exactly one `priority:P0`–`priority:P3` label.
3. Assign the smallest accurate set of `area:*` labels.
4. Add `status:*` only when an exceptional lifecycle state materially improves filtering.
5. Record explicit dependencies using GitHub relationships when available; do not encode dependencies as ad-hoc labels.
6. Remove generic/default labels that duplicate structured metadata.
7. Revisit metadata when scope or scheduling changes. A completed spike should normally produce implementation issues rather than being converted into a task.

## Useful filters

```text
is:issue is:open type:"Bug"
is:issue is:open type:"Feature"
is:issue is:open type:"Task"
is:issue is:open label:"priority:P0"
is:issue is:open label:"priority:P1"
is:issue is:open label:"priority:P2" -label:"status:blocked"
is:issue is:open label:"priority:P3"
is:issue is:open label:"area:mcp"
is:issue is:open label:"area:oauth" type:"Bug"
is:issue is:open label:"status:blocked"
```

## Examples

- “Refresh token rotation races under concurrent session restore” → `Bug`, `area:oauth`, `priority:P1` while it blocks server-style consumers.
- “Add a first-class Rust client package surface” → `Feature`, `area:rust`, `area:oss`, normally `priority:P2`.
- “Add contributor/security documentation” → `Task`, `area:docs`, `area:oss`, normally `priority:P2`.
- “Determine safe MCP handling for chunked Data API responses” → `Spike`, `area:mcp`, `area:data-api`, `priority:P1` while it blocks the MCP architecture.
- “Define and coordinate the MCP architecture backlog” → `Epic`, `area:mcp`, priority based on roadmap state.
