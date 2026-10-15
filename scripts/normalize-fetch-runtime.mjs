import fs from "node:fs";

// The generator's DOM-only fetch alias becomes an error type in Node projects.
// globalThis supplies the host's fetch declaration in both Node and browsers.
const file = process.argv[2];
if (file?.endsWith("/runtime.ts")) {
  const source = fs.readFileSync(file, "utf8");
  fs.writeFileSync(
    file,
    source.replaceAll(
      /WindowOrWorkerGlobalScope\[(["'])fetch\1\]/g,
      "typeof globalThis.fetch",
    ),
  );
}
