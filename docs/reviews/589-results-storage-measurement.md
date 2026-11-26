# 589 result storage measurements — Phase 1

Recorded on 2026-11-25 on the `feat/589-result-store` working tree (base
`docs/569-results-evidence` at `9d4ae19`). Measurements are from one macOS
development host on Node `v24.22.1`; they describe this host, not upstream
behavior or a service-level target.

Phase 1 stores a complete canonical document plus a derived bounded projection and
pruning signals. Automatic pruning and eviction are **not** implemented, and no
threshold is chosen here.

## Committed fixtures

`apps/iracing-data-mcp/test/fixtures/results/` — sanitized structural fixtures,
not additional upstream samples.

| Fixture           | Sessions | Main-event entries | Canonical document bytes | Projection bytes | Oversized |
| ----------------- | -------: | -----------------: | -----------------------: | ---------------: | --------- |
| `individual`      |        3 |                  8 |                   46,136 |            7,613 | no        |
| `team-multiclass` |        3 |                  6 |                   93,027 |            7,212 | no        |
| `timed-partial`   |        3 |                  5 |                   30,008 |            5,239 | no        |
| `league-team`     |        3 |                  6 |                   78,649 |            7,061 | no        |
| `league-heats`    |        5 |                  8 |                   73,098 |            7,869 | no        |
| `dirt-heats`      |        5 |                  6 |                   54,478 |            6,352 | no        |
| `practice-only`   |        1 |                  6 |                   12,843 |            5,518 | no        |

All seven projections are normal (not summary) responses. Their canonical
documents are 6.9x–13.7x the projection size.

## Synthetic synchronous-work bound

A sanitized document was grown from `team-multiclass` until it approximated the
largest captured document. It is explicitly synthetic: 60 teams, 3 sessions,
874,353 canonical bytes, 57,802 projection bytes.

| Step                                   | Median |    Min |    Max |
| -------------------------------------- | -----: | -----: | -----: |
| Parse + validate (`zod`)               | 3.1 ms | 1.7 ms | 6.7 ms |
| Canonicalize + serialize + SHA-256     | 5.4 ms | 5.2 ms | 7.4 ms |
| Build bounded projection               | 0.9 ms | 0.7 ms | 4.8 ms |
| SQLite write (upsert transaction)      | 6.8 ms | 6.2 ms | 8.7 ms |
| Fresh read (verify + parse projection) | 0.7 ms | 0.7 ms | 0.9 ms |

Five repetitions per step, on the same process. The write path includes the
canonicalization and hashing done by the store; the read path verifies versions,
byte counts and both hashes and parses only the small projection, not the
canonical document.

At this size a fresh read is roughly one tenth of a write. The synthetic document
is below the defensive 2 MiB canonical ceiling and produced a normal projection,
so it does not exercise the summary fallback; that fallback is covered by unit
tests with repeated rows.

## Signals captured in SQLite

Schema version 1 stores:

- Provenance: `source_path`, `schema_version`, `projection_version`, `fetched_at`,
  `revalidate_after`, `document_bytes`, `document_hash`, `projection_bytes`,
  `projection_hash`, `projection_oversized`.
- Verified derived metadata: `series_id`, `season_id`, `race_week_num`, `track_id`,
  `event_type`, `official_session`, `start_time`.
- Pruning and revalidation signals: `last_read_at`, `last_revalidation_at`,
  `last_revalidation_outcome`, `last_amended_at`, `revalidation_count`,
  `amendment_count`.
- Payloads: `document_json` (canonical compact JSON) and `projection_json`.

There are no participant, team, session, series, track or `last_read_at` indexes in
version 1. Measurement scans are acceptable at this scale.

## Decision

**No automatic pruning or eviction yet; insufficient data.** The seven fixtures
and one synthetic document cannot establish a real size distribution, an amendment
rate, or a useful retention threshold. The 24-hour revalidation interval is a
freshness policy only; it does **not** delete records and is not evidence of how
often results are amended.

Thresholds will be chosen only after the operational sample described in the
delivery plan (at least 30 distinct owner-scoped subsessions, 30 completed
revalidations, and seven days of ordinary reference-host use). Until then the
captured signals accumulate and no record is removed automatically.

Open questions for that review: p50/p95/max canonical size, share above 256 KiB,
projection size and oversized rate, write and fresh-hit latency at scale,
observed amendment rate from canonical hash changes, `last_read_at` age
distribution, and whether storing the derived projection is justified by the
avoided parse time.

## Not claimed

- This is not an upstream size distribution; the synthetic document is synthetic.
- No latency SLO is implied by these numbers.
- No hosted multi-tenant entitlement, revocation or shared-store behavior is
  measured.
- No live `/results/get` call occurs in Phase 1.
