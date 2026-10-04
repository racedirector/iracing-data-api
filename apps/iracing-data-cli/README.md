# iRacing Data CLI

`apps/iracing-data-cli` is the repository's private Commander-based `iracing-data` CLI for user-facing iRacing workflows. Its initial command surface is intentionally limited to authentication.

## Configure an iRacing OAuth client

Use iRacing's current OAuth documentation as the source of truth:

- [Client registration](https://oauth.iracing.com/oauth2/book/client_registration.html)
- [Client types](https://oauth.iracing.com/oauth2/book/client_types_overview.html)
- [`/authorize`](https://oauth.iracing.com/oauth2/book/authorize_endpoint.html)
- [`/token`](https://oauth.iracing.com/oauth2/book/token_endpoint.html)
- [Data API workflow](https://oauth.iracing.com/oauth2/book/data_api_workflow.html)

At the time this README was updated, iRacing's registration page says creation of new OAuth client IDs is paused. Treat the upstream page as authoritative for current availability and requirements.

Configure the client used by this CLI for:

```text
Audience: data-server
Registered redirect URI: http://127.0.0.1:0/oauth/iracing/callback
Requested scope: iracing.auth
```

The CLI binds `127.0.0.1` on an ephemeral port and substitutes the selected runtime port into the callback URI. iRacing's client registration must contain the native-app loopback redirect URI shown above.

Public clients are not issued a client secret. Confidential clients may be issued one; when iRacing issues a secret, it is required by the token exchange. Follow the current client-type and registration documentation rather than assuming a secret will or will not be present.

## Configure the local environment

From the repository root:

```bash
cp apps/iracing-data-cli/.env.example apps/iracing-data-cli/.env
```

Set the issued values:

```dotenv
IRACING_AUTH_CLIENT=<client-id>
IRACING_AUTH_SECRET=<secret-if-issued>
```

`IRACING_AUTH_SECRET` is optional only when iRacing did not issue a secret. Do not commit `.env` or generated credential documents.

## Build and run

Build the CLI and its workspace dependencies:

```bash
pnpm --filter 'iracing-data-cli...' build
```

Authenticate and write the complete token response to stdout as JSON:

```bash
pnpm --filter iracing-data-cli start -- auth login
```

Write credentials to a file instead:

```bash
pnpm --filter iracing-data-cli start -- auth login --output ./credentials.json
pnpm --filter iracing-data-cli start -- auth login --output ./credentials.yaml
```

`auth login` supports:

```text
-o, --output <path>          Write the token response to a file instead of stdout
--format <json|yaml>         Override output format inference
--force                      Replace an existing output file
--no-open                    Do not launch the browser automatically
--timeout-seconds <seconds>  Callback timeout; default 300
```

Relative output paths resolve from the CLI process working directory. `.yaml` and `.yml` infer YAML; all other paths and stdout default to JSON unless `--format` is supplied.

## Output and credential security

When `--output` is omitted, stdout contains only the serialized OAuth token response. Browser instructions, progress, warnings, and errors are written to stderr so shell redirection remains machine-safe:

```bash
pnpm --filter iracing-data-cli start -- auth login > credentials.json
```

When `--output` is supplied, successful stdout is empty. Existing files are not replaced unless `--force` is passed. File writes use a same-directory temporary file before publication and request mode `0600` on POSIX-like systems. Node does not provide equivalent portable Windows ACL guarantees, so protect credential files according to the host's normal security controls.

The output contains sensitive access and refresh credentials. Do not publish it, paste it into logs, or commit it.

## Use the token with `data-api-first-call`

After authentication, read the `access_token` value from the generated JSON or YAML document. Copy the example environment template:

```bash
cp examples/data-api-first-call/.env.example examples/data-api-first-call/.env
```

Set:

```dotenv
IRACING_ACCESS_TOKEN=<access_token>
```

Use the raw token value. Do **not** prefix it with `Bearer `.

Then run:

```bash
pnpm --filter 'iracing-data-api-first-call...' build
pnpm --filter iracing-data-api-first-call start
```

Success means `DocApi.getDocs()` completes and the example prints the Data API documentation JSON. The CLI intentionally does not modify the example's `.env` file automatically.

## Manual live-auth validation

Live OAuth is a maintainer procedure and is separate from deterministic, credential-free CI.

1. Configure `apps/iracing-data-cli/.env` with a real registered client.
2. Build with `pnpm --filter 'iracing-data-cli...' build`.
3. Run `pnpm --filter iracing-data-cli start -- auth login` and validate the resulting document contains an `access_token` without copying token values into validation logs.
4. Run with `--output ./credentials.json` and confirm the credential file is created while stdout stays empty.
5. Run the same command again without `--force` and confirm overwrite protection fails safely.
6. Repeat with `--force` and confirm intentional replacement succeeds.
7. Run with `--no-open` and complete the printed authorization URL manually where practical.
8. Copy only the resulting `access_token` value into `examples/data-api-first-call/.env` as `IRACING_ACCESS_TOKEN`.
9. Run `pnpm --filter iracing-data-api-first-call start`.
10. Treat a successful `DocApi.getDocs()` response as end-to-end acceptance.

Never record real client secrets, authorization codes, access tokens, or refresh tokens in issue comments, PR descriptions, terminal transcripts, or CI logs.
