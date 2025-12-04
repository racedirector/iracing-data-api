import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  InMemoryStore,
  InternalState,
  IRacingOAuthTokenResponse,
  OAuthClient,
} from "@iracing-data/oauth-client";
import {
  CarApi,
  Configuration,
  ConstantsApi,
  IracingAPIResponse,
  LookupApi,
  MemberApi,
  Middleware,
  SeriesApi,
  TrackApi,
} from "@iracing-data/api-client-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_PATH = "output";
function makeOutputPath(...paths: string[]) {
  return path.join(__dirname, OUTPUT_PATH, ...paths);
}

async function fetchIRacingLink({ link, expires }: IracingAPIResponse) {
  if (new Date() >= expires) {
    throw new Error("Data is expired. Try fetching again.");
  }

  console.log("Fetching from link:", link);

  const response = await fetch(link);
  const data = await response.json();

  console.log("Fetched data from iRacing:", data);

  return data;
}

async function writeResponseDataToFile(
  filePath: string,
  response: IracingAPIResponse
) {
  const outputPath = makeOutputPath(filePath);

  console.log("Writing output:", outputPath);

  const data = await fetchIRacingLink(response);

  await fs.writeFile(outputPath, JSON.stringify(data));

  console.log("Successfully wrote output:", outputPath);
}

/**
 * TODO: Implement middleware to avoid what's happening with the fetchIRacingLink
 */
// const postMiddleware: Middleware["post"] = async ({ fetch, response }) => {};

async function fetchSeries(configuration: Configuration) {
  const series = new SeriesApi(configuration);
  const seriesAssetsResponse = await series.getSeriesAssets();
  const seriesResponse = await series.getSeries();

  await Promise.all([
    writeResponseDataToFile("series-assets.json", seriesAssetsResponse),
    writeResponseDataToFile("series.json", seriesResponse),
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
  const trackAssetsResponse = await track.getTrackAssets();
  const trackResponse = await track.getTrack();

  await Promise.all([
    writeResponseDataToFile("track-assets.json", trackAssetsResponse),
    writeResponseDataToFile("track.json", trackResponse),
  ]);
}

async function fetchConstants(configuration: Configuration) {
  const constants = new ConstantsApi(configuration);

  await Promise.all([
    writeResponseDataToFile(
      "categories.json",
      await constants.getConstantsCategories()
    ),
    writeResponseDataToFile(
      "divisions.json",
      await constants.getConstantsDivisions()
    ),
    writeResponseDataToFile(
      "event-types.json",
      await constants.getConstantsEventTypes()
    ),
  ]);
}

async function fetchLookup(configuration: Configuration) {
  const lookup = new LookupApi(configuration);
  const countriesResponse = await lookup.getLookupCountries();
  const licensesResponse = await lookup.getLookupLicenses();
  const flairsResponse = await lookup.getLookupFlairs();

  await Promise.all([
    writeResponseDataToFile("countries.json", countriesResponse),
    writeResponseDataToFile("licenses.json", licensesResponse),
    writeResponseDataToFile("flairs.json", flairsResponse),
  ]);
}

async function main() {
  const sessionId = "example-session";

  const stateStore = new InMemoryStore<string, InternalState>();
  const sessionStore = new InMemoryStore<string, IRacingOAuthTokenResponse>();

  const client = new OAuthClient({
    clientMetadata: {
      clientId: process.env.IRACING_AUTH_CLIENT!,
      clientSecret: process.env.IRACING_AUTH_SECRET,
      username: process.env.IRACING_AUTH_USERNAME,
      password: process.env.IRACING_AUTH_PASSWORD,
      scopes: ["iracing.auth", "iracing.profile"],
    },
    stateStore,
    sessionStore,
  });

  const token = await client.passwordLimitedAuthorization(sessionId);

  console.info("Successfully authenticated!");
  console.info("Token expires in", token.expires_in, "seconds");

  const savedToken = await client.getSession(sessionId);
  console.info("Stored session", savedToken);

  const configuration = new Configuration({
    accessToken: token.access_token,
  });

  const member = new MemberApi(configuration);
  const response = await member.getMemberProfile();
  console.info("Fetched authenticated member:", response);

  const [cars, tracks, series, lookup, constants] = await Promise.allSettled([
    fetchCars,
    fetchTracks,
    fetchSeries,
    fetchLookup,
    fetchConstants,
  ]);

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

  console.log("Fetched assets from `/data` API.");
}

main();
