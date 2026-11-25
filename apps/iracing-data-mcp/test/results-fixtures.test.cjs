/**
 * Provenance and sanitization checks for the committed #569 result fixtures.
 *
 * These fixtures are hand-derived from live `/results/get` captures, so this test
 * locks the structural claims in docs/reviews/569-results-get-evidence.md and
 * fails if a fixture is replaced with unsanitized or structurally different data.
 */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const directory = path.join(__dirname, "fixtures", "results");

const fixtures = {
  "individual.json": {
    sessions: [-2, -1, 0],
    event: 5,
    team: false,
  },
  "team-multiclass.json": {
    sessions: [-2, -1, 0],
    event: 5,
    team: true,
    classes: 3,
  },
  "timed-partial.json": {
    sessions: [-2, -1, 0],
    event: 5,
    team: false,
  },
  "league-team.json": {
    sessions: [-2, -1, 0],
    event: 5,
    team: true,
    league: 6529,
  },
  "league-heats.json": {
    sessions: [-4, -3, -2, -1, 0],
    event: 5,
    team: false,
    league: 8579,
    names: ["HEAT 1", "WARMUP", "FEATURE"],
  },
  "dirt-heats.json": {
    sessions: [-5, -4, -3, -2, 0],
    event: 5,
    team: false,
    names: ["HEAT 1", "HEAT 2", "FEATURE"],
  },
  "practice-only.json": {
    sessions: [0],
    event: 2,
    team: false,
    names: ["PRACTICE"],
  },
};

const load = (file) =>
  JSON.parse(readFileSync(path.join(directory, file), "utf8"));

const rows = (document) =>
  document.session_results.flatMap((session) => session.results);

test("commits exactly the documented fixture set", () => {
  const files = require("node:fs")
    .readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort();

  assert.deepEqual(files, Object.keys(fixtures).sort());
});

for (const [file, expected] of Object.entries(fixtures)) {
  test(`${file} keeps its documented structure`, () => {
    const document = load(file);

    assert.ok(Number.isSafeInteger(document.subsession_id));
    assert.ok(document.subsession_id > 0);
    assert.equal(document.event_type, expected.event);
    assert.deepEqual(
      document.session_results.map((session) => session.simsession_number),
      expected.sessions,
    );

    const main = document.session_results.find(
      (session) => session.simsession_number === 0,
    );
    assert.ok(main, "fixture must contain the main event at simsession 0");
    assert.ok(main.results.length > 0);

    const names = document.session_results.map(
      (session) => session.simsession_name,
    );
    for (const name of expected.names ?? []) {
      assert.ok(names.includes(name), `${file} is missing session ${name}`);
    }

    const driverCount = main.results.reduce(
      (total, row) => total + (row.driver_results?.length ?? 1),
      0,
    );
    assert.equal(document.num_drivers, driverCount);

    const positions = main.results.map((row) => row.finish_position);
    assert.equal(Math.min(...positions), 0, "positions are 0-based");
    assert.ok(positions.every((position) => Number.isInteger(position)));

    for (const row of rows(document)) {
      if (expected.team) {
        assert.ok(Number.isInteger(row.team_id) && row.team_id < 0);
        assert.ok(
          Array.isArray(row.driver_results) && row.driver_results.length,
        );
      } else {
        assert.ok(Number.isInteger(row.cust_id) && row.cust_id > 0);
        assert.equal(row.team_id, undefined);
      }
    }

    if (expected.league === undefined) {
      assert.equal(document.league_id, undefined);
      assert.ok(document.series_id > 0);
      assert.equal(document.private_session_id, -1);
      assert.ok(Array.isArray(document.allowed_licenses));
    } else {
      assert.equal(document.league_id, expected.league);
      assert.equal(document.series_id, 0);
      assert.equal(document.season_id, 0);
      assert.equal(document.official_session, false);
      assert.ok(document.private_session_id > 0);
      assert.equal(document.allowed_licenses, undefined);
      assert.ok(typeof document.session_name === "string");
      assert.ok(Number.isInteger(document.host_id));
    }

    if (expected.classes) {
      const classes = new Set(main.results.map((row) => row.car_class_id));
      assert.equal(classes.size, expected.classes);
    }
  });

  test(`${file} contains no unsanitized identities`, () => {
    const document = load(file);

    for (const row of rows(document)) {
      assert.match(row.display_name, /^Synthetic (Team|Driver) \d{2}$/);
      if (row.cust_id !== undefined) {
        assert.ok(row.cust_id >= 800000, "customer ids must be synthetic");
      }
      if (row.team_id !== undefined) {
        assert.ok(row.team_id <= -800000, "team ids must be synthetic");
      }
      if (row.livery) {
        assert.match(String(row.livery.car_number), /^\d{1,3}$/);
      }
      for (const driver of row.driver_results ?? []) {
        assert.match(driver.display_name, /^Synthetic Driver \d{2}$/);
        assert.ok(driver.cust_id >= 800000);
      }
    }
  });

  test(`${file} stays small enough to review`, () => {
    const bytes = readFileSync(path.join(directory, file)).byteLength;
    assert.ok(bytes < 250_000, `${file} is ${bytes} bytes`);
  });
}

test("fixtures cover the documented status and format variety", () => {
  const reasons = new Set(
    Object.keys(fixtures).flatMap((file) =>
      rows(load(file)).map((row) => row.reason_out),
    ),
  );
  assert.ok(reasons.has("Running"));
  assert.ok(reasons.has("Disconnected"));
  assert.ok(reasons.has("Disqualified"));

  const team = load("team-multiclass.json");
  assert.ok(
    team.session_results[0].results.some(
      (row) => (row.driver_results?.length ?? 0) > 1,
    ),
  );

  const dirt = load("dirt-heats.json");
  assert.ok(dirt.heat_info_id > 0);
});
