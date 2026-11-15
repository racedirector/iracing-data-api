# iracing-data CLI

`apps/iracing-data-cli` is this repository's private Commander-based `iracing-data` CLI. `iracing-data auth login` obtains iRacing OAuth tokens with the browser Authorization Code flow; `iracing-data docs` fetches authenticated Data API documentation, `iracing-data assets` materializes runtime asset metadata, and `iracing-data whoami` checks the active profile. This is private repository tooling.

The CLI exposes all 69 maintained runtime Data API GET routes through generated
clients, with script-safe JSON output and offline OpenAPI dispatch coverage.
See [the compatibility-maintenance report](COMPATIBILITY.md) for live validation,
contract repairs, regeneration, and limitations.

## Fetch constants

```bash
pnpm iracing-data constants categories
pnpm iracing-data constants divisions
pnpm iracing-data constants event-types
```

Each command makes one authenticated API request and writes the direct JSON array
to stdout. Constants do not use cache-link downloads. Shared credential options
work before or after the subcommand; omitted options retain normal credential
precedence. The existing canonical constants schema preserves additional row fields.

For iterative development, keep the CLI and its TypeScript dependencies rebuilding:

```bash
pnpm exec tsc --build apps/iracing-data-cli/tsconfig.build.json --watch --preserveWatchOutput
```

Run `pnpm iracing-data <command>` from another terminal against that watched build.
Rebuild/regenerate OpenAPI and SDK output explicitly when changing contracts;
TypeScript watch does not run code generation.

## Discover lookup data

```bash
pnpm iracing-data lookup current-season
pnpm iracing-data lookup countries
pnpm iracing-data lookup flairs
pnpm iracing-data lookup licenses
pnpm iracing-data lookup drivers --search-term "Example" --league-id 6529
pnpm iracing-data lookup get --weather weather_wind_speed_units weather_wind_speed_max --licenselevels licenselevels
```

Each leaf validates canonical parameters, calls the generated Fetch client, and
materializes the returned HTTPS cache link without forwarding credentials.
`get` accepts multiple weather or license-level lookup selectors; the API receives
repeated query keys, not a comma-separated string. Without selectors the API may
return an empty document. Results remain unmodified JSON on stdout.

## Fetch results

```bash
pnpm iracing-data results --subsession-id 123456789 --include-licenses
pnpm iracing-data results --subsession-id 123456789 --include-licenses false > results.json
```

The command validates query flags with `@iracing-data/api-schema`, requests
`/data/results/get`, follows the HTTPS cache link without forwarding credentials,
and writes the downloaded JSON to stdout. Omit `--include-licenses` to use the API
default. Use global `--credentials <path>` or `IRACING_ACCESS_TOKEN` for authentication.

## Fetch league API documents

```bash
pnpm iracing-data league get --league-id 6529
pnpm iracing-data league roster --league-id 6529 --include-licenses
pnpm iracing-data league seasons --league-id 6529 --retired false
pnpm iracing-data league sessions --league-id 6529 --season-id 123 --results-only
pnpm iracing-data league standings --league-id 6529 --season-id 123
pnpm iracing-data league points-systems --league-id 6529 --season-id 123
pnpm iracing-data league membership --include-league
pnpm iracing-data league directory --search "racing" --restrict-to-recruiting
pnpm iracing-data league customer-sessions --mine
```

Each subcommand validates flags using the canonical API request schema and writes
the downloaded JSON to stdout. Boolean flags accept an optional `true` or `false`;
omitted flags retain upstream defaults. Use `league <subcommand> --help` for all
filters. Global credential flags work before or after subcommands. Bearer tokens
are sent only to the API, not the returned HTTPS cache URL. Unlike `league-history`,
these commands make one API request and one cache download without capturing files.

The roster endpoint returns a `league_roster` metadata envelope, not the standard
`link` envelope. Its canonical schema and generated SDK expose `data_url`; the
CLI validates the response and follows that URL when `data.success` is true.

## Fetch team API documents

```bash
pnpm iracing-data team get --team-id 12345
pnpm iracing-data team get --team-id 12345 --include-licenses false
pnpm iracing-data team membership
```

`get` requires a team ID; `--include-licenses` accepts an optional `true` or
`false`, with omission retaining the API default. `membership` fetches the
authenticated member's teams. Both commands write downloaded JSON to stdout,
support global credential options before or after subcommands, and never forward
the bearer token to the returned HTTPS cache URL.

## Hosted and scheduled league sessions

```bash
# Joinable sessions plus your pending non-league sessions
pnpm iracing-data hosted combined-sessions
pnpm iracing-data hosted combined-sessions --package-id 123

# Currently driver-joinable sessions only
pnpm iracing-data hosted sessions

# League sessions available to your account, or only those you created
pnpm iracing-data league customer-sessions
pnpm iracing-data league customer-sessions --mine
pnpm iracing-data league customer-sessions --mine false --package-id 123

# A particular league season's sessions, including those without results
pnpm iracing-data league sessions --league-id 6529 --season-id 123
```

`hosted combined-sessions` maps to `/data/hosted/combined_sessions`, which
includes driver/spectator-joinable sessions and the authenticated user's pending
non-league sessions. `hosted sessions` maps to `/data/hosted/sessions`, which
excludes spectator-only and pending non-league sessions. Only the combined
endpoint accepts a car/track package filter; neither has a league-ID or `mine`
filter in the maintained API contract.

For league scheduling use the existing league endpoints above. `--mine` selects
sessions created by you; omit it to retain the API default. For a season schedule,
omit `--results-only` (or pass `--results-only false`) so sessions without results
are not excluded. These are endpoint views, not a synthesized upcoming-only list:
returned sessions are preserved without local date filtering or merging.

All commands write JSON to stdout and accept the shared credential options.
Bearer credentials are sent only to the API, never the returned HTTPS cache URL.

## Import-support data

### Opt-in contract-shape checks

Build the CLI and mapping helper before running any live case:

```bash
pnpm --filter '@iracing-data/cli...' --filter '@iracing-data/api-schema-to-openapi...' build
```

The all-route gate derives every runtime Data API GET route from
`openapi/iracing.json`, runs the corresponding CLI command through an injected
transport, and validates the **raw wire response** with that route's canonical
Zod schema before decoder normalization. It never follows `link`, `data_url`,
chunks, or CSV payloads. Supply reviewed inputs privately:

```bash
IRACING_LIVE_INPUTS=/path/to/private-inputs.json \
IRACING_CREDENTIALS=.iracing-data/credentials.json \
  pnpm --filter @iracing-data/cli test:live:all --run
```

`IRACING_LIVE_INPUTS` accepts a JSON document with shared `inputs` and optional
per-route `routes` overrides. `IRACING_LIVE_DELAY_MS` spaces requests serially.
Without `--run` no requests are made and the result is `NOT_RUN`. Output is a
sanitized PASS / CONTRACT_MISMATCH / BLOCKED / NOT_RUN record naming the route,
schema symbol, and field paths only. Missing required inputs, authentication
failure, and access/rate limits are not passes; a single `NOT_RUN` route prevents
a full `Compatible` verdict. Reauthenticate explicitly after a 401 before rerunning.

A scoped hosted-search case remains available for a quick single-endpoint check:

```bash
IRACING_LIVE_HOSTED_QUERY='{"start_range_begin":"2023-10-08T00:00:00Z","start_range_end":"2023-10-11T00:00:00Z","session_name":"FTR","track_id":192}' \
  pnpm --filter @iracing-data/cli test:live --run
```

Use reviewed bounded selectors in `IRACING_LIVE_HOSTED_QUERY`, and optionally
`IRACING_CREDENTIALS` for an explicit credential file. It performs one docs/auth
preflight and one response-only search, checks HTTP/JSON content type and
canonical raw-response acceptance, and emits a sanitized result. It never
downloads chunks or retries. Neither live gate proves filter semantics, and
`pnpm verify` remains offline. See the living
[reconciliation log](../../docs/DATA-API-RECONCILIATION.md) and the
[compatibility report](COMPATIBILITY.md) for current results and repair history.

### Commands

```bash
pnpm iracing-data results-search-hosted --league-id 6529 --league-season-id 123 --start-range-begin 2026-01-01T00:00:00Z --start-range-end 2026-04-01T00:00:00Z
pnpm iracing-data results-search-hosted --team-id 12345 --session-name "Endurance"
pnpm iracing-data member get --cust-ids 123,456 --include-licenses
pnpm iracing-data metadata car
pnpm iracing-data metadata car-class
pnpm iracing-data metadata track
```

Additional member documents are available through the same group:

```bash
pnpm iracing-data member info
pnpm iracing-data member profile --cust-id 123
pnpm iracing-data member awards
pnpm iracing-data member award-instances --award-id 88
pnpm iracing-data member chart-data --category-id 1 --chart-type 1
pnpm iracing-data member participation-credits
```

Omitting an optional customer ID selects the authenticated member. `info` and
`participation-credits` always refer to your account. Awards and award instances
use typed metadata envelopes with `data_url`; other member documents use
`link` envelopes. Downloads never receive bearer credentials.

Member, metadata, and hosted-search leaves accept `--response-only` to emit the
modeled wire JSON without following cache URLs. This is useful for contract
inspection and preserves unmodeled response fields. These responses can contain
short-lived signed URLs: treat the output as sensitive and do not publish it.

These commands validate canonical API parameters, download an HTTPS cache document
without credentials only when a `link` is returned, and otherwise write the inline
JSON document unchanged to stdout. Failures identify the request, decoding, or
cache-processing stage rather than assuming an authentication problem. Global credential
options work before or after commands. Metadata commands retrieve the complete
reference lists, not asset images. Member lookup accepts a comma-separated ID list;
license inclusion accepts an optional `true` or `false`.

Hosted search supports start/finish date bounds, participant/team/host IDs, league
and league-season IDs, session name, car, track, and category IDs. A team ID takes
precedence over a participant customer ID. Date end bounds are exclusive; supply
explicit bounds for historical backfills (see `results-search-hosted --help`).
The search command preserves the returned document and does **not** expand nested
chunk references or fetch individual race results. Feed discovered subsession IDs
to the existing `results --subsession-id` command.

## Use locally from another project

Build this checkout and its workspace dependencies first:

```bash
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/cli...' build
```

Then, from the consuming project:

```bash
pnpm link /absolute/path/to/iracing-data-api/apps/iracing-data-cli
pnpm exec iracing-data results --subsession-id 123456789 --credentials /absolute/path/to/credentials.json
```

Keep this checkout available: the local link uses its built files and workspace
dependencies. Rebuild after source changes. This private workspace package is not
a standalone npm release; copying its directory or installing a packed tarball
does not include its workspace dependencies. The executable does not load `.env`
automatically; export environment variables or pass flags. Prefer an explicit
credential path when scripting outside this repository.

## Configure an iRacing OAuth client

Treat iRacing's OAuth documentation as authoritative for current registration availability and requirements:

- [Client registration](https://oauth.iracing.com/oauth2/book/client_registration.html)
- [Client types](https://oauth.iracing.com/oauth2/book/client_types_overview.html)
- [Data API workflow](https://oauth.iracing.com/oauth2/book/data_api_workflow.html)
- [`/authorize` endpoint](https://oauth.iracing.com/oauth2/book/authorize_endpoint.html)
- [`/token` endpoint](https://oauth.iracing.com/oauth2/book/token_endpoint.html)

The registration page may state that creation of new OAuth client IDs is paused. Do not assume registration is currently available; follow the upstream page and iRacing release/forum guidance.

Configure the client used by this CLI for the Data API with:

```text
Audience: data-server
Registered redirect URI: http://127.0.0.1:0/oauth/iracing/callback
Default requested scopes: iracing.auth iracing.profile
```

The default login requests both `iracing.auth` and `iracing.profile`. `iracing-data auth login --scope iracing.auth` is the least-privilege bootstrap for `iracing-data-mcp`; it requests only Data API authorization and intentionally does not grant profile access.

Register the default HTTP loopback callback above, or set
`IRACING_AUTH_REDIRECT_URI` to a different HTTP IPv4/IPv6 loopback URI already
registered for your client. Use port `0` only for a registered native-app URI.
Hosted HTTPS callbacks need a web application. See the [callback owner](src/authenticate.ts)
for listener, redirect and cleanup behavior, and [iRacing redirect URI rules](https://oauth.iracing.com/oauth2/book/redirect_uris_overview.html).

If the authorization page rejects the URL, verify the client ID and registered callback URI with iRacing; changing the local configuration does not register a URI. If a fixed callback port is occupied, stop its listener or configure another URI already registered for the client. Public clients are not issued a secret; confidential clients may be issued one. If iRacing issued a client secret, the token exchange must use it.

## Configure the local environment

Authentication options are declared globally on the program using Commander's
environment bindings. They work before or after the subcommand:

| Global option     | Environment                 |
| ----------------- | --------------------------- |
| `--access-token`  | `IRACING_ACCESS_TOKEN`      |
| `--credentials`   | `IRACING_CREDENTIALS`       |
| `--client-id`     | `IRACING_AUTH_CLIENT`       |
| `--client-secret` | `IRACING_AUTH_SECRET`       |
| `--redirect-uri`  | `IRACING_AUTH_REDIRECT_URI` |
| `--username`      | `IRACING_AUTH_USERNAME`     |
| `--password`      | `IRACING_AUTH_PASSWORD`     |

All except `--credentials` are hidden from help. Prefer environment variables for
secrets: command-line values can appear in shell history or process listings.
Explicit flags override environment values. A command-local option overrides
the corresponding inherited value through the shared option reader; command
definitions do not need to repeat the environment bindings.

API commands receive only the token and credential path, never OAuth account
secrets. `auth login` uses registration/account inputs; its credential path is
the document to update, while API commands read from that path.

From the repository root:

```bash
cp apps/iracing-data-cli/.env.example .env
```

If a root `.env` already exists, add the following values to it instead of replacing it. Fill in the local file:

```dotenv
IRACING_AUTH_CLIENT=<client-id>
IRACING_AUTH_SECRET=<secret-if-issued>
IRACING_AUTH_REDIRECT_URI=http://127.0.0.1:0/oauth/iracing/callback
```

`IRACING_AUTH_CLIENT` is required. `IRACING_AUTH_SECRET` is optional only when iRacing did not issue a secret for the registered client. Do not commit `.env`, client secrets, access tokens, refresh tokens, or generated credential files.

## Build and run locally

Install the repository dependencies first, then build the app:

```bash
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/cli...' build
```

Run from the repository root; the root script loads the root `.env` and forwards command arguments:

```bash
pnpm run iracing-data auth login
pnpm run iracing-data auth login --scope iracing.auth
pnpm run iracing-data auth login --output ./credentials.json
pnpm run iracing-data auth login --output ./credentials.yaml
```

Existing shell environment variables take precedence over `.env` values. `pnpm exec iracing-data` invokes the bin directly and does not load `.env`. After editing CLI source, rebuild before running the root script.

Alternatively, create `apps/iracing-data-cli/.env` from the app's `.env.example` and run from the app directory so its `.env` file is loaded by the app's `start` script:

```bash
cd apps/iracing-data-cli
pnpm start -- auth login
pnpm start -- auth login --scope iracing.auth
pnpm start -- auth login --output ./credentials.json
pnpm start -- auth login --output ./credentials.yaml
```

Useful flags:

```text
-o, --output <path>       Write tokens to an alternate file
--credentials <path>      Override the shared credential file to update
--scope <scopes...>       Use iracing.auth, or iracing.auth iracing.profile
--format <json|yaml>      Override serialization format
--force                   Replace an existing output file
--no-open                 Print the authorization URL instead of opening a browser
--timeout-seconds <n>     Callback timeout in seconds; default: 300
```

Only two scope selections are supported: `iracing.auth` and `iracing.auth iracing.profile`. The latter is the default. Other scope names, profile-only login, or another ordering are rejected rather than passed through to the OAuth provider.

Explicit `--format` wins. Otherwise `.yaml` and `.yml` paths select YAML; all other paths default to JSON. Keep the default `.json` credential files in JSON so consumers can read them.

## Output and credential security

By default, `auth login` atomically updates `.iracing-data/credentials.json` at the repository root. The directory is ignored by Git. An auth-only login with `--scope iracing.auth` instead targets `.iracing-data/iracing-data-mcp/credentials.json` so the MCP can own and refresh a distinct least-privilege credential lifecycle. Do not copy one refresh credential into both files or otherwise make independently refreshing consumers share the same rotating refresh token.

Successful stdout is empty; diagnostics go to stderr. CLI diagnostics use `pino-pretty`, with colors only when stderr is a terminal; command data on stdout remains machine-readable. Existing credential files are protected: pass `--force` on subsequent logins to replace the selected file. `--credentials <path>` chooses another credential file to update; `--output <path>` selects an alternate output file with the same replacement protection. Explicit destinations override the scope-specific default. Do not combine `--credentials` and `--output`. Scripts that previously parsed login stdout must now read the credential file.

Login wiring follows the other service-backed commands: `command.ts` validates
flags with Zod and calls an injected `login(options)` capability. `service.ts`
validates the destination, runs the selected OAuth flow, and saves credentials
before returning the destination for a success diagnostic. The auth group binds
the browser implementation, credential writer, and diagnostics; no invocation
scope factory is involved. Environment-backed inputs are parsed once by the
global option schema rather than reread inside the service.

JSON writes use the shared [OAuth token-document implementation](../../packages/oauth/client/src/storage/token-document-store.ts).
On POSIX keep credential directories owned with mode `0700` and files `0600`;
Windows depends on host ACLs and explicit best-effort directory durability.
Use JSON for MCP credentials. YAML is supported for explicit alternate CLI output.
See [output policy](src/token-output.ts) for validation and durability differences.

The complete response can contain both `access_token` and `refresh_token`. Treat every output document as a secret. Delete test credential files when they are no longer needed. Token values are never accepted as CLI flags and are not included in successful diagnostics.

## Check the active user

```bash
pnpm run iracing-data whoami
```

`whoami` calls the official [profile endpoint](https://oauth.iracing.com/oauth2/book/iracing_profile_endpoint.html) and prints only `iracing_cust_id` and `iracing_name`. It checks authentication without fetching Data API docs. The endpoint requires `iracing.profile`; credentials created with `--scope iracing.auth` are valid for Data API access but intentionally cannot satisfy `whoami`. If a profile check is required, create a separate profile-capable credential with `iracing-data auth login --scope iracing.auth iracing.profile` (or the default login) rather than adding profile scope to the MCP credential lifecycle.

The same credential precedence and `--credentials` override apply to all authenticated commands. A successful profile check does not establish Data API account access; `docs` still handles 401/403 separately. Network failure does not imply expired credentials.

## Fetch Data API documentation

```bash
pnpm run iracing-data docs
pnpm run iracing-data docs --credentials .iracing-data/iracing-data-mcp/credentials.json
pnpm run iracing-data docs --output /tmp/iracing-data-docs.json
```

Authenticated commands accept `--credentials <path>` for a JSON or YAML token file containing `access_token`. Credential precedence is explicit `--credentials`, then `IRACING_ACCESS_TOKEN` from the shell/root `.env`, then the shared `.iracing-data/credentials.json`. A selected invalid credential file fails rather than silently using another token. Environment tokens must omit the `Bearer ` prefix. `docs` requires `iracing.auth`, so the dedicated auth-only MCP credential is sufficient when selected explicitly.

`docs` uses the generated Fetch `DocApi` and makes exactly one modeled request for Data API documentation; endpoint links returned in that document are not fetched. With no `--output`, stdout contains only documentation JSON. File output leaves stdout empty, uses private atomic writes, and refuses replacement unless `--force` is supplied. JSON/YAML format selection follows the authentication output rules. See the [docs command module](src/commands/docs/) for command-scoped composition and generated-client ownership.

For a current compatibility audit, build the comparison dependencies and stream the live documentation directly into the narrow structural comparator:

```bash
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs \
  | node -r ts-node/register scripts/audit-data-docs.cjs -
```

Exit 0 means no structural candidates, 2 means reviewable discrepancies/schema rejection and 1 means audit execution failure. The comparator does not own network transport, persistence, hashes, provenance or historical diffing. Review ranges/enums, notes, conditional requirements and runtime serialization separately; `/data/doc` does not describe complete endpoint response shapes. See [compatibility boundaries](../../docs/UPSTREAM-CONTRACT.md) and the repository compatibility skill for the full report procedure.

## Fetch Data API asset metadata

```bash
pnpm run iracing-data assets car
pnpm run iracing-data assets series
pnpm run iracing-data assets track
pnpm run iracing-data assets track --credentials .iracing-data/iracing-data-mcp/credentials.json
```

The three asset leaves use generated `CarApi.getCarAssets()`, `SeriesApi.getSeriesAssets()`, and `TrackApi.getTrackAssets()` operations for the modeled Data API requests. Each operation returns the standard opaque `{ link, expires }` envelope. The CLI validates and materializes the exact returned HTTPS link once, without forwarding the iRacing bearer token, then prints the resulting JSON payload to stdout with a trailing newline.

The commands preserve the returned JSON rather than rewriting it into a CLI-specific schema. They do not download referenced image or binary assets, construct local directory layouts, synchronize files, or maintain an asset cache. Credential precedence is the same authenticated-command contract used by `docs`: explicit `--credentials`, then `IRACING_ACCESS_TOKEN`, then `.iracing-data/credentials.json`.

Canonical OpenAPI parity is verified offline: runtime `/data/**/assets` routes in `openapi/iracing.yaml` must have matching authored `assets` leaves, while `/data/doc/**/assets` documentation routes are excluded. See the [assets command documentation](src/commands/assets/README.md) for ownership and safety details.

## Discover seasons and series

```bash
pnpm iracing-data season list --season-year 2026 --season-quarter 4
pnpm iracing-data season race-guide
pnpm iracing-data season spectator-subsessionids --event-types 2,5
pnpm iracing-data season spectator-subsessionids-detail --event-types 2,5 --season-ids 6434
pnpm iracing-data series get
pnpm iracing-data series assets
pnpm iracing-data series past-seasons --series-id 514
pnpm iracing-data series seasons --include-series
pnpm iracing-data series season-list
pnpm iracing-data series season-schedule --season-id 6434
pnpm iracing-data series stats-series
```

Spectator filters accept comma-separated numeric IDs and use the generated
client's single-value CSV query encoding. Race-guide timestamps accept ISO-8601
offsets. Omitted options preserve upstream defaults.

## Statistics

```bash
pnpm iracing-data stats member-bests
pnpm iracing-data stats member-career
pnpm iracing-data stats member-division --season-id 6444 --event-type 5
pnpm iracing-data stats member-recap --year 2026 --season 4
pnpm iracing-data stats member-recent-races
pnpm iracing-data stats member-summary
pnpm iracing-data stats member-yearly
pnpm iracing-data stats season-driver-standings --season-id 6444 --car-class-id 74
pnpm iracing-data stats season-supersession-standings --season-id 6444 --car-class-id 74
pnpm iracing-data stats season-team-standings --season-id 6434 --car-class-id 4109
pnpm iracing-data stats season-tt-standings --season-id 6444 --car-class-id 74
pnpm iracing-data stats season-tt-results --season-id 6444 --car-class-id 74 --race-week-num 0
pnpm iracing-data stats season-qualify-results --season-id 6444 --car-class-id 74 --race-week-num 0
pnpm iracing-data stats world-records --car-id 1 --track-id 1
```

Member queries default to your account when `--cust-id` is omitted. Member
division accepts event type 4 (Time Trial) or 5 (Race). Race weeks and divisions
are zero-based; division 10 is Rookie. World records emits its direct chunk
manifest without downloading the chunks.

## Result details and activity

```bash
pnpm iracing-data results-event-log --subsession-id 123 --simsession-number 0
pnpm iracing-data results-lap-chart-data --subsession-id 123 --simsession-number 0
pnpm iracing-data results-lap-data --subsession-id 123 --simsession-number 0 --cust-id 456
pnpm iracing-data results-season-results --season-id 6444
pnpm iracing-data results-search-series --season-year 2026 --season-quarter 4 --series-id 259
pnpm iracing-data driver-stats-by-category --category sports_car
pnpm iracing-data session registered-drivers --subsession-id 123
pnpm iracing-data time-attack member-season-results --ta-comp-season-id 1
```

Simsession 0 is the main event; negative numbers select preceding events.
Lap-data queries require a customer ID for single-driver events or team ID for
team events. Series searches preserve the direct manifest and do not expand
chunks. Driver-stat categories are `oval`, `road` (legacy), `dirt_oval`,
`dirt_road`, `sports_car`, or `formula_car`.

Season, series, statistics, result-detail, session, time-attack and driver-stat
commands also accept `--response-only` for sensitive modeled-wire inspection.
Driver statistics downloads CSV and emits JSON rows with string-valued columns;
quoted commas, escaped quotes, BOMs, and additional columns are retained.
Default output is downloaded JSON except for CSV driver statistics and direct chunk manifests. Use each
leaf's `--help` to discover filters; shared credential precedence applies.

`league-history` is retired. Compose the JSON-producing league and results
commands instead of relying on CLI-owned capture directories or manifests.

## Use the access token with `data-api-first-call`

The example still accepts `IRACING_ACCESS_TOKEN`. To run it, copy only `access_token` from the ignored credential document into the example's `.env`, without `Bearer `, then follow [its README](../../examples/data-api-first-call/README.md). The CLI does not edit the example's `.env`. For current Data API documentation, use `iracing-data docs` directly.

## Manual live-auth validation

Live OAuth validation is a maintainer procedure and is separate from deterministic offline CI. CI must not require real iRacing credentials.

Use a real registered OAuth client and do the following without copying token values into terminal logs, issues, or PRs:

1. Install and build:

   ```bash
   pnpm install --frozen-lockfile
   pnpm --filter '@iracing-data/cli...' build
   cd apps/iracing-data-cli
   ```

2. Run `pnpm start -- auth login` and verify the default repository credential file contains a nonempty `access_token`, without printing its value. Run login again and verify that it updates the same file. Successful stdout must be empty.
3. Run `pnpm start -- auth login --scope iracing.auth` and verify it writes `.iracing-data/iracing-data-mcp/credentials.json`, requests no profile scope, and leaves the normal `.iracing-data/credentials.json` lifecycle independent.
4. Confirm the auth-only file works with `docs --credentials <path>` and that `whoami --credentials <path>` reports the profile-scope recovery action rather than exposing a response body.
5. For alternate output checks, create a private temporary directory:

   ```bash
   tmp_dir="$(mktemp -d)"
   chmod 700 "$tmp_dir"
   ```

6. Validate explicit file output:

   ```bash
   pnpm start -- auth login --output "$tmp_dir/credentials.json"
   ```

7. Run the same command again without `--force`; it must fail rather than replace the existing credential file.
8. Run it again with `--force`; it must replace the file successfully.
9. Where practical, run with `--no-open`, manually open the printed authorization URL, and complete the callback flow.
10. Manually copy the `access_token` value from the appropriate credential document into `examples/data-api-first-call/.env` as `IRACING_ACCESS_TOKEN`, without adding `Bearer `.
11. From the repository root, run:

    ```bash
    pnpm --filter 'iracing-data-api-first-call...' build
    pnpm --filter iracing-data-api-first-call start
    ```

12. From the repository root, retrieve current documentation into the temporary directory and run the comparator against that plain response:

    ```bash
    pnpm run iracing-data docs --output "$tmp_dir/data-docs.json"
    node -r ts-node/register scripts/audit-data-docs.cjs "$tmp_dir/data-docs.json"
    ```

13. Remove the temporary credential/document directory and any test `.env` files when finished.

Offline unit tests cover OAuth lifecycle, scope selection, callback behavior, output mechanics, Data API documentation retrieval and compatibility-comparison mechanics with synthetic inputs. The live procedure above validates only the external iRacing integration and should never be converted into credential-bearing CI.

## Implementation navigation

- [Browser/callback flow](src/authenticate.ts) and [login policy](src/commands/auth/login/).
- [Credential precedence](src/credentials.ts) and [output/durability integration](src/token-output.ts).
- [Documentation command](src/commands/docs/), [asset commands](src/commands/assets/), and [profile check](src/commands/whoami/).
- [Browser launcher](src/browser.ts) and [diagnostic sink](src/diagnostics.ts).
- Shared [OAuth lifecycle](../../packages/oauth/client/src/client.ts) and [durable store](../../packages/oauth/client/src/storage/token-document-store.ts).
