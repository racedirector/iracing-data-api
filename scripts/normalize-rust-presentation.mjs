import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "smol-toml";

export function normalizeRustPresentation(directory, sourceDirectory) {
  const manifestPath = path.join(directory, "Cargo.toml");
  const manifest = parse(fs.readFileSync(manifestPath, "utf8"));
  const metadata = JSON.parse(
    fs.readFileSync(path.join(sourceDirectory, "rust.json"), "utf8"),
  );
  const allowed = new Set([
    "description",
    "license",
    "authors",
    "repository",
    "homepage",
    "documentation",
    "keywords",
    "categories",
  ]);
  for (const key of Object.keys(metadata)) {
    if (!allowed.has(key)) throw new Error(`Not a presentation field: ${key}`);
  }
  const readmePath = path.join(directory, "README.md");
  const readme = fs.readFileSync(readmePath, "utf8").replace(/\r\n/g, "\n");
  const heading = "## Documentation for API Endpoints\n";
  const index = readme.indexOf(heading);
  if (index < 0)
    throw new Error("Missing generated Rust documentation heading");
  Object.assign(manifest.package, metadata);
  manifest.lints = { workspace: true };
  fs.writeFileSync(manifestPath, stringify(manifest));
  const intro = fs
    .readFileSync(path.join(sourceDirectory, "rust.md"), "utf8")
    .replaceAll("{{version}}", manifest.package.version)
    .trimEnd();
  fs.writeFileSync(readmePath, `${intro}\n\n${readme.slice(index)}`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  normalizeRustPresentation(
    process.argv[2] ||
      path.join(directory, "../crates/iracing-data-api-client"),
    path.join(directory, "client-presentation"),
  );
}
