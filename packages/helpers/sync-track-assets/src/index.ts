import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { exists, fetchAPIResponseData } from "./util";
import { TrackApi } from "@iracing-data/api-client-fetch";
import {
  IRacingGetTrackAssetsResponse,
  IRacingGetTrackResponse,
} from "@iracing-data/api-schema";

export interface SyncTrackAssetsOptions {
  /**
   * The directory to output the SVG files to.
   */
  outputDir: string;

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

  /**
   * Include SVGs
   * @default false
   */
  includeSVGs?: boolean;
}

/**
 * Downloads track SVGs to the provided output directory.
 * The output directory will contain a `tracks.json` file with the track assets,
 * and a `track-info.json` file with the track information.
 * Track SVGs will be downloaded to a directory named after the track ID.
 *
 * @param options The options for the download.
 * @param client The client to use for the download.
 */
export async function syncTrackAssets(
  {
    outputDir,
    force = false,
    writeFullAssets = false,
    writeFullInfo = false,
    skipTrackAssets = false,
    skipTrackInfo = false,
    includeSVGs = false,
  }: SyncTrackAssetsOptions,
  client: TrackApi = new TrackApi()
) {
  /**
   * Create the output directory if it doesn't exist.
   */
  const outputExists = await exists(outputDir);
  if (!outputExists) {
    console.log("Creating output directory:", outputDir);
    await mkdir(outputDir, { recursive: true });
  }

  /**
   * Get the JSON data for the track assets and track info from the API.
   */
  const [tracks, trackInfo] = await Promise.all([
    client
      .getTrackAssets()
      .then(fetchAPIResponseData<IRacingGetTrackAssetsResponse>),
    client.getTrack().then(fetchAPIResponseData<IRacingGetTrackResponse>),
  ]);

  /**
   * Write the data if requested.
   */
  if (writeFullAssets) {
    const trackAssetsPath = path.join(outputDir, "tracks.json");
    console.log("Writing full track assets to:", trackAssetsPath);
    await writeFile(trackAssetsPath, JSON.stringify(tracks), "utf8");
  }

  if (writeFullInfo) {
    const trackInfoPath = path.join(outputDir, "track-info.json");
    console.log("Writing full track info to:", trackInfoPath);
    await writeFile(trackInfoPath, JSON.stringify(trackInfo), "utf8");
  }

  console.log("Downloading assets for", Object.keys(tracks).length, "tracks.");

  for (const [trackId, asset] of Object.entries(tracks)) {
    const info = trackInfo.find((t) => t.track_id === +trackId);
    const trackDir = path.join(outputDir, trackId);
    const assetPath = path.join(trackDir, "assets.json");
    const infoPath = path.join(trackDir, "info.json");

    const trackDirExists = await exists(trackDir);
    if (!trackDirExists) {
      await mkdir(trackDir, { recursive: true });
    }

    console.log("Getting track with ID:", trackId);

    if (!skipTrackAssets) {
      console.log("\tWriting track asset to:", assetPath);
      await writeFile(assetPath, JSON.stringify(asset), "utf8");
    }

    if (!skipTrackInfo) {
      if (info) {
        console.log("\tWriting track info to:", infoPath);
        await writeFile(infoPath, JSON.stringify(info), "utf8");
      } else {
        console.log("\tNo track info found for track ID:", trackId);
      }
    }

    if (includeSVGs) {
      await Promise.all(
        Object.values(asset.track_map_layers).map(async (layer) => {
          const layerPath = path.join(trackDir, layer);
          const layerUrl = new URL(layer, asset.track_map).toString();

          // Skip if the layer exists and we're not forcing download.
          const layerExists = await exists(layerPath);
          if (layerExists && !force) {
            console.log("\tLayer already exists:", layerPath);
            return;
          } else {
            // Get the asset from the URL and write to the file.
            console.log("\tDownloading layer:", layer, "from", layerUrl);
            const response = await fetch(layerUrl);
            const svg = await response.text();
            await writeFile(layerPath, svg, "utf8");
          }
        })
      );
    }

    // TODO: Download images.
  }
}

export default syncTrackAssets;
