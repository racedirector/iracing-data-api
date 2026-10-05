import { writeFile } from "node:fs/promises";
import path from "node:path";
import { Configuration, ConstantsApi } from "@iracing-data/api-client-fetch";

export async function fetchConstants(
  configuration: Configuration,
  outputDirectory: string,
) {
  const constants = new ConstantsApi(configuration);
  // These endpoints return data directly, without a cache-link envelope.
  await Promise.all([
    constants
      .getConstantsCategories()
      .then((data) =>
        writeFile(
          path.join(outputDirectory, "categories.json"),
          JSON.stringify(data),
        ),
      ),
    constants
      .getConstantsDivisions()
      .then((data) =>
        writeFile(
          path.join(outputDirectory, "divisions.json"),
          JSON.stringify(data),
        ),
      ),
    constants
      .getConstantsEventTypes()
      .then((data) =>
        writeFile(
          path.join(outputDirectory, "event-types.json"),
          JSON.stringify(data),
        ),
      ),
  ]);
}
