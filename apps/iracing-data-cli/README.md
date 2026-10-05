# iracing-data CLI

`apps/iracing-data-cli` is this repository's private Commander-based `iracing-data` CLI. `iracing-data auth login` obtains iRacing OAuth tokens with the browser Authorization Code flow; `iracing-data docs` fetches authenticated Data API documentation, and `iracing-data whoami` checks the active profile. This is private repository tooling and reuses the root upstream capture implementation.

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
Requested scopes: iracing.auth iracing.profile
```

By default, the CLI binds `127.0.0.1` on an ephemeral runtime port before opening the authorization page. This works only if the client has the `:0` URI above registered. Set `IRACING_AUTH_REDIRECT_URI` to the HTTP loopback URI actually registered for your client to use a different path or a fixed port. For example, if `http://127.0.0.1:3000/callback` is registered:

```dotenv
IRACING_AUTH_REDIRECT_URI=http://127.0.0.1:3000/callback
```

The CLI listens on that host, port, and path and sends the same URI in both authorization and token requests. For a registered native-app URI with port `0`, only the port is replaced at runtime. IPv4 `127.0.0.1` and IPv6 `[::1]` loopback addresses are supported. See [iRacing's redirect URI rules](https://oauth.iracing.com/oauth2/book/redirect_uris_overview.html). Hosted HTTPS callbacks require a web application and cannot be received by this local CLI.

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
pnpm run iracing-data auth login --credentials .upstream-contract/credentials.json
pnpm run iracing-data auth login --output ./credentials.json
pnpm run iracing-data auth login --output ./credentials.yaml
```

Existing shell environment variables take precedence over `.env` values. `pnpm exec iracing-data` invokes the bin directly and does not load `.env`. After editing CLI source, rebuild before running the root script.

Alternatively, create `apps/iracing-data-cli/.env` from the app's `.env.example` and run from the app directory so its `.env` file is loaded by the app's `start` script:

```bash
cd apps/iracing-data-cli
pnpm start -- auth login
pnpm start -- auth login --output ./credentials.json
pnpm start -- auth login --output ./credentials.yaml
```

Useful flags:

```text
-o, --output <path>       Write tokens to an alternate file
--credentials <path>      Override the shared credential file to update
--format <json|yaml>      Override serialization format
--force                   Replace an existing output file
--no-open                 Print the authorization URL instead of opening a browser
--timeout-seconds <n>     Callback timeout in seconds; default: 300
```

Explicit `--format` wins. Otherwise `.yaml` and `.yml` paths select YAML; all other paths default to JSON. Keep the default `.json` credential file in JSON so consumers can read it.

## Output and credential security

By default, `auth login` atomically updates `.iracing-data/credentials.json` at the repository root. The directory is ignored by Git. Successful stdout is empty; diagnostics go to stderr. Subsequent logins replace that shared file so authenticated consumers can read the current token. `--credentials <path>` chooses another credential file to update. `--output <path>` retains the previous alternate-file behavior: it refuses replacement unless `--force` is supplied. Do not combine `--credentials` and `--output`. Scripts that previously parsed login stdout must now read the credential file.

Credential files use sibling temporary files and mode `0600` on POSIX-like systems, with new parent directories using mode `0700` where supported. Node modes do not provide equivalent Windows ACL protection; use the host's normal access controls. Consumers should read the file at command startup rather than cache a token indefinitely. Login does not automatically refresh an expired token.

The complete response can contain both `access_token` and `refresh_token`. Treat every output document as a secret. Delete test credential files when they are no longer needed.

## Check the active user

```bash
pnpm run iracing-data whoami
pnpm run iracing-data whoami --credentials .upstream-contract/credentials.json
```

`whoami` calls the official [profile endpoint](https://oauth.iracing.com/oauth2/book/iracing_profile_endpoint.html) and prints only `iracing_cust_id` and `iracing_name`. It checks authentication without fetching Data API docs. The endpoint requires `iracing.profile`, which new CLI logins request alongside `iracing.auth`; an older token may still work for docs but need a new login for `whoami`. The same credential precedence and `--credentials` override apply to all authenticated commands. A successful profile check does not establish Data API account access; `docs` still handles 401/403 separately. Network failure does not imply expired credentials.

## Fetch Data API documentation

```bash
pnpm run iracing-data docs
pnpm run iracing-data docs --output .upstream-contract/docs.json
pnpm run iracing-data docs --credentials .upstream-contract/credentials.json --output .upstream-contract/docs.yaml
pnpm run iracing-data docs --snapshot --output .upstream-contract/data-current.json
```

Authenticated commands accept `--credentials <path>` for a JSON or YAML token file containing `access_token`. Credential precedence is explicit `--credentials`, then `IRACING_ACCESS_TOKEN` from the shell/root `.env`, then the shared `.iracing-data/credentials.json`. A selected invalid credential file fails rather than silently using another token. Environment tokens must omit the `Bearer ` prefix.

`docs` makes exactly one request to `https://members-ng.iracing.com/data/doc`; endpoint links are not fetched. With no `--output`, stdout contains only documentation JSON. File output leaves stdout empty, uses private atomic writes, and refuses replacement unless `--force` is supplied. JSON/YAML format selection follows the authentication output rules. It preserves unknown documentation fields while sorting keys and redacting credentials through the existing upstream normalizer. It does not validate evidence using the maintained response schema, which may itself be out of date.

`--snapshot` adds the upstream evidence envelope: fixed source URL, live capture time, normalizer version and content hash. Choose fresh ignored paths and JSON snapshots for compatibility audits. Network requests refuse redirects and time out after 30 seconds. HTTP 401/403 reports an action to check token expiry, `iracing.auth` scope and account access, then obtain a new token with `auth login`. No tokens or response bodies appear in errors.

After capturing once, compare offline against the current authored schemas and OpenAPI mappings:

```bash
pnpm --filter '@iracing-data/api-schema-to-openapi...' build
node -r ts-node/register scripts/audit-data-docs.cjs .upstream-contract/data-current.json
```

Exit 0 means no structural candidates, 2 means reviewable discrepancies and 1 means failure. Review ranges/enums, notes, conditional requirements and runtime serialization separately; `/data/doc` does not describe complete endpoint response shapes. See [upstream evidence](../../docs/UPSTREAM-CONTRACT.md) and the repository compatibility skill for the report procedure.

## Use the access token with `data-api-first-call`

The example still accepts `IRACING_ACCESS_TOKEN`. To run it, copy only `access_token` from the ignored credential document into the example's `.env`, without `Bearer `, then follow [its README](../../examples/data-api-first-call/README.md). The CLI does not edit the example's `.env`. For an automated documentation capture, use `iracing-data docs` directly.

## Manual live-auth validation

Live OAuth validation is a maintainer procedure and is separate from deterministic offline CI. CI must not require real iRacing credentials.

Use a real registered OAuth client and do the following without copying token values into terminal logs, issues, or PRs:

1. Install and build:

   ```bash
   pnpm install --frozen-lockfile
   pnpm --filter '@iracing-data/cli...' build
   cd apps/iracing-data-cli
   ```

2. Run `pnpm start -- auth login` and verify the default repository credential file contains a nonempty `access_token`, without printing its value. Run login again and verify that it updates the same file. Successful stdout must be empty. For alternate output checks, create a private temporary directory:

   ```bash
   tmp_dir="$(mktemp -d)"
   chmod 700 "$tmp_dir"
   ```

3. Validate explicit file output:

   ```bash
   pnpm start -- auth login --output "$tmp_dir/credentials.json"
   ```

4. Run the same command again without `--force`; it must fail rather than replace the existing credential file.
5. Run it again with `--force`; it must replace the file successfully.
6. Where practical, run with `--no-open`, manually open the printed authorization URL, and complete the callback flow.
7. Manually copy the `access_token` value from the credential document into `examples/data-api-first-call/.env` as `IRACING_ACCESS_TOKEN`, without adding `Bearer `.
8. From the repository root, run:

   ```bash
   pnpm --filter 'iracing-data-api-first-call...' build
   pnpm --filter iracing-data-api-first-call start
   ```

9. Run `pnpm run iracing-data docs --snapshot --output .upstream-contract/data-live-validation.json` from the root. Treat a valid live snapshot as CLI end-to-end acceptance; do not repeat this during a capture-once audit.
10. Remove the temporary credential directory and any test `.env` files when finished.

Offline unit tests cover OAuth lifecycle and output mechanics with synthetic tokens. The live procedure above validates only the external iRacing integration and should never be converted into credential-bearing CI.
