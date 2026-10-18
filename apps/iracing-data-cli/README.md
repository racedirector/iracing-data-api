# iracing-data CLI

`apps/iracing-data-cli` is this repository's private Commander-based `iracing-data` CLI. `iracing-data auth login` obtains iRacing OAuth tokens with the browser Authorization Code flow; `iracing-data docs` fetches authenticated Data API documentation, `iracing-data assets` materializes runtime asset metadata, and `iracing-data whoami` checks the active profile. This is private repository tooling.

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

Successful stdout is empty; diagnostics go to stderr. Subsequent logins replace the selected shared file so authenticated consumers can read the current token. `--credentials <path>` chooses another credential file to update. `--output <path>` retains the previous alternate-file behavior: it refuses replacement unless `--force` is supplied. Explicit destinations override the scope-specific default. Do not combine `--credentials` and `--output`. Scripts that previously parsed login stdout must now read the credential file.

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

`docs` uses the generated Fetch `DocApi` and makes exactly one modeled request for Data API documentation; endpoint links returned in that document are not fetched. With no `--output`, stdout contains only documentation JSON. File output leaves stdout empty, uses private atomic writes, and refuses replacement unless `--force` is supplied. JSON/YAML format selection follows the authentication output rules. The [docs Commander adapter](src/commands/docs.ts) declares options, validates the output format before credential I/O, and delegates normalized input to the injected [docs service](src/services/docs.ts). That service exposes one `execute(input)` operation and receives the token resolver, authenticated API factory, document writer, and diagnostics as explicit dependencies. The [registrar](src/program.ts) composes production dependencies without doing I/O at registration time. The service resolves the token on invocation, calls the generated `api.doc.getDocs()` once, publishes via the supplied writer, and only then reports success. Request failures receive documentation HTTP/network advice without relabeling credential or output failures. The [typed API facade](src/api.ts) still owns shared generated SDK configuration and lazy generated clients, retaining the SDK's default base URL (`https://members-ng.iracing.com`); it owns no CLI policy. Adding another command requires defining its Commander parsing adapter and an independently callable executor with only the dependencies that operation actually needs. No scope factories, generic command dispatcher, or dependency container are necessary.

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
- [Documentation command](src/commands/docs.ts), [asset commands](src/commands/assets/), and [profile check](src/commands/whoami/).
- [Browser launcher](src/browser.ts) and [diagnostic sink](src/diagnostics.ts).
- Shared [OAuth lifecycle](../../packages/oauth/client/src/client.ts) and [durable store](../../packages/oauth/client/src/storage/token-document-store.ts).
