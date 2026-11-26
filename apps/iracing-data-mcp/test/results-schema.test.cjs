/**
 * Non-stripping validation of every committed result fixture against the
 * authored payload schema. The schema package keeps inline unit cases; this test
 * proves the real documents round-trip without losing additive upstream fields.
 */
const assert = require("node:assert/strict");
const { readFileSync, readdirSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const directory = path.join(__dirname, "fixtures", "results");

test("every committed fixture validates without stripping upstream fields", async () => {
  const { RaceResultPayloadSchema } = await import("@iracing-data/api-schema");

  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort();
  assert.equal(files.length, 7);

  for (const file of files) {
    const document = JSON.parse(
      readFileSync(path.join(directory, file), "utf8"),
    );
    const parsed = RaceResultPayloadSchema.parse(document);
    assert.deepEqual(parsed, document, `${file} must not be stripped`);

    const main = parsed.session_results.filter(
      (session) => session.simsession_number === 0,
    );
    assert.equal(main.length, 1, `${file} must have exactly one main event`);

    const numbers = parsed.session_results.map(
      (session) => session.simsession_number,
    );
    assert.equal(
      new Set(numbers).size,
      numbers.length,
      `${file} must not repeat simsession numbers`,
    );
  }
});

test("schema rejects a document without a main event or with duplicate sessions", async () => {
  const { RaceResultPayloadSchema } = await import("@iracing-data/api-schema");
  const document = JSON.parse(
    readFileSync(path.join(directory, "individual.json"), "utf8"),
  );

  const noMain = structuredClone(document);
  noMain.session_results = noMain.session_results.filter(
    (session) => session.simsession_number !== 0,
  );
  assert.equal(RaceResultPayloadSchema.safeParse(noMain).success, false);

  const duplicate = structuredClone(document);
  duplicate.session_results.push(
    structuredClone(
      duplicate.session_results.find(
        (session) => session.simsession_number === 0,
      ),
    ),
  );
  assert.equal(RaceResultPayloadSchema.safeParse(duplicate).success, false);

  const noResults = structuredClone(document);
  delete noResults.session_results[0].results;
  assert.equal(RaceResultPayloadSchema.safeParse(noResults).success, false);
});
