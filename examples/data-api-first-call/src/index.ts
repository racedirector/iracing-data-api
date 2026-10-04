import { DocApi, Configuration } from "@iracing-data/api-client-fetch";

async function main() {
  const accessToken = process.env.IRACING_ACCESS_TOKEN;
  if (!accessToken)
    throw new Error(
      "Set IRACING_ACCESS_TOKEN in .env or your environment to an existing bearer token.",
    );

  const api = new DocApi(new Configuration({ accessToken }));
  const docs = await api.getDocs();
  console.log(JSON.stringify(docs, null, 2));
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
