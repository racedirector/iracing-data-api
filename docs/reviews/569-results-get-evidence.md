# Issue 569 — `/results/get` evidence and bounded contract decision

Research record for the delivery gate described in #569, and the input to the
#589 implementation slice. Recorded on 2026-11-25 against the working tree
derived from `main` at `21a2429`. This is evidence plus a proposed contract, not
a public-surface change: no OpenAPI, generated client or MCP tool/resource
contract was modified by this record.

## Method

- Authenticated reference account. Credential ownership was re-established from
  `/data/member/info`, which returns a numeric `cust_id`, so the upstream
  identity behind the token is verifiable (see §7).
- Retrieval used the generated Fetch client `ResultsApi.getResults()` followed by
  the same safe link path as `readLinkedData()`: HTTPS only, no userinfo, no
  redirects, no credential forwarding, expiry checked before and after download.
- Three subsessions were captured: an individual oval race, a short road race and
  a 3-class team/endurance event. Raw captures contain signed links and real
  identities, so they remain outside the repository in the gitignored
  `.iracing-data/` directory. Committed fixtures are sanitized derivations (see
  Fixtures below).

| Role             | Subsession | Simsessions                                                | Field                          | Classes               | Wire bytes (pretty) | Compact bytes | Race-only projection |
| ---------------- | ---------- | ---------------------------------------------------------- | ------------------------------ | --------------------- | ------------------: | ------------: | -------------------: |
| Individual oval  | 90362454   | 3 (−2 practice, −1 qualify, 0 race)                        | 23 participants                | 1                     |             203,585 |       123,471 |               10,466 |
| Short road       | 90263135   | 3                                                          | 16 participants                | 1                     |             141,740 |        85,511 |                7,010 |
| Team / endurance | 88923308   | 3                                                          | 58 teams, up to 4 drivers each | 3 (GTP, P217, IMSA23) |           1,436,214 |       795,914 |               42,827 |
| League / heats   | 90221351   | 5 (−4 practice, −3 qualify, −2 heat, −1 warmup, 0 feature) | 28 participants                | 2                     |             396,632 |       238,731 |               12,844 |
| League / teams   | 87635897   | 3 (−2 practice, −1 qualify, 0 race)                        | 19 teams, up to 3 drivers each | 2 (GT3, GT4)          |             394,510 |       221,007 |               13,475 |

Each materialization is **two HTTP requests**: one `GET /data/results/get`
manifest and one download of the returned signed `link`. The manifest envelope is
`{link, expires}` at roughly 1.7 KB.

## Findings

### 1. Document identity and size

The downloaded document **is** the result object. It is not wrapped in a `data`
envelope, and there is no `simsessions` key.

Upstream returns **pretty-printed JSON**. The endurance capture is 1,436,214 wire
bytes but 795,914 bytes when compacted; the individual capture is 203,585 wire
bytes and 123,471 compact. Storage and byte budgets must therefore distinguish
wire bytes from stored/serialized bytes, and the canonical record should be
stored compact.

Root object size is 56–58 keys depending on event features (`alt_asset_id` and
`car_ruleset` appeared only on the endurance event). Nothing in the document
names a schema version or revision.

### 2. Required structure

Observed structure:

```text
{ subsession_id, ..., session_results: [
    { simsession_number, simsession_name, simsession_type, simsession_type_name,
      simsession_subtype, weather_result, results: [ ... ] } ] }
```

- `simsession_number`: `-2` practice, `-1` qualify, `0` race in the three
  official captures. League events add and renumber sessions (see §2.1), so the
  only stable rule is that the main event is the `0` entry.
- Individual entries carry `cust_id` (plus cosmetic `helmet`, `suit`, `livery`).
- Team entries carry `team_id` and nest participants in `driver_results[]`;
  nested drivers also carry `cust_id` and the parent `team_id`. The endurance
  capture had 58 outer team rows and 62 keys on nested drivers versus 58 on the
  team row (`division_name` and `helmet` are added by nesting).
- Team identifiers were negative (`team_id: -256040` and similar) for all 58
  entries, while individual captures had no `team_id` at all.
- `num_drivers` counts unique drivers, not entries: 158 for 58 official
  endurance teams, 39 for 19 league teams, and 19 for 19 individual rows.
- Practice and qualifying expose `finish_position` too, so position semantics are
  per-simsession, not race-only.

Only `subsession_id`, each `simsession_number` and each `results` array are
required by the documents actually observed. The remaining fields vary by event
shape and must stay optional and additive.

### 2.1 Hosted and league events

Two league captures (The Beer League season 17 heat format, FTR Events ARA
Endurance Series S8 team format) were compared against the official captures:

- League documents add root `league_id`, `league_name`, `league_season_id`,
  `league_season_name`, `host_id`, `session_name` and `restrict_results`, and
  **omit** `allowed_licenses` and `series_logo`. Root key count was 61 in both.
- `series_id` and `season_id` are **`0`**, with `series_name`/`season_name` set to
  `"Hosted iRacing"`. Zero is a valid hosted sentinel, not a missing value, so a
  positive-only series/season assertion is wrong for this document.
- `official_session` is `false` for league events versus `true` for official ones.
- `private_session_id` is a real positive identifier for league sessions
  (`5550282`, `5343950`), unlike `-1` on official sessions. A positive
  `private_session_id` is therefore **not** a restriction signal; use
  `restrict_results`/`results_restricted` instead.
- Session numbering is event-shaped. The heat-format league event had five
  simsessions: `-4` practice, `-3` qualify, `-2` heat 1, `-1` warmup, `0` feature.
  `heat_info_id` was populated (`238404`) there and `-1` for the non-heat event.
- Session naming and typing are not reliable discriminators: the league
  "qualify" session had `simsession_type` `5` where official qualifying used `4`,
  and both heats and the feature used type `6`. Use `simsession_number === 0` for
  the main event and treat the rest as an index.
- League result rows expose `league_points` and `league_agg_points`. The same keys
  also appear on official rows, so they are not league-exclusive.
- Team nesting is unchanged: the league team event had 19 team rows with up to
  three nested drivers, in two classes, with 0-based positions.

### 2.2 Heat racing, dirt oval and practice-only documents

Dirt oval and heat-format events were captured to test the shape of the session
tree. It does not reduce to a fixed set of sessions:

- Dirt Midget Cup heat events had five simsessions: `-5` practice, `-4` qualify,
  `-3` heat 1, `-2` heat 2, `0` feature, with field sizes differing per session
  (for example 15 / 15 / 8 / 7 / 15, and another split with 18 / 18 / 9 / 9 / 6 /
  16 including a `CONSOLATION` at `-1`).
- The 2023 Chili Bowl special-event week reused the same tree (`PRACTICE`,
  `QUALIFY`, `HEAT 1`, `HEAT 2`, `FEATURE`) with a populated `heat_info_id`.
- A single subsession can be **practice only**: `event_type: 2` (`"Practice"`)
  with one `simsession_number: 0` session named `PRACTICE` and a populated
  `heat_info_id`. Therefore `simsession_number === 0` does **not** imply a race;
  the root `event_type`/`event_type_name` and the session's own name must be
  projected, and the resource must not label a practice session as a race.
- Session names are free-form labels (`HEAT 1`, `WARMUP`, `CONSOLATION`,
  `FEATURE`, `RACE`) and `simsession_type` is not consistent across event kinds
  (official qualify `4`, league qualify `5`, heats and features `6`).
- Season metadata exposes a format flag rather than requiring name parsing:
  `is_heat_racing` was `true` for 15 of 163 current series, spanning dirt oval,
  dirt road and even a formula-car series. Category or series-name checks are
  therefore not a substitute for the flag or for the document's own session tree.
- Heat racing also implies a different field size per session, so any projection
  that assumes one participant count for the document is wrong. The session index
  must carry each session's own count.

### 3. Position, class and status semantics

- `finish_position`, `position` and `finish_position_in_class` are **0-based**.
  In all three captures `position` equaled `finish_position` on every row
  (58/58, 23/23, 16/16), and the race winner was position `0`.
- Overall and in-class positions are independent: the endurance event had 0–57
  overall and separate 0-based ranges per class (GTP 0–16, P217 0–11, IMSA23
  0–28).
- `starting_position` uses `-1` as a sentinel outside race sessions. Validation
  must not require a nonnegative grid position.
- Status is expressed by `reason_out`/`reason_out_id`, with no boolean `dnf`,
  `disconnected` or `status` field. Observed values: `Running`/`0`,
  `Disqualified`/`29` and `Disconnected`/`32`. Of the 58 endurance teams, 24 were
  `Disconnected`, and their `finish_position` values were still ordinary final
  positions. The value set is extensible; do not enumerate it in validation.

### 4. Distance semantics

- `event_laps_complete`, `race_summary.laps_complete` and the winner's
  `laps_complete` agreed exactly (494 for the endurance event, 18 for the oval
  race). They describe **completed** distance.
- Participant `laps_complete`, `laps_lead` and `opt_laps_complete` describe
  participant-completed distance.
- **The document contains no scheduled distance.** `limit_minutes` was `10080`
  (seven days) for both a 494-lap endurance race and an 18-lap oval race, so it is
  not a race duration and must not be interpreted as one.
- Scheduled distance is available from season metadata instead. A current-season
  schedule week carries `race_lap_limit` and `race_time_limit` (Dirt Midget Cup
  2026 S4: 30 laps **and** 25 minutes for every week), alongside `track`,
  `start_type`, `full_course_cautions`, `restart_type` and `weather`. Join
  `series_id` + `season_id` (season) + `race_week_num` (result root) to the
  schedule. Both limits can apply, so a single "scheduled laps" number is not
  always meaningful.
- Hosted and league documents have `series_id: 0` and `season_id: 0`; they have no
  schedule row, so scheduled distance is **unavailable**, not zero.
- `special_event_type` is inconsistent inside the result document: root `-1` while
  `race_summary.special_event_type` was `0` with text `"Not a special event"` for
  the endurance capture. The authoritative classification for official events is
  the schedule week's `special_event_type`; do not derive it from the result root.

### 5. `include_licenses`

The generated client does serialize the parameter
(`/data/results/get?subsession_id=…&include_licenses=true`), and the flag was
tested on all three subsessions.

- Every pair of documents was **byte-identical**: the same SHA-256 for
  `include_licenses=false` and `true` on the individual, short-road and endurance
  captures.
- Neither variant contained participant `license`, `license_level`,
  `license_string` or `club_*` fields.
- `license_change_oval`, `license_change_road`, `old_license_level`,
  `new_license_level` and similar progression fields are present **regardless**
  of the flag, so `false` does not remove license-bearing data; it simply adds
  nothing on these captures.

Decision: fix `include_licenses: false` for the first slice. Because no observed
document differs, no variant-aware cache key is needed. This is observed
behaviour, not an upstream guarantee; a future capture that differs reopens the
question rather than silently sharing one cache entry.

### 6. Authorization behaviour

| Case                                   | Result                                             |
| -------------------------------------- | -------------------------------------------------- |
| Invalid bearer token, valid subsession | `401` at the manifest; no signed download occurred |
| Valid token, unknown subsession        | `404` at the manifest                              |
| Valid token, `subsession_id=0`         | `400` at the manifest                              |

The generated client surfaces these as a generic `"Response returned an error
code"` with the HTTP status on the response object; no upstream error body was
propagated. A `0` identifier is rejected upstream with `400`, so a resource
template that accepts `0` would produce a wasted authenticated call; explicit
positive-integer validation is required before resolution.

A prior authorized fetch **cannot** re-verify entitlement locally. A cache hit is
authorized by the verified credential-owner binding plus the local single-owner
policy, not by a per-read upstream check. `403` and genuinely restricted results
(`results_restricted: true` or `restrict_results: true`) were not observed, so
their handling remains unproven. Note that a positive `private_session_id` is
normal for league sessions and is not itself a restriction signal (§2.1).

### 7. Credential-owner / upstream-identity binding

`/data/member/info` returns a numeric `cust_id` and `display_name` in a 13.5 KB
compact document (two HTTP requests). `createDriverQueries().getCurrent()` already
projects exactly `{ cust_id, display_name }` through `readLinkedData()`, so the
binding can be established once per credential lifecycle without adding an
identity request to each cached read. Access-token values must never become cache
keys.

### 8. Bounded projection and byte budget

A deliberately allowlisted projection was measured against the captures:

| Capture          | All 3 simsessions | Main event (`simsession_number = 0`) | Session summary |
| ---------------- | ----------------: | -----------------------------------: | --------------: |
| Individual oval  |            29,584 |                               10,466 |             943 |
| Short road       |            19,473 |                                7,010 |             947 |
| Team / endurance |           107,736 |                               42,827 |             963 |
| League / heats   |                 — |                               12,844 |               — |
| League / teams   |                 — |                               13,475 |               — |

The all-session projection of the endurance event exceeds a 64 KiB budget; the
race-only projection is 65% of it. Decision: a **65,536-byte UTF-8 cap**, project
the main-event simsession in full plus a small index of all simsessions, and if it
still exceeds the cap return an explicit summary projection carrying
`oversized: true` and the participant counts instead of a truncated field. Byte
accounting uses UTF-8 bytes of the serialized projection, not JavaScript string
length. Because a main event can be a practice session (§2.2), the projection must
carry the root `event_type`/`event_type_name` and the session's own name rather
than a hard-coded "race" label.

### 9. Freshness

Completed results are amendable upstream (iRacing publishes amended results after
protests and penalties), and the document carries no revision or amendment
marker, so immutability cannot be assumed. Proposed default for the first slice:
**24-hour revalidation**, configurable by the host. A fresh record serves without
an upstream result request; expiry triggers revalidation; a failed refresh is an
explicit error, never stale-on-error. Corrupt or unsupported-schema records fail
closed. Signed links are never part of freshness: only the downloaded document is
stored.

### 10. Canonical record and SQLite storage anatomy

Per verified owner scope and subsession, the store should hold:

- the complete validated document as **compact JSON** — not the bounded
  projection, not the signed link, not request headers or credentials;
- provenance: source path (`/data/results/get`), schema version, `fetched_at`,
  stored byte length and content hash;
- only verified derived columns: `subsession_id`, `series_id`, `season_id`,
  `race_week_num`, `track_id`, `event_type`, `official_session`, `start_time`.

Measured compact sizes were 85 KB (16 drivers) to 796 KB (58 teams). Because
upstream pretty-prints, wire size is roughly 1.8x the compact document. The
delivered projection is 7–43 KB, so the stored document can cost about 20x the
response at the top end.

Size is driven by sessions × entries × nested drivers, not by field values: the
endurance capture held 158 unique drivers across 58 teams. That is the number to
watch for write latency, because `node:sqlite` is synchronous and JSON
parse/validate/stringify of a 796 KB document dominates a write; cache hits should
not re-parse the document if the projection can be derived at write time or stored
alongside it. Never hold a transaction across the network fetch.

Pruning needs evidence, not guesses. Minimum signals to capture at write time:
stored bytes, `fetched_at`, optional `last_read_at` (cheap, and the only way to do
LRU rather than age/size eviction), and revalidation outcome. Questions to answer
from real stored data rather than this small sample: p50/p95/max compact size,
share of documents above 256 KB, amendment frequency observed on revalidation, and
whether projections ever exceed the 64 KiB cap in practice.

## Not proven here

- `403` responses, restricted/private results, and subscription-entitlement
  failures.
- Whether `include_licenses` differs for accounts or sessions other than these
  three.
- The stability of negative `team_id` values across older events, and the
  mutation rate of amended results.
- Documents larger than the 1.44 MB capture, and hosted multi-tenant entitlement
  or revocation.
- The exact iRacing Chili Bowl special-event race the reference member entered was
  not located: only a practice subsession at the venue was returned by result
  search. The heat tree observed in special-event week and Dirt Midget Cup races is
  representative, but an A/B/C-main tree was not captured.
- Whether every heat-format series publishes `is_heat_racing` for league seasons;
  league season records did not expose the same format flags.
- Any client-side resource dereference behaviour; that is a Phase 3 wire check.

## Fixtures

Sanitized, deterministic fixtures are committed at
`apps/iracing-data-mcp/test/fixtures/results/`:

- `individual.json` — individual oval race, 8 participants, 3 simsessions,
  positions `0…6` plus a `21` disconnected entry.
- `team-multiclass.json` — 6 teams across 3 classes, nested `driver_results`,
  negative team IDs, non-contiguous positions, one disconnected team.
- `timed-partial.json` — 5 participants with partial distance, a `Disqualified`
  and a `Disconnected` entry.
- `league-team.json` — 6 league teams in 2 classes with `league_*` root fields, a
  positive `private_session_id`, `series_id: 0` and `official_session: false`.
- `league-heats.json` — 5-session heat format (`-4…0`) with `HEAT 1`, `WARMUP` and
  a populated `heat_info_id`.
- `dirt-heats.json` — dirt oval heat format (`-5…0`) with two heats and a
  populated `heat_info_id`.
- `practice-only.json` — `event_type: 2` with a single `simsession_number: 0`
  session named `PRACTICE`, proving the main event is not necessarily a race.

Identities (names, `cust_id`, `team_id`, paint numbers) were replaced with
synthetic values; car/track/series/class identifiers are retained so the fixtures
still join the catalog resources. Participant lists are trimmed and `num_drivers`
is adjusted to the trimmed field so the fixture is internally consistent. Fixtures
are test inputs derived from the captures, not evidence of the current upstream
contract.

`apps/iracing-data-mcp/test/results-fixtures.test.cjs` locks the fixture set,
session trees, 0-based positions, league/practice fields, `num_drivers`
consistency, sanitization and per-file size, so the record cannot drift silently
from the committed data.

## Consequences for #589

- Authored payload validation needs loose objects at root, simsession, result,
  team and driver level; it must not require the 50+ optional observed fields.
- No OpenAPI or generated-client change is implied: the modeled response remains
  the generic link envelope.
- The resource surface stays a single `iracing://results/{subsession_id}`
  template; session/participant subresources are a later decision.
- Zero-based positions and `-1` starting-position sentinels must survive the
  bounded projection unchanged; DNF state must be projected as `reason_out`, not
  invented as a boolean.
- Protocol and concrete event shape must stay separate. The protocol guarantees
  are: `session_results[]` of ordered sessions, a main event at
  `simsession_number: 0`, per-session result arrays, 0-based positions,
  `reason_out` status and a root `event_type`. Everything else — session count,
  numbering range, names, `simsession_type` values, field size per session, team
  nesting, league fields, heat identifiers — is concrete event data and must be
  handled generically rather than assumed.
- Scheduled distance and special-event classification come from the season
  schedule (`race_lap_limit`, `race_time_limit`, `special_event_type`), joined via
  root `series_id` + `season_id` + `race_week_num`. They must not be inferred from
  the result document, and are unavailable for `series_id: 0` hosted/league
  documents.
- The main event is not necessarily a race: practice-only subsessions also expose
  `simsession_number: 0`. Project the root `event_type` and the session's own name,
  and do not label the document a race by assumption.
