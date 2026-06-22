# oauth-example

Browser-based OAuth example app for iRacing. It runs a local web server with
login/logout routes, starts OAuth in the browser, handles the callback, and
sets an auth cookie for the session.

## Usage

1. Create an `.env` file in this directory with:

```bash
IRACING_AUTH_CLIENT=<your-client-id>
IRACING_AUTH_SECRET=<your-client-secret-if-required>
PORT=3000
```

2. Run:

```bash
pnpm --filter iracing-oauth-example dev
```

3. Open `http://127.0.0.1:3000` and use the Login link.
