import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";
import { normalizeClientPresentation } from "./normalize-client-presentation.js";
import { normalizeRustPresentation } from "./normalize-rust-presentation.mjs";

const templates = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "client-presentation",
);
function fixture(t) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "presentation-test-"),
  );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

for (const client of ["fetch", "axios"]) {
  test(`${client} overlay preserves release/build fields and is idempotent`, (t) => {
    const directory = fixture(t);
    const manifest = {
      name: "fixture",
      version: "9.8.7",
      scripts: { build: "custom" },
      dependencies: { dependency: "1" },
      author: "generator",
    };
    fs.writeFileSync(
      path.join(directory, "package.json"),
      JSON.stringify(manifest),
    );
    const heading =
      client === "fetch"
        ? "## Documentation"
        : "### Documentation for API Endpoints";
    fs.writeFileSync(
      path.join(directory, "README.md"),
      `Generated intro\r\n${heading}\r\nendpoint documentation\r\n`,
    );
    normalizeClientPresentation(client, directory, templates);
    const after = fs.readFileSync(path.join(directory, "package.json"), "utf8");
    const readme = fs.readFileSync(path.join(directory, "README.md"), "utf8");
    const result = JSON.parse(after);
    assert.equal(result.version, manifest.version);
    assert.deepEqual(result.scripts, manifest.scripts);
    assert.deepEqual(result.dependencies, manifest.dependencies);
    assert.equal(result.license, "MIT");
    assert.equal(result.author, undefined);
    assert.ok(readme.includes("endpoint documentation"));
    assert.ok(!readme.includes("Generated intro"));
    normalizeClientPresentation(client, directory, templates);
    assert.equal(
      fs.readFileSync(path.join(directory, "package.json"), "utf8"),
      after,
    );
    assert.equal(
      fs.readFileSync(path.join(directory, "README.md"), "utf8"),
      readme,
    );
  });
}

test("Rust overlay owns presentation and lint inheritance, preserving release/dependencies", (t) => {
  const directory = fixture(t);
  fs.writeFileSync(
    path.join(directory, "Cargo.toml"),
    '[package]\nname = "fixture"\nversion = "9.8.7"\nedition = "2021"\nlicense = "Unlicense"\nauthors = ["generator"]\n[dependencies]\nserde = "1"\n[features]\ndefault = []\n',
  );
  fs.writeFileSync(
    path.join(directory, "README.md"),
    "Generated intro\n## Documentation for API Endpoints\nendpoint documentation\n",
  );
  normalizeRustPresentation(directory, templates);
  const after = fs.readFileSync(path.join(directory, "Cargo.toml"), "utf8");
  const readme = fs.readFileSync(path.join(directory, "README.md"), "utf8");
  const result = parse(after);
  assert.equal(result.package.version, "9.8.7");
  assert.equal(result.package.edition, "2021");
  assert.ok(readme.includes('= "9.8.7"'));
  assert.equal(result.dependencies.serde, "1");
  assert.deepEqual(result.features.default, []);
  assert.equal(result.package.license, "MIT");
  assert.deepEqual(result.package.authors, ["iRacing Data API contributors"]);
  assert.equal(result.lints.workspace, true);
  assert.ok(readme.includes("endpoint documentation"));
  normalizeRustPresentation(directory, templates);
  assert.equal(
    fs.readFileSync(path.join(directory, "Cargo.toml"), "utf8"),
    after,
  );
  assert.equal(
    fs.readFileSync(path.join(directory, "README.md"), "utf8"),
    readme,
  );
});

test("missing generated headings fail before modifying manifests", (t) => {
  for (const client of ["fetch", "axios", "rust"]) {
    const directory = fixture(t);
    const name = client === "rust" ? "Cargo.toml" : "package.json";
    const before =
      client === "rust"
        ? '[package]\nname="fixture"\nversion="1.0.0"\n'
        : '{"version":"1.0.0"}';
    fs.writeFileSync(path.join(directory, name), before);
    fs.writeFileSync(path.join(directory, "README.md"), "No heading");
    assert.throws(
      () =>
        client === "rust"
          ? normalizeRustPresentation(directory, templates)
          : normalizeClientPresentation(client, directory, templates),
      /heading/,
    );
    assert.equal(fs.readFileSync(path.join(directory, name), "utf8"), before);
  }
});

test("presentation templates cannot overwrite release versions", (t) => {
  const directory = fixture(t);
  const overlay = fixture(t);
  for (const client of ["fetch", "rust"]) {
    fs.writeFileSync(
      path.join(overlay, `${client}.json`),
      '{"version":"0.0.0"}',
    );
    fs.writeFileSync(
      path.join(directory, client === "rust" ? "Cargo.toml" : "package.json"),
      client === "rust"
        ? '[package]\nversion="1.0.0"\n'
        : '{"version":"1.0.0"}',
    );
    assert.throws(
      () =>
        client === "rust"
          ? normalizeRustPresentation(directory, overlay)
          : normalizeClientPresentation(client, directory, overlay),
      /Not a presentation field/,
    );
  }
});
