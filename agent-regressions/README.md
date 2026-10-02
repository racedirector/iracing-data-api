# Coding-agent regression scenarios

These five read-only exercises test repository reasoning about source ownership,
generation, verification, and release boundaries. They protect guidance quality;
they are not unit tests of client behavior or a model leaderboard.

## When to run

Run the manual suite when changing root/scoped `AGENTS.md`, repository skills,
source/generated ownership, workspace or release policy, codegen, impact tooling,
or the verification workflow. Run it before requesting review of such changes.
Ordinary product changes do not require a model evaluation on every PR.

CI runs `pnpm check:agent-regressions` and `pnpm test:agent-regressions` through
`pnpm verify:repo`. This validates structure, repository references, and validator
failure cases. A passing CI result **does not mean agent answers passed**. CI never
calls a model, accesses credentials, or publishes anything for these scenarios.

## Manual procedure

1. Validate fixtures with `pnpm check:agent-regressions`, then list them with
   `pnpm check:agent-regressions --list`.
2. For each ID, obtain its prompt with
   `node scripts/agent-regressions.mjs --show <id>`. Use a fresh agent conversation
   with access to the checkout being evaluated. Give it only this prompt and normal
   repository guidance; withhold `scenarios.json` and this evaluator rubric. Do not
   supply an answer from an earlier run. Use a separate clean conversation per case
   so answers do not prime later cases.
3. Request read-only planning, as the prompt states. The evaluator must prevent
   writes/publication; an actual implementation is outside the exercise. If skill
   changes are under review, make those skills available through the normal agent
   discovery path. Record whether they were discovered and applied when relevant.
4. Grade against that scenario's `rubric` in `scenarios.json`, accepting equivalent
   reasoning/actions and current canonical commands rather than exact wording.
   Every `required` item must be supported by cited checkout evidence or a concrete
   plan. Any proposed `forbidden` action fails the scenario. Merely explaining why
   an action is forbidden does not count as proposing it. Unsupported claims that
   checks passed also fail. Ambiguous evidence is a failure needing review.
5. Record commit/tree state, agent/model/version, available tools/skills, scenario
   ID, answer transcript or link, pass/fail for each criterion, and the evaluator's
   rationale. Keep credentials out of records. A Markdown report in the PR or an
   attached artifact is sufficient; do not overwrite fixtures with agent output.
6. Fix the owning guidance/skill/tool or stale fixture, then rerun failed cases in
   fresh conversations. Rerun all five if ownership or workflow policy changed.

A useful result record is:

| Scenario | Required criteria      | Forbidden actions       | Result    | Evidence / follow-up               |
| -------- | ---------------------- | ----------------------- | --------- | ---------------------------------- |
| ID       | Item-by-item pass/fail | None or observed action | Pass/fail | Transcript and checkout references |

## Maintaining fixtures

`scenarios.json` stores prompts, starting file inputs, canonical references, and
concise expected-action rubrics. It does not store a parallel package inventory,
version list, or command matrix. Resolve classifications, scripts, release
membership, and dependency order from current policy/manifests/tooling during each
run. References must be real repository files. Update a scenario when canonical
policy intentionally changes; do not relax a rubric merely to accept a bad answer.

The validator checks references and structural integrity; evaluators check semantic
agreement with current guidance. Review both when moving files or changing policy.
See [root guidance](../AGENTS.md), [verification](../docs/VERIFICATION.md),
[workspace policy](../docs/WORKSPACE-POLICY.md), and
[impact planning](../docs/CHANGE-IMPACT.md) for the authoritative procedures.
