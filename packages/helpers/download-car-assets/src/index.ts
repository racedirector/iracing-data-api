import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { IRacingAPISessionClient, hashPassword } from "@iracing-data/api";
import * as dotenv from "dotenv";
import { exists, getIRacingCredentials } from "./util";

dotenv.config();

export interface DownloadCarAssetsOptions {
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
export async function downloadCarAssets(
  {
    outputDir,
    username: usernameProp,
    force = false,
    writeFullAssets = false,
    writeFullInfo = false,
  }: DownloadCarAssetsOptions,
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
    client.carAssets(),
    client.carGet(),
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
}

export default downloadCarAssets;
