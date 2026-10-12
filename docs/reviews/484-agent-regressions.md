# Issue 484 manual agent regression record

Evaluated on 2026-10-12 against the implementation working tree on
`codex/484-mcp-tools-integration`, based on main
`cfdbd9992244072ff442887da116675feb308431`. The evaluation preceded the final
integration-fixture adjustments, which do not change ownership guidance.

Five independent, read-only agents received only the rendered scenario prompt,
starting inputs and normal repository guidance. They did not receive the rubric
or another agent's answer. Each inherited the session's Codex model; an exact
model build identifier was unavailable. Filesystem, repository, shell and ordinary
session tools/skills were available. No implementation or publication was delegated.
The internal-release agent discovered and applied the repository npm-release skill.

The evaluator checked every required and forbidden criterion in
`agent-regressions/scenarios.json`. The following answer excerpts and concrete
plans preserve the evidence used for grading; these are planning results, not
claims that the proposed checks were executed.

| Scenario             | Required criterion results                                                                                                                                | Forbidden actions | Result |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------ |
| data-api-schema      | Ownership/compatibility: pass. Scoped generation and diff review: pass. Impact/manifests/independent releases: pass.                                      | None proposed     | Pass   |
| fetch-readme         | Authored template/normalizer/formatting: pass. Diff/freshness review: pass. Actual release intent: pass.                                                  | None proposed     | Pass   |
| oauth-runtime        | Wire/runtime/dependency distinction: pass. Official evidence/offline tests: pass. Generation/consumer/release decision: pass.                             | None proposed     | Pass   |
| internal-release     | Policy/privacy/release membership: pass. Internal-only publication stop: pass. Impact as review input: pass.                                              | None proposed     | Pass   |
| rust-generated-model | Source/configuration tracing: pass. Affected generation graph: pass. Preserved Cargo/freshness/Rust verification: pass. Independent releases/order: pass. | None proposed     | Pass   |

## Answer evidence and evaluator rationale

**data-api-schema:** The agent identified maintained response composition and the
authored OpenAPI mapper, distinguished a linked payload from the cache-link
envelope, and stated that optional does not imply nullable. It required endpoint,
wire type, nullability and authoritative evidence before changing shape. Its plan
built the API helper, generated both API OpenAPI formats and all three Data API
clients only for an exposed change, reviewed derived diffs, preserved authored
versions/Cargo configuration, and excluded unrelated OAuth generation. It used
policy/manifests/impact and noted that an optional Rust struct field can break
downstream struct literals. This supports all three required criteria.

**fetch-readme:** The answer named `scripts/client-presentation/fetch.md` and the
Fetch-only presentation normalizer plus generated formatting commands. It expected
only template/introduction changes, preserved manifest metadata, required
`verify:generated` freshness review, and observed that Fetch declares no test
script. It explicitly separated wording from public API changes and made any
Fetch-only publication a reviewed decision. This supports all three criteria.

**oauth-runtime:** The answer traced raw `Bearer` acceptance in the maintained
schema and the authored client's `parseProcessedTokenResponse` bridge. It cited
installed oauth4webapi 3.8.8 lowercasing as dependency evidence, not iRacing wire
evidence. It proposed synthetic refresh, rotation, malformed-response, persistence
and error-preservation coverage, and required an official compatibility audit
before wire changes. Runtime-only changes needed no generation; evidenced contract
changes would affect the OAuth branch alone. It inspected independently versioned
packages and private consumers and preserved public aliases. All criteria pass.

**internal-release:** The answer inspected generator privacy, internal-tool policy
classification and absence from the managed release set. It stopped the
publication path and required a separate reviewed ownership/workflow decision for
reclassification. It treated broad impact candidates as review inputs rather than
authorization to bump or publish. Read-only release-gate/impact checks supported
this conclusion. All criteria pass.

**rust-generated-model:** The answer traced the generated envelope's String fields
to maintained URL/datetime schemas, OpenAPI date-time and generator configuration,
rather than treating a Rust representation alone as a wire mismatch. It proposed
investigating generator 7.17/useChrono and selecting shared-contract versus
Rust-only generation accordingly. It preserved authored Cargo versions/settings,
examples and guidance; required generated freshness plus format/check/test and
normal verification; and inspected independent release candidates/dependency
order. It did not claim unavailable tools passed. All four criteria pass.

The schema and OAuth agents accurately reported that the Windows pnpm launcher
could not canonicalize the workspace. Their equivalent read-only impact script
ran and described the existing MCP changes rather than attributing that impact
to hypothetical edits. No agent edited files, used real credentials, regenerated
artifacts, changed release policy, bumped versions or published. No failed case
required a guidance correction or rerun.
