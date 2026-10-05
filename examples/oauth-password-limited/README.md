# oauth-password-limited

Password-limited OAuth example for iRacing that authenticates, restores cached
credentials when available, and fetches `/data` API assets into local files.

## Usage

1. Copy the environment template:

```bash
cp .env.template .env
```

2. Update `.env` with your credentials:

```bash
IRACING_AUTH_CLIENT=<your-client-id>
IRACING_AUTH_SECRET=<your-client-secret-if-required>
IRACING_AUTH_USERNAME=<your-iracing-username>
IRACING_AUTH_PASSWORD=<your-iracing-password>
```

3. Run the example from the repository root:

```bash
pnpm --filter iracing-password-limited-oauth start
```

## Output

- OAuth credentials are persisted to
  `examples/oauth-password-limited/output/credentials.json`.
- `/data` API responses are written into
  `examples/oauth-password-limited/output`.
- Constants endpoints return arrays directly. The example saves these as
  `categories.json`, `divisions.json`, and `event-types.json` without following a
  cache link; other cached endpoints still fetch their returned links.
- Track SVG layers are written into
  `examples/oauth-password-limited/output/tracks`.

## Offline verification

`pnpm --filter iracing-password-limited-oauth test` checks constants output with
synthetic responses, including empty arrays. No login or credentials are needed.
