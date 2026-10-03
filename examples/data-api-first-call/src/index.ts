import { CarApi, Configuration } from "@iracing-data/api-client-fetch";

async function main() {
  const accessToken = process.env.IRACING_ACCESS_TOKEN;
  if (!accessToken)
    throw new Error("Set IRACING_ACCESS_TOKEN to an existing bearer token.");

  const api = new CarApi(new Configuration({ accessToken }));
  const response = await api.getCar();
  if (!response.link)
    throw new Error("The Data API did not return a cached-data link.");

  // Fetch cached data separately; do not forward the bearer token.
  const dataResponse = await fetch(response.link);
  if (!dataResponse.ok)
    throw new Error(`Cached data request failed: HTTP ${dataResponse.status}`);
  const cars: unknown = await dataResponse.json();
  console.log(JSON.stringify(cars, null, 2));
}

main().catch((error: unknown) => {
  if (
    error instanceof Error &&
    "response" in error &&
    error.response instanceof Response
  ) {
    console.error(
      `Data API request failed: HTTP ${error.response.status}. Check token validity, scope, and account access.`,
    );
  } else {
    console.error(
      error instanceof Error ? error.message : "Data API request failed.",
    );
  }
  process.exitCode = 1;
});
