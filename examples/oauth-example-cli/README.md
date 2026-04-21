# oauth-example-cli

CLI OAuth example that starts the iRacing browser authorization flow, waits for
the callback on localhost, and writes returned credentials to
`examples/oauth-example-cli/credentials.json`.

## Usage

1. Create an `.env` file in this directory with:

```bash
IRACING_AUTH_CLIENT=<your-client-id>
IRACING_AUTH_SECRET=<your-client-secret-if-required>
OAUTH_CALLBACK_PORT=4040
```

2. Run:

```bash
pnpm --filter iracing-oauth-example-cli start
```

Optional flags:

```bash
pnpm --filter iracing-oauth-example-cli start -- --callback-port 4040 --credentials-path ./credentials.json --timeout-seconds 300
```

3. Press Enter in the CLI prompt to open your browser.
4. Complete sign-in in the browser and return to the CLI.
5. Find credentials in `credentials.json`.
