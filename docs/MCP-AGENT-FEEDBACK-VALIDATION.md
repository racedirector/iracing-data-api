# MCP racing-intelligence feedback: validation for #560

## Scope and verdict

Supplement to [discovery spike #560](https://github.com/racedirector/iracing-data-api/issues/560),
not completion of its third-party capability inventory or authorization to implement
new tools. Research performed **2026-11-17–18 UTC** on `restack/pr-556`, base
`10d3f66e5fd61615623d1e7462bff97e5693de92`. Stay on this branch.

Findings and recommended research backlog were
[posted to the spike](https://github.com/racedirector/iracing-data-api/issues/560#issuecomment-6964792978).

**Verdict: confirmed MCP usability/capability gaps; Unable to verify part of the
upstream contract.** Several reported symptoms reproduce, but two proposed defect
diagnoses and the proposed position sentinel table need correction.

The working tree already contained test/transport fixes from the preceding task.
Additional concurrent edits appeared in runtime/auth/assets files during research;
they are not part of this documentation change. The connected MCP is a separately
running host: live observations establish that host's behavior, while source
inspection establishes this checkout's behavior. No claim of deployment parity.

No production code, schemas, package versions, generated artifacts, new issues,
or authentication implementation were changed for this investigation.

## Evidence and limits

- **Current official documentation:** authenticated
  [Data API `/data/doc`](https://members-ng.iracing.com/data/doc), retrieved
  `2026-11-17T23:58:37Z` and focused semantic review at `23:58:46Z` through the
  existing CLI/generated Fetch client. Default credential selection returned 401;
  explicitly selecting the documented MCP credential file succeeded. No new login.
- Structural comparator: documentation schema accepted; **74/74 routes matched,
  139 parameters**. Exit 2 reports five unrelated lookup-selector/spectator-array
  review candidates, not a clean whole-API compatibility verdict.
- **Live MCP:** authenticated identity, bounded May 2020/2024 participant searches,
  2023/2024 season searches, track filter comparison, reference lookup, resource
  and resource-template discovery, and one-entry recent-race lookup.
- **Live CLI:** materialized results for the subsession supplied in the feedback,
  its season schedule, current series collection, and a raw May 2020 search
  manifest. Outputs were summarized; credentials, signed links, raw result bodies,
  driver names and customer IDs are not included here.
- **Local deterministic checks:** source-specific schema parsing, internal Zod
  issue paths, and equal-row-count/different-byte-size response-budget examples.
  These establish local behavior, not current upstream support.
- No original transcript/call log was supplied. The claimed 50–60 calls per
  question, every original parameter combination, exact deployment revision,
  permission configuration, and historical result-count claims are unverified.
- No all-route live gate, full downloaded-payload schema audit, exhaustive
  historical scan, lap-data retrieval, or special-event archive inventory.

## Findings by feedback item

### F1 — Track search: supported for hosted, not official series

**Confirmed misleading discovery/error behavior; not evidence of a broken
upstream official-series track parameter.**

Current `/results/search_hosted/parameters` documents `track_id` and `car_id`;
`/results/search_series/parameters` documents neither. MCP
[SearchInput](../packages/mcp/src/tools/search-race-results/schema.ts) exposes a
single flat schema, then rejects both fields for `source: "series"`.

Reproduction with the same participant and
`2024-05-01T00:00:00Z`–`2024-06-01T00:00:00Z`:

- `source: "series", track_id: 191`: generic `INVALID_INPUT`.
- `source: "hosted", track_id: 191`: accepted, complete empty result.
  This verifies acceptance, not correctness of positive track filtering.
- Local schema rejection includes path `["track_id"]` and
  `Not supported for series search`, but
  [execution](../packages/mcp/src/execution.ts) discards those issues.
  The advertised field lacks a hosted-only description.

**Recommendation:** make source applicability discoverable and emit bounded,
allowlisted field/reason diagnostics without echoing arbitrary values. Research
official driver-at-track retrieval as bounded search plus deterministic filtering
or a verified alternate source. A dedicated track-history capability is a
candidate, not permission to forward an undocumented series parameter. Define
venue versus configuration: the current Daytona lookup has 13 configurations/
variants, including oval ID 191 and legacy oval ID 27.

**Additional input gap:** current official hosted-search notes require one of
`cust_id`, `team_id`, `host_cust_id`, or `session_name`, in addition to a date
scope. Local `SearchInput` accepts a hosted date-only request. Confirmed
docs/schema discrepancy; not live-probed in this review.

### F2 — Event identity and historical entity discovery

**Confirmed snapshot/discovery gap; “weekly series only” is too strong.**

Live `find_reference` returned zero matches for `Daytona`, `Daytona 500`,
`Indy 500`, and exact series IDs 247 and 411. Fresh CLI `/series/get` at
`2026-11-18T00:02:51Z` contained **162 entries**, included 207/229, excluded
247/411, and had no Daytona/Indy-500 name matches. Bounded May 2020 searches
nevertheless returned historical series IDs 247 and 411; the latter half of May
included rows naming 247 `iRacing.com Indy 500`.

This proves that the current series snapshot is not an exhaustive historical
series index. It does not establish that every entry is weekly, that omitted IDs
never existed, or that one series ID represents exactly one named event edition.
Resource discovery advertises no special-event catalog or dynamic schedule
resource. Exact keyword matching is not an event-name resolver.

The supplied subsession's detail is series 207, season 6081, race week 0.
Its upstream summary says `special_event_type: 0` /
`"Not a special event"`, while its schedule has Daytona Oval and
`race_lap_limit: 200`. **An upstream special-event flag is not a reliable
standalone classifier for the question “was this the Daytona 500?”**

**Recommendation:** separate historical series/season/week discovery from named
event-edition resolution. Research `/series/past_seasons`, `/series/seasons`,
`/series/season_list`, `/series/season_schedule`, and dated official event
announcements. A candidate event-edition model needs aliases, year, track/config,
schedule windows, series/season/week associations, splits, evidence and confidence.
Do not invent `iracing://special-events` or merge curated event names into the
upstream raw series resource without a supported source and explicit ownership.

### F3 — Race distance and positions: real projection gap, unsafe inference

**Confirmed missing MCP context; proposed universal sentinels are incorrect.**

[SearchRow](../packages/mcp/src/tools/search-race-results/schema.ts) includes
`laps_complete` but no scheduled lap/time limit, season ID/week, result status,
or special-event evidence. Unknown fields are stripped by its Zod projection.
This review did not establish whether every desired field exists in raw search
chunks; absence from MCP is not proof of upstream absence.

Live detail for supplied subsession **83546716**:

- Three simsessions (practice, qualifying, race); 37 result entries each.
- Main race `finish_position` begins **0, 1, 2**, all with 200 completed laps.
  The authenticated participant's position is 4, not evidence of an unclassified
  result. Preserve zero-based source semantics; do not label 0 “unclassified.”
- Main race uses `simsession_number: 0`; qualifying uses -1. These are session
  identifiers, not finish-position sentinels.
- Result entries include `reason_out` and `reason_out_id`; the summary includes
  completed race laps. Neither completed race laps nor participant laps is
  necessarily the scheduled distance.
- `/series/season_schedule?season_id=6081`, week 0, returned
  `race_lap_limit: 200`, `race_time_limit: null`, Daytona Oval ID 191.

**Recommendation:** retrieve authoritative detail and schedule together, retaining
source and meaning for **scheduled distance**, **event completed distance** and
**participant completed distance**. Do not classify a 49-lap participant as
“short format,” or turn 197+ completed laps into proof of event identity.
Document position bases and field-specific null/sentinel rules only after
verification. Test winners at position 0, DNFs, practice/qualifying, timed races,
multiclass/team results, and changed or missing schedules.

### F4 — Full-field subsession results

**Confirmed MCP capability gap with a verified upstream/CLI retrieval path.**

No current MCP tool accepts `subsession_id` to retrieve full results.
Official `/results/get` documents that parameter and authorization caveat;
the existing `iracing-data results` command retrieved all 37 entries in the
main simsession of the supplied subsession, not just the participant.

Search is session discovery with optional participation constraints, not an
authoritative full-field result endpoint. Omitting `cust_id` is not a substitute
for fetching a selected subsession.

**Recommendation:** prioritize bounded, typed subsession detail through an injected
domain capability. Include simsession selection, overall/class positions,
team/driver identity, result restrictions, status, units and provenance. Keep
optional licenses/private fields out by default. Page large fields independently.
Lap times are a separate documented `/results/lap_data` capability with
`simsession_number` and participant/team requirements; full results do not
automatically provide every driver's lap history. Lap retrieval was not tested.

### F5 — Chunking and response limits

**Confirmed response-budget/pagination mismatch, not broken upstream chunk zero.**

[completeResult](../packages/mcp/src/result.ts) enforces **64 KiB for the combined
JSON-text and structured result**, including both copies. The
[search adapter](../apps/iracing-data-mcp/src/adapters/race-search.ts) first fetches
a manifest and one whole upstream chunk. `chunk_index` defaults to 0, is removed
before the API request, and selects a returned chunk file. It cannot split a
chunk into smaller MCP pages. Every call reruns the search.

Live observations for the authenticated participant:

| Scope                                       | Outcome                                        |
| ------------------------------------------- | ---------------------------------------------- |
| May 2024, all event types                   | 56 rows, one chunk, complete                   |
| May 2024, `event_types: "5"`                | 25 rows, one chunk, complete                   |
| 2024 Q2, `event_types: "5"`, no `series_id` | 59 rows, one chunk, complete                   |
| May 2020, all event types                   | MCP `RESPONSE_LIMIT_EXCEEDED`                  |
| Same May 2020 scope, raw CLI manifest       | success; 83 rows, one chunk, `chunk_size: 500` |
| May 1–15 / May 15–June 1, 2020              | 42 / 41 rows, each one chunk, complete         |
| 2023 Q2, `event_types: "5"`, no `series_id` | MCP `RESPONSE_LIMIT_EXCEEDED`                  |

The error path loses manifest counts and has no continuation metadata.
Do not retry the identical oversized query with `chunk_index: 0`; that is already
the default. No such retry was performed here. Existing tests cover oversized
injected results and multi-chunk retrieval; local equal-count examples verify that
longer strings alone can change budget acceptance.

**Recommendation:** research bounded application pages **within** upstream chunks,
with explicit coverage and safe continuation, plus limit-stage/recovery metadata.
Specify stable ordering, concurrent updates, deduplication, expiry, request cost
and cancellation. Do not merely raise the cap, silently truncate, hide a bulk
scan, or promise stable cursors over rerun searches.

`season_year` plus `season_quarter` without `series_id` is accepted by both current
docs and MCP, and succeeded above. A quarter is not “May”; use explicit date
windows for calendar-month questions. Exact counts and causes for every original
2020–2023 request remain unverified.

### F6 — `session_name`

**Permission denial is not an API defect; the field is hosted-only.**

Current official hosted-search docs describe “Part or all of the session's name.”
MCP permits it for hosted and rejects it for series. No source-specific
description accompanies the flat advertised property. All 56 May 2024 series
rows in this check omitted `session_name`; that says nothing about hosted rows.

The reported `Permission.DeclinedError` is a host/client permission decision,
not evidence of upstream rejection, authentication failure or a broken filter.
The declined path was not retried or bypassed through CLI/another transport.

**Recommendation:** retain legitimate hosted filtering, clarify applicability,
separate host denials from tool errors, and validate hosted positive/negative
name-match behavior in a separately permitted case. Do not promise official
special-event name search or require optional names in every result.

### F7 — Driver participation index

**Confirmed absent from advertised MCP surfaces; feasibility remains unknown.**

Recent races is a bounded upstream window (at most ten), not career history.
One-entry live lookup returned `complete: false`; neither that flag nor a complete
recent window establishes lifetime coverage. No advertised resource/template or
tool exposes distinct historical driver × series × track × event combinations.

Current docs offer member career/yearly/summary/bests endpoints, but this review
did not verify that any provides the requested cross-dimensional index.
An aggregate endpoint must not be described as an index without payload evidence.

**Recommendation:** first support bounded participation summaries over demonstrably
complete retrieved windows. A durable cross-year index is a later host-owned
service/storage decision: initial backfill cost, refresh/watermarks, corrections,
privacy/access, event mappings, team attribution and retention need separate
research. One index read is cheap only after someone has paid for and validated
its construction. “No rows in this coverage” must never become “never raced.”

## Proposed additions to #560's capability catalog

Priorities are research recommendations, not delivery commitments. Status refers
to the current MCP surface; underlying CLI/API availability is separate.

| ID / priority / status                                             | Agent question and candidate ownership                                                                                         | Evidence, dependency and acceptance focus                                                                                                                                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RI-01 — Need-to-have / gap                                         | “Which filters work for official vs hosted races, and how do I correct this request?” Tool discovery + bounded diagnostics     | F1/F6; high confidence. Validate source-specific schemas and safe field errors before capability/network effects; enforce documented hosted search prerequisites.                                             |
| RI-02 — Need-to-have / gap                                         | “Who won this race, and what happened to my entry?” Injected subsession detail service + bounded tool                          | F3/F4; live retrieval verified, payload contract incomplete. Select simsession, preserve position basis, class/team identity, statuses, authorization, units and source IDs.                                  |
| RI-03 — Need-to-have / gap                                         | “Was my short finish in a scheduled 500-mile race?” Schedule/detail relationship service; provisional dynamic lookup           | F2/F3; one lap-limited case verified. Join season/week/config with provenance; handle timed races and changed/missing schedules without substituting completed laps.                                          |
| RI-04 — Need-to-have / existing + gap                              | “Show my races at this venue in this date range without losing results.” Existing search + byte-aware paging/filtering service | F1/F5; upstream chunks exist, MCP subpages do not. Distinguish configuration/venue, upstream vs local filters, scanned vs returned counts, full-query vs page coverage; test >64 KiB and multichunk recovery. |
| RI-05 — Need-to-have / gap + unknown                               | “Which edition of Daytona/Indy 500 did I run?” Historical series/season/week discovery, then evidence-backed event resolution  | F2; catalog omissions verified, event archive completeness unknown. Avoid parallel raw registries; distinguish current catalog availability, historical identity and curated event claims.                    |
| RI-06 — Need-to-have bounded; nice-to-have durable / gap + unknown | “Which tracks/series did I race, and how often?” Deterministic bounded summary; optional host-owned participation index        | F7; depends on RI-04/RI-05. Include counts, coverage, date ranges, event-definition versions and unknown partitions; validate totals against underlying subsessions.                                          |
| RI-07 — Nice-to-have / unknown                                     | “How did my lap pace compare with this field?” Separate lap retrieval/aggregation capability                                   | Docs confirm endpoint, no live lap case. Depends on RI-02; establish valid-lap filtering, units, authorization and sample completeness before comparisons.                                                    |

Won't-have in this slice: unbounded career dumps, undocumented upstream filters,
raw API escape hatches, speculative global sentinel tables, automatic large
backfills, inferred event identities, or a tool for every filter combination.

## Dependency order and first validation slice

1. **Immediate discovery/diagnostic research (RI-01):** source applicability and
   safe issue paths. No new tool needed; field/value leakage tests required.
2. **First thin retrieval slice (RI-02 + one RI-03 join):** take an already known
   subsession, fetch authorized main-race detail and its schedule, and produce a
   bounded source-linked answer showing winner, participant status, scheduled
   versus completed laps, and indexing. Verify at least a DNF and timed/multiclass
   counterexample before making a public contract. No career scan or event-name
   classifier. Candidate for a separate implementation-discovery issue.
3. **Byte-aware bounded history (RI-04):** reproduce one upstream chunk that exceeds
   the MCP budget, return recoverable subpages, prove deduplication/coverage across
   boundaries, and measure upstream requests versus agent tool calls.
4. **Historical identity then event editions (RI-05):** validate missing historical
   IDs and official event sources; only then define relationships and aliases.
5. **Summaries/index and pace (RI-06/07):** deterministic aggregation over verified
   coverage first; persistence and comparisons later.

For each separate research issue require: exact agent scenario; current official
endpoint/input evidence; positive/negative authorization cases; raw linked-payload
schema and units; entity relationships; bounded output and completeness semantics;
cost/cache/refresh ownership; failure recovery; synthetic fixtures plus scoped
live checks; go/no-go criteria. Do not file these issues automatically.

Measure calls, rows scanned/returned, empty/error calls by reason, bytes per page,
upstream requests, coverage achieved and unsupported assertions. Do not claim a
specific reduction from 60 calls without replaying a fixed, consented scenario.

## Verification and reproducibility

Executed current docs/comparator commands:

```sh
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs \
  --credentials .iracing-data/iracing-data-mcp/credentials.json \
  | node -r ts-node/register scripts/audit-data-docs.cjs -
```

Executed existing CLI/generated-client commands with the same explicit credential
selection: `series get`, `results --subsession-id 83546716`,
`series season-schedule --season-id 6081`, and `results-search-series` with the
authenticated participant, May 2020 begin/end, and `--response-only`.
Only counts/selected semantic fields were used in findings; no signed URL is a
durable source reference.

`pnpm --filter @iracing-data/mcp --filter @iracing-data/iracing-data-mcp test`:
core build/type fixtures and **46 tests passed**. Runtime build was blocked by
TS2345 in the concurrently edited `src/cli/commands/serve/schema.ts:55`
(`redirectUri` optionality in a Zod pipe). No runtime-test pass is claimed for this
research run, and that unrelated edit was not repaired or overwritten.

`pnpm exec prettier --check docs/MCP-AGENT-FEEDBACK-VALIDATION.md` and
`git diff --check` passed.

Prior full verification passed before this investigation/concurrent edits; it is
not evidence that today's changed tree passed. This report changes Markdown only;
no code generation is required. Full upstream compatibility, all original calls,
lap payloads, positive hosted name/track semantics and exhaustive historical event
coverage remain unverified.

### Spike context correction

GitHub PR status checked during this review: #553, #555, #554 and #561 are merged;
#556 and #558 remain open; #557 is closed without merging. #560's original
“unmerged ordered stack” paragraph is historical, not today's delivery state.
The resource/media capabilities observed here must not all be attributed to main.
