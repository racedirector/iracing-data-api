# @iracing-data/sync-track-assets-cli

CLI that downloads track assets, metadata, and optional SVG layers from the iRacing `/data` API.

## Setup

1. Copy the environment template and provide your OAuth credentials:

   ```bash
   cp .env.template .env
   ```

2. Install dependencies from the repo root:

   ```bash
   pnpm install
   ```

## Usage

```bash
pnpm --filter @iracing-data/sync-track-assets-cli start -- --out-dir ./tracks --include-svgs
```

Useful flags:
- `--force`: Redownload SVG layers even if they already exist locally.
- `--write-full-info` / `--write-full-assets`: Persist the entire `/data` responses.
- `--skip-info` / `--skip-assets`: Skip writing portions of the payloads.
- `--include-svgs`: Download track SVG layers for each configuration.

Behind the scenes the CLI authenticates with the OAuth service, then delegates to `@iracing-data/helpers/sync-track-assets` to write files to disk.
