import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { IRacingAPISessionClient, hashPassword } from "@iracing-data/api";
import * as dotenv from "dotenv";
import { exists, getIRacingCredentials } from "./util";

dotenv.config();

export interface TrackInfo {
  track_id: number;
}

export interface TrackAsset {
  track_id: string;
  track_map: string;
  track_map_layers: Record<string, string>;
}

export type TrackAssetIndex = Record<string, TrackAsset>;

export interface SyncTrackAssetsOptions {
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
    username: usernameProp,
    force = false,
    writeFullAssets = false,
    writeFullInfo = false,
    skipTrackAssets = false,
    skipTrackInfo = false,
    includeSVGs = false,
  }: SyncTrackAssetsOptions,
  client: IRacingAPISessionClient = new IRacingAPISessionClient()
) {
  /**
   * Authenticate with the iRacing API if no credentials are found.
   */
  const needAuth = client.whoami() === null;
  if (needAuth) {
    console.log("No credentials found. Authenticating with iRacing API.");
    const { username, password } = await getIRacingCredentials(usernameProp);
    const hashedPassword = await hashPassword(username, password);
    await client.authenticate({ username, password: hashedPassword });
    console.log("Authenticated with user:", client.whoami());
  }

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
    client.trackAssets() as Promise<TrackAssetIndex>,
    client.trackGet() as Promise<TrackInfo[]>,
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

  for (const [trackId, asset] of Object.entries<TrackAsset>(tracks)) {
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
            const response = await client.client.get(layerUrl);
            const svg = response.data;
            await writeFile(layerPath, svg, "utf8");
          }
        })
      );
    }

    // TODO: Download images.
  }
}

export default syncTrackAssets;
