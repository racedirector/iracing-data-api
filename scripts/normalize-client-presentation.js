/**
 * Authored public presentation overlay for generated Fetch/Axios packages.
 *
 * client-presentation/{fetch,axios}.json owns only allowlisted metadata; matching
 * Markdown owns the README introduction. Preserve generated endpoint/model sections
 * from their known heading and replace the development footer consistently. Missing
 * headings or unknown metadata fields fail rather than guessing a boundary.
 *
 * Versions, dependencies, scripts and entry points are reviewed manifest/generator
 * intent, not presentation fields. A presentation-only edit can invoke this module
 * and scoped formatting without rebuilding OpenAPI/SDKs. Isolated freshness tests
 * still verify the overlay against generation. Do not insert architecture comments
 * into the templates: they would become consumer-visible generated output.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function normalizeClientPresentation(
  client,
  directory,
  sourceDirectory,
) {
  if (!["fetch", "axios"].includes(client)) {
    throw new Error("Expected fetch or axios client");
  }
  const source = path.join(sourceDirectory, client);
  const manifestPath = path.join(directory, "package.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const metadata = JSON.parse(fs.readFileSync(`${source}.json`, "utf8"));
  const allowed = new Set([
    "description",
    "license",
    "repository",
    "homepage",
    "bugs",
    "keywords",
  ]);
  for (const key of Object.keys(metadata)) {
    if (!allowed.has(key)) throw new Error(`Not a presentation field: ${key}`);
  }
  const readmePath = path.join(directory, "README.md");
  const readme = fs.readFileSync(readmePath, "utf8").replace(/\r\n/g, "\n");
  const heading =
    client === "fetch"
      ? "## Documentation\n"
      : "### Documentation for API Endpoints\n";
  const index = readme.indexOf(heading);
  if (index === -1) {
    throw new Error(`Missing generated documentation heading in ${readmePath}`);
  }

  // Keep generator-owned dependencies, entry points, scripts, and versions intact.
  Object.assign(manifest, metadata);
  delete manifest.author;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const intro = fs.readFileSync(`${source}.md`, "utf8").trimEnd();
  const documentation = readme
    .slice(index)
    .replace(
      /## Development\n[\s\S]*$/,
      "## Development\n\nSee the [repository development and release instructions](https://github.com/racedirector/iracing-data-api#development).\n\n## License\n\n[MIT](https://github.com/racedirector/iracing-data-api/blob/main/LICENSE).\n",
    );
  fs.writeFileSync(readmePath, `${intro}\n\n${documentation}`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const client = process.argv[2];
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(scriptDirectory, "..");
  normalizeClientPresentation(
    client,
    process.argv[3] || path.join(root, "packages/api/client", client || ""),
    path.join(scriptDirectory, "client-presentation"),
  );
}
