# @iracing-data/helpers/sync-track-assets

A helper function to download all the track SVGs from the iRacing API.

## Installation

```bash
pnpm install @iracing-data/helpers/sync-track-assets
```

## Usage

Will output all the track SVGs to the specified directory. Subdirectories will be created for each track, by ID. `asset.json` and `info.json` files will be written to each track directory, unless `skipTrackInfo` or `skipTrackAssets` is set to `true`.

```typescript
await downloadTrackSVGs(
  {
    outputDir: outDir,
    writeFullAssets,
    writeFullInfo,
    skipTrackAssets,
    skipTrackInfo,
    username,
    force,
  },
);
```

### Configuration

```typescript
export interface DownloadTrackSVGsOptions {
  /**
   * The directory to output the SVG files to.
   */
  outputDir: string;

  /**
   * iRacing username.
   * @default undefined
   */
  username?: string;

  /**
   * Force download of track layers even if they already exist.
   * @default false
   */
  force?: boolean;

  /**
   * Write full track info to the output directory.
   * @default false
   */
  writeFullInfo?: boolean;

  /**
   * Write full track assets to the output directory.
   * @default false
   */
  writeFullAssets?: boolean;

  /**
   * Skip writing track info for each track.
   * @default false
   */
  skipTrackInfo?: boolean;

  /**
   * Skip writing track assets for each track.
   * @default false
   */
  skipTrackAssets?: boolean;
}
```
