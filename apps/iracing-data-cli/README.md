# iracing-data CLI

`apps/iracing-data-cli` is this repository's private Commander-based `iracing-data` CLI. Its initial command surface is authentication-only: `iracing-data auth login` obtains iRacing OAuth tokens with the browser Authorization Code flow.

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
Requested scope: iracing.auth
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
-o, --output <path>       Write the token response to a file instead of stdout
--format <json|yaml>      Override serialization format
--force                   Replace an existing output file
--no-open                 Print the authorization URL instead of opening a browser
--timeout-seconds <n>     Callback timeout in seconds; default: 300
```

Explicit `--format` wins. Otherwise `.yaml` and `.yml` paths select YAML; all other paths and stdout default to JSON.

## Output and credential security

When `--output` is omitted, stdout contains only the serialized token document. Browser instructions, progress, warnings, success messages, and errors go to stderr, so redirection remains machine-safe:

```bash
pnpm start -- auth login > credentials.json
```

When `--output` is supplied, successful stdout is empty. Credential files are written through a sibling temporary file and are not replaced unless `--force` is supplied. On POSIX-like systems the CLI creates credential files with mode `0600` where supported. Node file modes do not provide an equivalent Windows ACL guarantee, so protect the destination using the host's normal Windows access controls.

The complete response can contain both `access_token` and `refresh_token`. Treat every output document as a secret. Delete test credential files when they are no longer needed.

## Use the access token with `data-api-first-call`

The handoff is intentionally manual; `iracing-data` does not edit another project's `.env` file.

1. Open the successful token document and copy only the value of `access_token`.
2. From the repository root, create the example environment file:

   ```bash
   cp examples/data-api-first-call/.env.example examples/data-api-first-call/.env
   ```

3. Set the copied value without a `Bearer ` prefix:

   ```dotenv
   IRACING_ACCESS_TOKEN=<access_token>
   ```

4. Build and run the example:

   ```bash
   pnpm --filter 'iracing-data-api-first-call...' build
   pnpm --filter iracing-data-api-first-call start
   ```

Success means `DocApi.getDocs()` returns and the example prints the Data API documentation JSON. A 401/403 means the token, granted scope, expiry, or account access should be checked.

## Manual live-auth validation

Live OAuth validation is a maintainer procedure and is separate from deterministic offline CI. CI must not require real iRacing credentials.

Use a real registered OAuth client and do the following without copying token values into terminal logs, issues, or PRs:

1. Install and build:

   ```bash
   pnpm install --frozen-lockfile
   pnpm --filter '@iracing-data/cli...' build
   cd apps/iracing-data-cli
   ```

2. Validate stdout JSON. Use a private temporary directory so shell redirection does not create a broadly readable token file:

   ```bash
   tmp_dir="$(mktemp -d)"
   chmod 700 "$tmp_dir"
   pnpm start -- auth login > "$tmp_dir/stdout.json"
   node -e 'const fs=require("node:fs");const p=process.argv[1];const v=JSON.parse(fs.readFileSync(p,"utf8"));if(typeof v.access_token!=="string"||!v.access_token)process.exit(1)' "$tmp_dir/stdout.json"
   ```

   Repeat with `--format yaml` if YAML stdout needs explicit live coverage; validate structure without printing the credential values.

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

9. Treat a successful `DocApi.getDocs()` response as end-to-end acceptance.
10. Remove the temporary credential directory and any test `.env` files when finished.

Offline unit tests cover OAuth lifecycle and output mechanics with synthetic tokens. The live procedure above validates only the external iRacing integration and should never be converted into credential-bearing CI.
