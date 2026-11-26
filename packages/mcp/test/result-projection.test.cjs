const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const fixtureDirectory = path.join(
  __dirname,
  "../../../apps/iracing-data-mcp/test/fixtures/results",
);

const load = (name) =>
  JSON.parse(readFileSync(path.join(fixtureDirectory, `${name}.json`), "utf8"));

const provenance = {
  fetchedAt: 1_700_000_000_000,
  revalidateAfter: 1_700_086_400_000,
  contentHash: `sha256:${"a".repeat(64)}`,
};

const api = () => import("../dist/index.js");
const schema = () => import("@iracing-data/api-schema");

test("projects every committed fixture without stripping protocol facts", async () => {
  const { createRaceResultProjection, RACE_RESULT_RESOURCE_BYTE_LIMIT } =
    await api();
  const { RaceResultPayloadSchema } = await schema();

  for (const name of [
    "individual",
    "team-multiclass",
    "timed-partial",
    "league-team",
    "league-heats",
    "dirt-heats",
    "practice-only",
  ]) {
    const document = RaceResultPayloadSchema.parse(load(name));
    const { projection, json, bytes } = createRaceResultProjection(
      document,
      provenance,
    );

    assert.equal(projection.subsession_id, document.subsession_id);
    assert.equal(projection.projection_version, 1);
    assert.equal(projection.source_path, "/data/results/get");
    assert.equal(projection.content_hash, provenance.contentHash);
    assert.equal(projection.oversized, false);
    assert.ok(bytes <= RACE_RESULT_RESOURCE_BYTE_LIMIT);
    assert.equal(bytes, new TextEncoder().encode(json).byteLength);
    assert.deepEqual(JSON.parse(json), projection);

    assert.equal(projection.sessions.length, document.session_results.length);
    for (const [index, session] of document.session_results.entries()) {
      const indexEntry = projection.sessions[index];
      assert.equal(indexEntry.simsession_number, session.simsession_number);
      assert.equal(indexEntry.entry_count, session.results.length);
      assert.equal(indexEntry.is_main_event, session.simsession_number === 0);
    }

    const main = document.session_results.find(
      (session) => session.simsession_number === 0,
    );
    assert.equal(projection.main_event.simsession_number, 0);
    assert.equal(projection.main_event.entry_count, main.results.length);
    assert.equal(projection.main_event.results.length, main.results.length);
    assert.equal(
      projection.main_event.driver_count,
      main.results.reduce(
        (total, entry) => total + (entry.driver_results?.length ?? 1),
        0,
      ),
    );
  }
});

test("keeps 0-based positions, team nesting and status values intact", async () => {
  const { createRaceResultProjection } = await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("team-multiclass"));
  const { projection } = createRaceResultProjection(document, provenance);
  const results = projection.main_event.results;

  assert.equal(results.length, 6);
  assert.equal(results[0].attribution, "team");
  assert.ok(results[0].team_id < 0);
  assert.equal(results[0].finish_position, 0);
  assert.deepEqual(Object.keys(results[0].drivers[0]).sort(), [
    "cust_id",
    "display_name",
    "team_id",
  ]);
  assert.ok(results.some((entry) => entry.reason_out === "Disconnected"));
  const classes = new Set(results.map((entry) => entry.car_class_id));
  assert.equal(classes.size, 3);
  assert.equal(projection.main_event.class_count, 3);
});

test("never labels a practice-only document as a race", async () => {
  const { createRaceResultProjection } = await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("practice-only"));
  const { projection } = createRaceResultProjection(document, provenance);

  assert.equal(projection.event.event_type, 2);
  assert.equal(projection.main_event.simsession_name, "PRACTICE");
  assert.equal(projection.main_event.is_main_event, true);
  assert.equal(projection.sessions.length, 1);
  assert.equal(projection.event.official_session, true);
});

test("projects league metadata without private or license material", async () => {
  const { createRaceResultProjection } = await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("league-team"));
  const { projection, json } = createRaceResultProjection(document, provenance);

  assert.equal(projection.event.league_id, 6529);
  assert.equal(projection.event.series_id, 0);
  assert.equal(projection.event.official_session, false);
  assert.equal(projection.event.host_id >= 0, true);
  assert.equal(projection.event.session_name.length > 0, true);
  assert.equal("private_session_id" in projection.event, false);
  assert.equal("allowed_licenses" in projection.event, false);
  assert.equal("limit_minutes" in projection.event, false);
  assert.equal("special_event_type" in projection.event, false);
  assert.doesNotMatch(json, /allowed_licenses|series_logo|private_session_id/);
});

test("keeps completed distance distinct and never infers scheduled distance", async () => {
  const { createRaceResultProjection } = await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("team-multiclass"));
  const { projection, json } = createRaceResultProjection(document, provenance);

  assert.deepEqual(projection.event.completed_distance, {
    event_laps_complete: document.event_laps_complete,
    race_summary_laps_complete: document.race_summary.laps_complete,
  });
  assert.doesNotMatch(json, /scheduled|race_lap_limit|race_time_limit/);
});

test("measures UTF-8 bytes, not UTF-16 code units", async () => {
  const { createRaceResultProjection, measureUtf8Bytes } = await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("individual"));
  const main = document.session_results.find(
    (session) => session.simsession_number === 0,
  );
  main.results[0].display_name = "Ünïcode 🏎️ Driver";

  const { json, bytes } = createRaceResultProjection(document, provenance);
  assert.ok(measureUtf8Bytes("🏎️") > "🏎️".length);
  assert.equal(bytes, measureUtf8Bytes(json));
  assert.notEqual(bytes, json.length);
});

test("falls back to an explicit summary instead of truncating rows", async () => {
  const { createRaceResultProjection, RACE_RESULT_RESOURCE_BYTE_LIMIT } =
    await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("team-multiclass"));
  const main = document.session_results.find(
    (session) => session.simsession_number === 0,
  );
  const template = main.results[0];
  main.results = Array.from({ length: 400 }, (_, index) => ({
    ...structuredClone(template),
    display_name: `Synthetic Team ${String(index).padStart(3, "0")} ${"x".repeat(120)}`,
  }));

  const { projection, json, bytes } = createRaceResultProjection(
    document,
    provenance,
  );

  assert.equal(projection.oversized, true);
  assert.equal(projection.limit_bytes, RACE_RESULT_RESOURCE_BYTE_LIMIT);
  assert.ok(projection.full_projection_bytes > RACE_RESULT_RESOURCE_BYTE_LIMIT);
  assert.equal(
    projection.oversized_reason,
    "main_event_projection_exceeds_cap",
  );
  assert.equal(projection.main_event.main_event_results_omitted, true);
  assert.equal("results" in projection.main_event, false);
  assert.ok(projection.main_event.class_summaries.length > 0);
  assert.equal(
    projection.main_event.class_summaries.reduce(
      (total, summary) => total + summary.entry_count,
      0,
    ),
    400,
  );
  assert.ok(bytes <= RACE_RESULT_RESOURCE_BYTE_LIMIT);
  assert.doesNotMatch(json, /"results"/);
});

test("fails explicitly when even the summary exceeds the cap", async () => {
  const { createRaceResultProjection } = await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("practice-only"));

  for (let index = 1; index <= 400; index += 1) {
    document.session_results.push({
      simsession_number: -index,
      simsession_name: `${"Session".repeat(40)} ${index}`,
      results: [],
    });
  }

  await assert.rejects(
    async () => createRaceResultProjection(document, provenance),
    {
      name: "ApplicationFailure",
      message:
        "Narrow the request. The source or response exceeds the app limit.",
    },
  );
});

test("the final validator rejects non-allowlisted fields", async () => {
  const { createRaceResultProjection, validateRaceResultProjection } =
    await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("individual"));
  const { projection } = createRaceResultProjection(document, provenance);

  assert.throws(() =>
    validateRaceResultProjection({ ...projection, document_json: "secret" }),
  );
  assert.throws(() =>
    validateRaceResultProjection({
      ...projection,
      main_event: {
        ...projection.main_event,
        results: [{ ...projection.main_event.results[0], license: "A 4.99" }],
      },
    }),
  );
});

test("omits invalid optional fields instead of failing the whole projection", async () => {
  const { createRaceResultProjection } = await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("individual"));
  const main = document.session_results.find(
    (session) => session.simsession_number === 0,
  );
  const row = main.results[0];
  row.display_name = null;
  row.finish_position = "0";
  row.laps_lead = 0;
  row.car_id = 12.5;
  document.num_cautions = "4";
  document.track.track_id = "331";
  if (row.driver_results) {
    row.driver_results[0].display_name = 42;
  }

  const { projection } = createRaceResultProjection(document, provenance);
  const projected = projection.main_event.results[0];

  assert.equal("display_name" in projected, false);
  assert.equal("finish_position" in projected, false);
  assert.equal("car_id" in projected, false);
  assert.equal(projected.laps_lead, 0);
  assert.equal("num_cautions" in projection.event, false);
  assert.equal("track_id" in projection.event.track, false);
  assert.equal(projection.event.track.track_name, document.track.track_name);
});

test("class driver counts use distinct customer ids like the main event", async () => {
  const { createRaceResultProjection, RACE_RESULT_RESOURCE_BYTE_LIMIT } =
    await api();
  const { RaceResultPayloadSchema } = await schema();
  const document = RaceResultPayloadSchema.parse(load("individual"));
  const main = document.session_results.find(
    (session) => session.simsession_number === 0,
  );
  const template = main.results[0];
  main.results = Array.from({ length: 400 }, () => ({
    ...structuredClone(template),
    cust_id: 900001,
    display_name: `Synthetic Driver ${"x".repeat(150)}`,
  }));

  const { projection } = createRaceResultProjection(document, provenance);

  assert.equal(projection.oversized, true);
  assert.ok(projection.full_projection_bytes > RACE_RESULT_RESOURCE_BYTE_LIMIT);
  assert.equal(projection.main_event.entry_count, 400);
  assert.equal(projection.main_event.driver_count, 1);
  assert.equal(projection.main_event.class_summaries.length, 1);
  assert.equal(projection.main_event.class_summaries[0].entry_count, 400);
  assert.equal(projection.main_event.class_summaries[0].driver_count, 1);
});
