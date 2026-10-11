# Assets commands

`iracing-data assets` is the CLI surface for runtime Data API `*/assets` operations. The command group is structural; executable leaves resolve their own authenticated invocation scope.

## Car assets

```bash
pnpm run iracing-data assets car
pnpm run iracing-data assets car --credentials .iracing-data/iracing-data-mcp/credentials.json
```

`assets car` uses the generated Fetch `CarApi.getCarAssets()` operation for `GET /data/car/assets`. The generated response is an opaque `{ link, expires }` envelope. The CLI then materializes the exact returned HTTPS link once and writes the resulting asset JSON to stdout with a trailing newline.

The returned-link request does not forward the iRacing bearer token. Invalid or non-HTTPS links, transport failures, non-success responses, and non-JSON payloads fail with fixed diagnostics that do not include arbitrary upstream bodies or sensitive headers.

Credential precedence is the existing authenticated-command contract: explicit `--credentials`, then `IRACING_ACCESS_TOKEN`, then `.iracing-data/credentials.json`.

Car asset values are preserved as returned. In particular, relative image paths are not rewritten by the CLI.
