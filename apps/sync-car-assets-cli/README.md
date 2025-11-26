# @iracing-data/sync-car-assets-cli

CLI for downloading car assets and metadata from the iRacing `/data` API.

## Setup

1. Copy the environment template and fill in your OAuth client credentials and login:

   ```bash
   cp .env.template .env
   ```

2. Install dependencies from the repo root:

   ```bash
   pnpm install
   ```

## Usage

```bash
pnpm --filter @iracing-data/sync-car-assets-cli start -- --out-dir ./cars
```

Options:
- `--out-dir` (required): Destination directory for assets.
- `--write-full-info` / `--write-full-assets`: Persist the full `/data` responses.
- `--skip-info` / `--skip-assets`: Avoid writing specific files if you only need a subset.

The CLI authenticates with iRacing using the provided credentials, then invokes `@iracing-data/helpers/sync-car-assets` to write files locally.
