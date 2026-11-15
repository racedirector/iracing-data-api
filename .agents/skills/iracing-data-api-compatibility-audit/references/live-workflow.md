# Live Data API compatibility workflow

Use this ordered procedure, scoped to the user's request. The repository audit
skill coordinates it; the package-local
[api-command skill](../../../../apps/iracing-data-cli/.agents/skills/api-command/SKILL.md)
owns command implementation. Do not replace the CLI with temporary clients.

## 1. Preflight and build

Record revision/dirty tree, requested scope, current schema/mapping owners,
credential selection, test cases, and live-gate availability. Read scoped guides
and current manifests. Preserve unrelated work.
Review the living [reconciliation log](../../../../docs/DATA-API-RECONCILIATION.md)
and include applicable prior decisions in the scoped case plan. Revalidate them
with fresh docs/live evidence, then record retain / revise / revert (or blocked)
with a review date and git context; never treat old findings as current authority.

```bash
pnpm --filter '@iracing-data/cli...' --filter '@iracing-data/api-schema-to-openapi...' build
```

Use the repository Node/pnpm versions. This build is not code generation.
For ongoing command work, use the package skill's watch procedure rather than
repeated temporary probes. Discover actual live-suite scripts in manifests;
never invent them. The current CLI has only mocked full-endpoint coverage.

## 2. Authentication: one explicit recovery path

Use the existing CLI and its private credential store, never a new auth helper.
Select the credential path explicitly for the audit: an environment access token
can otherwise override newly saved credentials. Explicit `--credentials` wins,
then `IRACING_ACCESS_TOKEN`, then the ignored default credential file.

If login is authorized and password-limited grants are registered/configured:

```bash
pnpm iracing-data auth login --method=password-limited
```

Prefer existing selected credentials. Login is for requested authentication,
missing credentials, or an identified authentication failure—not a mandatory
rewrite on every audit. The docs request itself is the Data API access preflight;
do not require `whoami` or `iracing.profile` for an auth-only Data API audit.

Read current CLI help before selecting another supported method. Do not print
secret values, add passwords to argv, silently fall back to another grant, or
open a browser without arranging the required user interaction.

| Failure                                                                      | Required operator action                                                                                                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Missing registration/account configuration or unsupported grant              | Explain which configuration category is missing; ask the operator to configure the registered method. Do not guess secrets or retry another grant.           |
| Existing credential destination                                              | Respect overwrite protection. Ask for authorization to replace the selected file with `--force`, or use an operator-selected private destination.            |
| Invalid credentials, rejected client, invalid scope, or denied authorization | Stop. Report the sanitized error category and ask the operator to correct registration/account/scope/access. No login loops.                                 |
| HTTP 401 from docs or a batch                                                | Check selected credential path and expiry. Reauthenticate once when authorized; stop/resume the batch rather than misclassifying every case as schema drift. |
| HTTP 403                                                                     | Check scope and account/endpoint access; do not assume expired credentials or broaden scopes automatically.                                                  |
| HTTP 429, 5xx, timeout, or network failure                                   | Mark blocked; respect server recovery/rate-limit instructions. Do not change schemas or repeatedly log in.                                                   |

Use the CLI's actual safe diagnostic to determine the action. If login fails,
tell the user what to fix and stop the affected live gate. Authentication success
alone does not establish Data API access or contract compatibility.

## 3. Fetch current docs once

`iracing-data docs` uses the generated Data API client (`DocApi`) for the modeled
request; it does not crawl the returned endpoint links.

For docs-only verification, preserve pipeline failures:

```bash
set -o pipefail
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs --credentials .iracing-data/credentials.json \
  | node -r ts-node/register scripts/audit-data-docs.cjs -
```

For maintenance, retain one private plain response for same-input comparison:

```bash
tmp_dir="$(mktemp -d)"
chmod 700 "$tmp_dir"
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs \
  --credentials .iracing-data/credentials.json --output "$tmp_dir/data-docs.json"
node -r ts-node/register scripts/audit-data-docs.cjs "$tmp_dir/data-docs.json"
```

Use an operator-selected credential path when different. A selected invalid file
must fail, not fall back. Verify each command's exit status before continuing.
That document is private to the current run, not durable upstream authority;
remove it afterward. Do not introduce response archives, hashes, or capture
directories as a new evidence system.

## 4. Diff and classify before probing

The comparator has no transport or persistence. It exits 0 for structural
agreement, 2 for review candidates/schema rejection, or 1 for execution failure.
Review its route/parameter findings against canonical schemas, authored endpoint
mapping, and notes. Resolve references/templates first. Notes can document
selectors absent from structured parameter maps; `numbers` can mean CSV.
Absence from docs is not sufficient evidence to remove a local capability.

Create a scoped case plan before requests: endpoint, command, canonical input and
output schema, valid selectors/prerequisites, expected success condition, and
request budget. Do not adapt the offline dispatch test's fake IDs into live
inputs. This stage produces a reproducible plan, not a spray of guessed requests.

## Repair and regenerate

In maintenance mode only, repair evidence-supported authored input/mapping
discrepancies first. For a missing method, establish its documented route and
request before generating it. Unknown outputs remain explicitly unverified,
not invented shapes or generic-envelope fallbacks.

Use the smallest development cycle for this CLI:

```bash
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
pnpm codegen:openapi:api
pnpm codegen:openapi:api:yaml
pnpm codegen:client:api:fetch
pnpm --filter @iracing-data/api-client-fetch build
pnpm --filter @iracing-data/cli build
```

Follow [OpenAPI guidance](../../../../openapi/AGENTS.md) and client scoped guides;
inspect diffs and preserve reviewed versions/settings. Generated source is not
an edit target. Runtime-only fixes need no contract regeneration. Verification-only
mode reports repairs and commands without applying them.

## 5. Validate our live inputs and outputs

Apply the package-local
[live validation boundary](../../../../apps/iracing-data-cli/.agents/skills/api-command/references/live-contract-validation.md).
Invoke only an existing, explicitly opt-in live suite discovered in the manifest.
**No such full suite exists at this revision**; report the gap rather than
inventing a successful command. Missing response-only support is also a gap.

For an available scoped case, execute the existing response-only command with
reviewed valid inputs and explicit credential selection. Validate the raw
modeled response with the endpoint's canonical API Zod schema before client
normalization; check HTTP/content type and documented success invariants.
Keep the original privately in memory so stripping does not hide fields.
Test our input/output expectations, not generated classes, decoders, snapshots,
or generator internals. A permissive schema's parse pass has limited evidential
value; request acceptance does not prove the semantics of every optional filter.

Classify each case as PASS, CONTRACT_MISMATCH, BLOCKED, or NOT_RUN. Missing
schemas/cases, invalid prerequisites, access, expiry, network, and rate limits
must not appear as passing contract tests. No automatic all-link or chunk crawl.
An envelope pass does not validate a linked payload. Only changed command-owned
payload interpretations justify an additional bounded JSON/CSV/materialization
case through the maintained opaque-link resolver.

## 6. Repair outputs and rerun

Review each mismatch against current evidence and the canonical owner's
requiredness, unions, coercion, and unknown-field policy. Do not loosen schemas
or delete cases simply to pass. Add minimal authored acceptance/rejection tests
for the confirmed rule, then repair schemas/mappings or the CLI adapter as
appropriate. Rebuild/regenerate Fetch when required, rerun the failing case,
then the declared set.

Every case change must trace to an affected command and add/modify/retain/retire
decision. A schema-only repair can retain the existing command with rationale.
No response fixture or test-only update may conceal lost CLI/API coverage.

## 7. Close the reconciliation

Rerun the comparator against the **same current response** from this run; classify
all remaining review candidates. After shared contract repairs pass scoped
validation, regenerate every affected Data API client:

```bash
pnpm codegen:client:api
pnpm verify
```

The existing generated freshness/build checks establish repository consistency,
not upstream compatibility; do not add tests of the generator implementation.
Do not regenerate OAuth merely because authentication was used. Assess public
input/output changes and release candidates independently; do not publish.

Report docs coverage separately from live case and selected payload coverage.
Update the living reconciliation log for every contract change and prior-decision
review using the [report contract](report-contract.md#living-decision-memory).
A full reconciliation with a missing/blocked live gate is **Unable to verify
part of the contract**, even if docs and offline tests pass. A requested docs-only
result must say docs-only. Use the [report contract](report-contract.md), include
command decisions and precise validation limits, and remove private run data.
