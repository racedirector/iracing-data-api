# @iracing-data/helpers/sync-track-assets

Downloads track assets (including optional SVG layers) and metadata from the iRacing `/data` API.

## Installation

```bash
pnpm add @iracing-data/helpers/sync-track-assets
```

## Usage

```typescript
import { syncTrackAssets } from "@iracing-data/helpers/sync-track-assets";

await syncTrackAssets({
  outputDir: "./tracks",
  includeSVGs: true,
  writeFullAssets: true,
});
```

The helper writes per-track `assets.json` and `info.json` files under the output directory and can optionally download SVG layers for each configuration.
