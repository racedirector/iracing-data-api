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

Read the public [bug](../.github/ISSUE_TEMPLATE/bug_report.yml), [feature](../.github/ISSUE_TEMPLATE/feature_request.yml) and [task](../.github/ISSUE_TEMPLATE/task_request.yml) forms for configured types and defaults. Their configuration owns form behavior; this guide owns human classification decisions.

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

### Existing-issue reconciliation

Inspect live organization issue types and repository labels before backfilling metadata. Use a type-capable GitHub API/UI/CLI path to assign the equivalent native type; tool availability is not a reason to recreate `type:*` labels. Preserve existing issue relationships and verify assignments afterward.

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

The public issue forms apply `priority:P2` by default. During triage, replace that
label when another priority is warranted; do not add a second priority label.
Issues created through blank issues, the CLI, or the API require explicit priority
assignment. Keep `priority:P2` defined in the repository so the form default can
be applied.

| Label         | Meaning                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `priority:P0` | Immediate critical work: active production outage, severe security exposure, data-loss risk, release-stop condition, or equivalent interruption-worthy incident. |
| `priority:P1` | High priority: blocks an active roadmap/epic, fixes material correctness/security risk, or is a near-term prerequisite.                                          |
| `priority:P2` | Normal planned work: valuable and actionable but not currently blocking a critical path. This is the default priority for ordinary backlog items.                |
| `priority:P3` | Low priority or deferred: opportunistic, cleanup-oriented, intentionally postponed, or closure/reconciliation work.                                              |

Priority is a scheduling signal, not a severity synonym. A bug is not automatically P0/P1, and a feature may be P1 when it sits on the active critical path.

Use dependencies to express ordering. Use priority to express relative urgency across otherwise actionable work.

GitHub also supports organization-level custom issue fields, including single-select fields suitable for priority. If this repository later adopts a native Priority field, use `P0`–`P3` as the option set and retire the priority labels rather than maintaining both representations.

## Discovering worthwhile work

An open issue records a possible contribution, not an instruction to execute it.
Agents exploring the backlog should surface **credible opportunities** without
needing a maintainer-maintained "do next" list, fixed project ordering, or an
automatic priority score. Choose what to investigate in the context of the
user's objective, code area and the live repository; explain the judgment.
An agent may reasonably select different work when the context changes.

### Opportunity signals

Evaluate candidates using evidence rather than label ordering alone:

- **Consequences:** user-facing correctness, security, reliability, API
  compatibility, architectural leverage, verification debt, or a genuine
  prerequisite for important work. Priority labels indicate relative urgency,
  not the next issue to claim.
- **Evidence:** a reproducible failure, a specific contract mismatch, an
  authoritative upstream change, or a clearly framed unknown worth testing.
  Validate claims against current source and merged PRs; historical issue
  instructions and closed designs are not implementation authority.
- **Readiness:** a defined outcome, bounded change or research question,
  acceptance/decision criteria, test strategy, and access to the relevant
  environment. A spike may be ready even when its implementation is not.
- **Dependencies and coordination:** live native `blocked by` relationships,
  prerequisite text, parent/child context, current PRs, assignees and project
  status when accessible. Do not conflate issue dependencies with stacked PR
  ancestry; absent or inaccessible metadata is **unknown**, not "unblocked".
- **Size and leverage:** prefer a coherent, independently reviewable slice
  that can be verified. Broad epics, registry publication and hosted OAuth
  decisions may require a bounded proof or maintainer approval first.

Agents should inspect both issues **and active PRs**: reviewing or finishing a
high-impact PR may be more valuable than beginning another issue. An assigned
issue is not automatically unavailable, but overlapping work should be
coordinated rather than duplicated. Do not assume an old comment asserting
"next" or "in progress" still describes live state.

When reporting opportunities, provide a small, diverse set of promising
candidates with links, current evidence, expected payoff, major prerequisites,
likely verification and uncertainty; distinguish **worth investigating** from
**ready to implement**. Choose a candidate only if the user requested
execution and the evidence supports it. No GitHub mutation is needed for
read-only discovery. If none is ready, identify the missing evidence or decision
rather than making up a task or manufacturing a readiness label.

### Keeping an issue discoverable

During triage and reconciliation, keep the issue's durable description useful to
an unfamiliar contributor. Prefer concise, current material:

- The observed problem or bounded research question and why it matters.
- Owning source/contract, reproducible evidence or exact unknown, and relevant
  merged/active PRs. Retain archived code links when an old implementation
  contains unique tests or behavior worth reusing.
- The intended outcome and non-goals; observable acceptance or spike decision
  criteria; appropriate validation/fixtures.
- True prerequisites and required maintainer decisions. Add **native GitHub
  dependencies** where supported; also state blockers in the description so
  they remain discoverable if an integration cannot read them.
- Current ownership/coordination evidence, without inventing progress status.

Review these facts when code merges, PRs supersede an implementation, or an
issue's scope changes. Avoid stale "next", "ready", and "in progress" prose,
duplicate priority fields, fixed rankings and speculative work just to fill
the backlog. The objective is **legible options for agent judgment**, not a
scheduling mechanism.

## Status labels

`status:*` labels are deliberately sparse. GitHub issue state and explicit dependencies already carry most lifecycle information.

| Label                   | Use for                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `status:ready-to-close` | Work is effectively complete and the remaining action is closure/reconciliation rather than implementation. |

Use GitHub's native **blocked by** and **blocking** issue relationships for
prerequisites. The `status:blocked` label is retired. Link the concrete prerequisite
issue before removing a legacy blocked label. Record decisions or missing context
in the issue description; create a dependency only when a concrete prerequisite
issue exists. An epic coordinating active work is not automatically blocked by
all of its children.

Do not add labels such as `status:ready`, `status:in-progress`, or `status:done` merely to mirror GitHub state.

## Taxonomy label colors

Use this exact palette for existing taxonomy labels. Priority carries the strongest
visual hierarchy: critical red, urgent orange/red, planned amber, then quiet pale
blue. The ready-to-close status uses completion green. Area colors keep distinct
hue families but use lighter, muted shades so ownership does not compete with
urgency; documentation uses teal to distinguish it from the two API/auth blues.
Release green is deliberately lighter than completion green.

| Label                   | Hex      |
| ----------------------- | -------- |
| `priority:P0`           | `B60205` |
| `priority:P1`           | `D93F0B` |
| `priority:P2`           | `FBCA04` |
| `priority:P3`           | `C5DEF5` |
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
strong red/orange/amber for urgency, strong green for completion status, and
muted distinct hues for areas. Compare it with the existing palette and record
its exact hex here; do not accept GitHub's default `EDEDED`.

Update existing definitions in place with `gh label edit` or
`PATCH /repos/{owner}/{repo}/labels/{name}`. Never delete/recreate labels to recolor
them. Query definitions afterward to verify colors and unchanged label IDs, and
compare issue label assignments before/after. Recoloring must not change issue
priorities, statuses, areas, or native Issue Types, or reintroduce `type:*` labels.

## Contribution labels

Labels such as `good first issue` and `help wanted` are separate from Issue Type, area, priority, and status. Apply them only when the issue is genuinely bounded, unblocked, and documented well enough for an external contributor to complete without hidden maintainer context.

Use `good first issue` for work approachable by a newcomer; use `help wanted` for a bounded request that may need specific experience or an environment maintainers cannot readily exercise. Neither label is a quota. A curated list may be empty when the backlog has no suitable work.

Before applying either label, give the issue a clear problem, acceptance criteria, owning source, and locally reproducible validation, and link [contributor setup and verification](../CONTRIBUTING.md). Recheck contribution labels during triage and whenever scope, dependencies, ownership, or implementation status changes. Remove them when work becomes blocked, needs an unresolved maintainer decision, has an active implementation PR, or is no longer available to an external contributor. Keep priority and native issue relationships accurate; do not create speculative tasks to populate the list.

## Issue creation and triage workflow

When an issue is created or reviewed:

1. Set exactly one native GitHub Issue Type.
2. Assign exactly one `priority:P0`–`priority:P3` label.
3. Assign the smallest accurate set of `area:*` labels.
4. Add `status:*` only when an exceptional lifecycle state materially improves filtering.
5. Record explicit dependencies using GitHub's native blocked-by/blocking relationships; do not encode dependencies as labels.
6. Remove generic/default labels that duplicate structured metadata.
7. Revisit metadata when scope or scheduling changes. A completed spike should normally produce implementation issues rather than being converted into a task.

## Useful filters

```text
is:issue is:open type:"Bug"
is:issue is:open type:"Feature"
is:issue is:open type:"Task"
is:issue is:open label:"priority:P0"
is:issue is:open label:"priority:P1"
is:issue is:open label:"priority:P2"
is:issue is:open label:"priority:P3"
is:issue is:open label:"area:mcp"
is:issue is:open label:"area:oauth" type:"Bug"
```

For dependency inspection, use the issue's native relationships or the
[GitHub issue dependency API](https://docs.github.com/en/rest/issues/issue-dependencies):
`GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by`
and `GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocking`.
The priority filter above includes both blocked and unblocked issues.

## Examples

- “Refresh token rotation races under concurrent session restore” → `Bug`, `area:oauth`, `priority:P1` while it blocks server-style consumers.
- “Add a first-class Rust client package surface” → `Feature`, `area:rust`, `area:oss`, normally `priority:P2`.
- “Add contributor/security documentation” → `Task`, `area:docs`, `area:oss`, normally `priority:P2`.
- “Determine safe MCP handling for chunked Data API responses” → `Spike`, `area:mcp`, `area:data-api`, `priority:P1` while it blocks the MCP architecture.
- “Define and coordinate the MCP architecture backlog” → `Epic`, `area:mcp`, priority based on roadmap state.
