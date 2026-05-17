import {
  access,
  constants,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CarApi,
  Configuration,
  ConstantsApi,
  DocApi,
  IracingAPIResponse,
  LookupApi,
  MemberApi,
  SeriesApi,
  TrackApi,
} from "@iracing-data/api-client-fetch";
import {
  InMemoryStore,
  InternalState,
  DiskStore,
  OAuthRefreshError,
} from "@iracing-data/oauth-client";
import {
  IRacingOAuthTokenResponse,
  OAuthClient,
} from "@iracing-data/oauth-client/dist/client";
import {
  TrackAssetEntryType,
  TrackAssetJSONFileSchema,
} from "./schema/trackAssets";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRootDir = path.join(__dirname, "..");
const outputPath = path.join(projectRootDir, "output");
const credentialsPath = path.join(outputPath, "credentials.json");

function makeOutputPath(...paths: string[]) {
  return path.join(outputPath, ...paths);
}

/**
 * Checks if a file exists.
 * @param path the path of the file
 * @returns true if the file exists, false otherwise
 */
const exists = async (path: string) => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

async function fetchIRacingLink({
  link,
  expires,
}: Partial<IracingAPIResponse>) {
  if (!expires) return;

  if (new Date() >= expires) {
    throw new Error("Data is expired. Try fetching again.");
  }

  if (link) {
    const response = await fetch(link);
    return await response.json();
  }
}

async function writeResponseDataToFile(
  filePath: string,
  response: IracingAPIResponse,
) {
  const outputPath = makeOutputPath(filePath);

  const data = await fetchIRacingLink(response);

  if (data) {
    await writeFile(outputPath, JSON.stringify(data));
  }
}

/**
 * TODO: Implement middleware to avoid what's happening with the fetchIRacingLink
 */
// const postMiddleware: Middleware["post"] = async ({ fetch, response }) => {};

async function fetchSeries(configuration: Configuration) {
  const series = new SeriesApi(configuration);

  await Promise.all([
    writeResponseDataToFile(
      "series-assets.json",
      await series.getSeriesAssets(),
    ),
    writeResponseDataToFile("series.json", await series.getSeries()),
  ]);
}

async function fetchCars(configuration: Configuration) {
  const car = new CarApi(configuration);
  const carAssetsResponse = await car.getCarAssets();
  const carResponse = await car.getCar();

  await Promise.all([
    writeResponseDataToFile("car-assets.json", carAssetsResponse),
    writeResponseDataToFile("car.json", carResponse),
  ]);
}

async function fetchTracks(configuration: Configuration) {
  const track = new TrackApi(configuration);

  await Promise.all([
    writeResponseDataToFile("track-assets.json", await track.getTrackAssets()),
    writeResponseDataToFile("track.json", await track.getTrack()),
  ]);
}

async function fetchConstants(configuration: Configuration) {
  const constants = new ConstantsApi(configuration);

  await Promise.all([
    writeResponseDataToFile(
      "categories.json",
      await constants.getConstantsCategories(),
    ),
    writeResponseDataToFile(
      "divisions.json",
      await constants.getConstantsDivisions(),
    ),
    writeResponseDataToFile(
      "event-types.json",
      await constants.getConstantsEventTypes(),
    ),
  ]);
}

async function fetchLookup(configuration: Configuration) {
  const lookup = new LookupApi(configuration);

  await Promise.all([
    writeResponseDataToFile(
      "countries.json",
      await lookup.getLookupCountries(),
    ),
    writeResponseDataToFile("licenses.json", await lookup.getLookupLicenses()),
    writeResponseDataToFile("flairs.json", await lookup.getLookupFlairs()),
  ]);
}

async function fetchDocs(configuration: Configuration) {
  const docs = new DocApi(configuration);
  const outputPath = makeOutputPath("docs.json");
  const data = await docs.getDocs();
  if (data) {
    await writeFile(outputPath, JSON.stringify(data));
  }
}

async function fetchTrackSVGLayer(url: URL, outputPath: string) {
  const response = await fetch(url);
  const data = await response.text();
  await writeFile(outputPath, data, {
    encoding: "utf-8",
  });
}

async function fetchTrackSVGs(
  track: TrackAssetEntryType,
  outputDir: string,
  accessToken?: string,
) {
  const trackOutputDir = path.join(outputDir, track.track_id.toString());

  const outputExists = await exists(trackOutputDir);
  if (!outputExists) {
    await mkdir(trackOutputDir, { recursive: true });
  }

  const trackMapURLPath = track.track_map;
  const fetchLayers = Object.values(track.track_map_layers).map(
    async (layer) => {
      const response = await fetch(new URL(layer, trackMapURLPath), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.text();
      await writeFile(path.join(trackOutputDir, layer), data, {
        encoding: "utf-8",
      });
    },
  );

  await Promise.allSettled(fetchLayers);
}

async function fetchTracksSVGAssets(accessToken?: string) {
  const trackAssetsContents = await readFile(
    path.join(outputPath, "track-assets.json"),
    { encoding: "utf-8" },
  );

  const trackAssetsJson = JSON.parse(trackAssetsContents);

  const result = TrackAssetJSONFileSchema.safeParse(trackAssetsJson);
  if (!result.success) {
    throw result.error;
  }

  console.log("Fetching SVG assets for tracks...");

  const trackSVGOutputDir = path.join(outputPath, "tracks");
  const tracks = Object.values(result.data);

  // This will fetch all of a tracks layers asynchronously, one track at a time.
  for (const track of tracks) {
    await fetchTrackSVGs(track, trackSVGOutputDir, accessToken);
  }

  console.log("Successfully fetched SVG assets. See:", trackSVGOutputDir);
}

async function fetchData(configuration: Configuration, accessToken?: string) {
  /**
   * Create the output dir if it doesn't exist
   */
  const outputExists = await exists(outputPath);
  if (!outputExists) {
    await mkdir(outputPath, { recursive: true });
  }

  const [docs, cars, tracks, series, lookup, constants] =
    await Promise.allSettled([
      fetchDocs(configuration),
      fetchCars(configuration),
      fetchTracks(configuration),
      fetchSeries(configuration),
      fetchLookup(configuration),
      fetchConstants(configuration),
    ]);

  if (docs.status === "rejected") {
    console.log("Could not fetch docs. Reason:", docs.reason);
  }
  if (cars.status === "rejected") {
    console.log("Could not fetch cars. Reason:", cars.reason);
  }
  if (tracks.status === "rejected") {
    console.log("Could not fetch tracks. Reason:", tracks.reason);
  }
  if (series.status === "rejected") {
    console.log("Could not fetch series. Reason:", series.reason);
  }
  if (lookup.status === "rejected") {
    console.log("Could not fetch lookup. Reason:", lookup.reason);
  }
  if (constants.status === "rejected") {
    console.log("Could not fetch constants. Reason:", constants.reason);
  }

  if (tracks.status !== "rejected") {
    await fetchTracksSVGAssets(accessToken);
  }
}

async function main() {
  const stateStore = new InMemoryStore<string, InternalState>();
  const sessionStore = new DiskStore<string, IRacingOAuthTokenResponse>(
    credentialsPath,
  );

  const username = process.env.IRACING_AUTH_USERNAME;

  const client = new OAuthClient({
    clientMetadata: {
      clientId: process.env.IRACING_AUTH_CLIENT!,
      clientSecret: process.env.IRACING_AUTH_SECRET,
      username,
      password: process.env.IRACING_AUTH_PASSWORD,
      scopes: ["iracing.auth", "iracing.profile"],
    },
    stateStore,
    sessionStore,
  });

  let session: IRacingOAuthTokenResponse | undefined;
  try {
    session = await client.restoreSession(username!);
    if (!session) {
      console.log("Could not find existing session. Authenticating...");
      session = await client.passwordLimitedAuthorization();
      console.info("Successfully authenticated!", session);
    } else {
      console.log("Continuing with discovered credentials...");
    }
  } catch (error) {
    if (error instanceof OAuthRefreshError) {
      session = await client.passwordLimitedAuthorization();
    }

    if (!session) {
      throw new Error("Failed to restore session!");
    }
  }

  const configuration = new Configuration({
    accessToken: session.access_token,
  });

  await fetchData(configuration, session.access_token);

  console.log("Fetched assets from `/data` API.");
}

main();
