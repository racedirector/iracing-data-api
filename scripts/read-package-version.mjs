import fs from "node:fs";
import { parse } from "smol-toml";

const file = process.argv[2];
const contents = fs.readFileSync(file, "utf8");
const manifest = file.endsWith(".toml")
  ? parse(contents).package
  : JSON.parse(contents);
if (
  typeof manifest.version !== "string" ||
  !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
    manifest.version,
  )
) {
  throw new Error(`Invalid package version in ${file}`);
}
process.stdout.write(manifest.version);
