# @iracing-data/helpers/sync-car-assets

Helper utilities to download car assets and metadata from the iRacing `/data` API and write them to disk.

## Installation

```bash
pnpm add @iracing-data/helpers/sync-car-assets
```

## Usage

```typescript
import { syncCarAssets } from "@iracing-data/helpers/sync-car-assets";

await syncCarAssets(
  {
    outputDir: "./cars",
    writeFullAssets: true,
    writeFullInfo: true,
  }
);
```

Assets are written under the provided output directory with per-car `assets.json` and `info.json` files. Optional flags let you skip writing either dataset.
