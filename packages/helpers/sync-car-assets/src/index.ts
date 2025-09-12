import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { IRacingAPISessionClient, hashPassword } from "@iracing-data/api";
import * as dotenv from "dotenv";
import { exists, getIRacingCredentials } from "./util.js";

dotenv.config();

export interface SyncCarAssetsOptions {
  /**
   * The directory to output the car files to.
   */
  outputDir: string;

  /**
   * iRacing username.
   * @default undefined
   */
  username?: string;

  /**
   * Write full car info to the output directory.
   * @default false
   */
  writeFullInfo?: boolean;

  /**
   * Write full car assets to the output directory.
   * @default false
   */
  writeFullAssets?: boolean;

  /**
   * Skip writing track info for each track.
   * @default false
   */
  skipCarInfo?: boolean;

  /**
   * Skip writing track assets for each track.
   * @default false
   */
  skipCarAssets?: boolean;
}

/**
 * Downloads car assets to the provided output directory.
 * The output directory will contain a `cars.json` file with the car assets,
 * and a `car-info.json` file with the car information.
 *
 * @param options The options for the download.
 * @param client The client to use for the download.
 */
export async function syncCarAssets(
  {
    outputDir,
    username: usernameProp,
    writeFullAssets = false,
    writeFullInfo = false,
    skipCarInfo = false,
    skipCarAssets = false,
  }: SyncCarAssetsOptions,
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
    await client.authenticate({ username, hashedPassword });
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
  const [cars, carInfo] = await Promise.all([
    client.carAssets(),
    client.carGet(),
  ]);

  /**
   * Write the data if requested.
   */
  if (writeFullAssets) {
    const carAssetsPath = path.join(outputDir, "cars.json");
    console.log("Writing full car assets to:", carAssetsPath);
    await writeFile(carAssetsPath, JSON.stringify(cars), "utf8");
  }

  if (writeFullInfo) {
    const carInfoPath = path.join(outputDir, "car-info.json");
    console.log("Writing full car info to:", carInfoPath);
    await writeFile(carInfoPath, JSON.stringify(carInfo), "utf8");
  }

  console.log("Downloading assets for", Object.keys(cars).length, "cars.");

  for (const [carId, asset] of Object.entries(cars)) {
    const info = carInfo.find((c) => c.car_id === +carId);
    const trackDir = path.join(outputDir, carId);
    const assetPath = path.join(trackDir, "assets.json");
    const infoPath = path.join(trackDir, "info.json");

    const trackDirExists = await exists(trackDir);
    if (!trackDirExists) {
      await mkdir(trackDir, { recursive: true });
    }

    console.log("Getting car with ID:", carId);

    if (!skipCarAssets) {
      console.log("\tWriting car asset to:", assetPath);
      await writeFile(assetPath, JSON.stringify(asset), "utf8");
    }

    if (!skipCarInfo) {
      if (info) {
        console.log("\tWriting car info to:", infoPath);
        await writeFile(infoPath, JSON.stringify(info), "utf8");
      } else {
        console.log("\tNo car info found for car ID:", carId);
      }
    }

    // TODO: Download images.
  }
}

export default syncCarAssets;
