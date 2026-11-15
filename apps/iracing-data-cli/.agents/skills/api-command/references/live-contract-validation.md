# Live API input/output validation

This is the package-local boundary for a deterministic live contract suite.
It is deliberately narrower than a generic upstream crawler or generator test
framework. Repository reconciliation orders its execution; the CLI owns the
command path and effects; API schemas own acceptance.

## Current tooling and explicit gap

Inspect the [manifest](../../../../package.json) before invoking anything.
At this revision:

- `test/endpoint-coverage.test.cjs` checks command dispatch with mocked transport.
  Its synthetic numeric placeholders are **not valid live cases**.
- `test` is an offline suite, not authenticated contract validation.
- `--response-only` exists on some command groups, not every runtime endpoint.
- There is **no executable all-endpoint live contract suite**.

Do not invent a live-suite script name, describe the mocked test as live, or
claim a full reconciliation passed without this gate. Report **Unable to verify
part of the contract** for missing live coverage. Implementing the runner or
adding missing response-only support is explicit runtime work, not something
accomplished by changing skill prose.

For a requested individual command, one reviewed CLI invocation can establish
that case's current observation. It cannot replace the absent full suite.
No scratch clients or guessed-input loops.

## Required suite contract

When runtime implementation is authorized, keep the suite package-local and
explicitly opt-in. Normal `pnpm verify` must remain service-free. Test these
authored contracts only:

1. **Coverage.** Derive expected read-only runtime endpoints from the current docs
   comparison and maintained endpoint mapping. Account for path templates,
   category variants, aliases, new routes, and local-only routes. Each endpoint
   needs a reviewed case or an explicit blocking reason. Do not silently shrink
   the expected set to the subset the CLI currently supports.
2. **Inputs.** Each case identifies the CLI command, canonical request schema,
   valid input selectors, and documented success condition. Resolve required IDs
   from operator-supplied inputs or reviewed prerequisite CLI commands, in a
   stable order. Do not invent IDs, brute-force discovery, or commit account data.
   Test one representative valid request per endpoint plus cases justified by
   changed authored rules—not every flag permutation.
3. **Outputs.** Execute the existing command in response-only mode through the
   generated client. Check HTTP success and content type; validate the **raw wire
   response before decoder normalization** with the endpoint's canonical Zod
   response schema. Schema bindings belong to authored schema/endpoint ownership,
   not a second hard-coded endpoint table in a test. An unmapped schema is a gap,
   never an automatic generic-envelope fallback.
4. **Minimal semantic assertion.** Apply only documented invariants needed to
   recognize the expected outcome: success discriminator, echoed selector when
   supplied, or required response variant. An error object with HTTP 200 is not
   a successful case. An empty valid result may pass shape validation, but cannot
   establish a populated variant or that a requested filter was honored.
5. **Result.** Record endpoint/case, command, schema symbol, and
   **PASS / CONTRACT_MISMATCH / BLOCKED / NOT_RUN**, with sanitized reason.
   Missing cases, absent response-only support, inaccessible required inputs,
   schema gaps, authentication, network failures, and rate limits are not passes.
   A full-live success requires complete declared coverage and no blocking cases.

The CLI/SDK is transport, not the test subject. Do not assert generated class
names, generated decoder behavior, generated snapshots, or internal serializer
code. Canonical inputs accepted by the real endpoint and canonical outputs
accepted from it are the contract under examination. Where the server provides
no observable confirmation of an optional parameter's effect, report that limit
instead of claiming a successful response proves its semantics.

## What a parse pass does—and does not—establish

`safeParse(raw).success` means the current response is accepted by the maintained
schema. It does not prove completeness, exact upstream equality, every input
combination, permissions, or all future response variants.

- Check schema requiredness, coercion, unions, and passthrough/stripping policy
  during semantic review. A permissive record or `unknown` offers limited evidence.
- Preserve the original response privately in memory for review; do not inspect
  only parsed/stripped output. Unexpected fields need classification, not automatic
  rejection or automatic schema expansion.
- `/data/doc` supplies route/parameter facts and notes, not full payload schemas.
  Schema rejection is a reviewable mismatch, not permission to change a type blindly.
- A `link` or `data_url` envelope passing validation says nothing about the linked
  JSON, CSV, or chunk payload. Validate a selected linked payload only when the
  command owns its interpretation or a changed contract requires it. Use the
  maintained materializer; never automatically follow every link/chunk.

## Safety and failure policy

Run only approved read-only endpoint cases; authentication is the explicit
credential-lifecycle exception. Serialize requests by default with a reviewed
request budget, including prerequisite calls. Honor server rate limits; no
unbounded retries, parallel probing, or retry storms.

An auth preflight must precede the endpoint batch. Stop the batch on expired
credentials rather than producing a separate mismatch for every endpoint.
Classify access restrictions, 429, 5xx, timeout, and network failure separately
from contract mismatches. Resolve operator action before a bounded rerun.

Keep credentials, private identifiers, raw bodies, signed URLs, and raw errors
out of logs and committed fixtures. Keep only sanitized statuses/field paths and
current-source references in the report. Temporary docs/input/output files are
private to one run and cleaned afterward; no durable response-capture framework.

## Change accountability

Each changed case records the command decision: add, modify, retain, or retire.
A schema-only repair can retain the command; explain why its behavior is unchanged.
Missing documentation alone does not authorize retiring an endpoint. Never
remove a failing case, loosen required output fields, replace a response schema
with `unknown`, or accept a new envelope union merely to turn a mismatch green.
Repair the evidence-supported authored owner, rerun the same scoped case, then
rerun the declared endpoint set. Offline fixtures prove the authored fix, not
current upstream compatibility.
