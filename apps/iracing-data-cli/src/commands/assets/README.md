# Assets commands

`iracing-data assets` is the CLI surface for runtime Data API `*/assets` operations. The command group is structural; each leaf chooses its generated API operation and delegates credentials, generated request handling, and JSON publication to the shared document request executor. All three leaves use the shared executor and one injected returned-link materializer, while retaining separate, opinionated generated API operations. The returned-link materializer remains an injected, shared HTTPS-only transport boundary.

Current authored leaves:

```text
iracing-data assets car
iracing-data assets series
iracing-data assets track
```

Each command selects its generated Fetch client operation for the modeled Data API request, receives the standard opaque `{ link, expires }` envelope, materializes the exact returned HTTPS link once, and writes the resulting JSON payload to stdout with a trailing newline.

The returned-link request does not forward the iRacing bearer token. Invalid or non-HTTPS links, transport failures, non-success responses, and non-JSON payloads fail with fixed diagnostics that do not include arbitrary upstream bodies or sensitive headers.

Credential precedence is the existing authenticated-command contract: explicit `--credentials`, then `IRACING_ACCESS_TOKEN`, then `.iracing-data/credentials.json`.

These commands preserve the returned JSON payload. They do not download referenced images or binary assets, rewrite relative asset paths, construct local directory layouts, synchronize files, or maintain an asset cache.

## Car assets

```bash
pnpm run iracing-data assets car
pnpm run iracing-data assets car --credentials .iracing-data/iracing-data-mcp/credentials.json
```

Uses generated `CarApi.getCarAssets()` for `GET /data/car/assets`.

## Series assets

```bash
pnpm run iracing-data assets series
pnpm run iracing-data assets series --credentials .iracing-data/iracing-data-mcp/credentials.json
```

Uses generated `SeriesApi.getSeriesAssets()` for `GET /data/series/assets`.

## Track assets

```bash
pnpm run iracing-data assets track
pnpm run iracing-data assets track --credentials .iracing-data/iracing-data-mcp/credentials.json
```

Uses generated `TrackApi.getTrackAssets()` for `GET /data/track/assets`. This command intentionally does not revive the historical track-asset synchronization utility or its filesystem behavior.

## Contract parity

Offline CLI verification reads the canonical `openapi/iracing.yaml`, discovers runtime `/data/**/assets` paths while excluding `/data/doc/**/assets`, and compares that set with the authored `assets` Commander leaves. A modeled endpoint without a matching command or a stale authored command without a modeled endpoint fails verification in both directions.
