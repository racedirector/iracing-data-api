const assert = require("node:assert/strict");
const test = require("node:test");

async function setup(t) {
  const { registerAssetResources } = await import("../dist/index.js");
  const { McpServer, InMemoryTransport } =
    await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");
  const state = { reads: 0, fail: false };
  const documents = {
    cars: [
      {
        car_id: 12,
        logo: "/img/logos/car.png",
        small_image: "small.jpg",
        folder: "/img/cars/example",
      },
      { car_id: 2, logo: null, large_image: "https://evil.test/img/large.png" },
      { car_id: 12 },
      { car_id: 0 },
      { car_id: -1 },
      { car_id: Number.MAX_SAFE_INTEGER + 1 },
      { car_id: "17" },
    ],
    tracks: [
      {
        track_id: 21,
        track_map:
          "https://members-assets.iracing.com/public/track-maps/example/",
        track_map_layers: {
          turns: "turns.svg",
          active: "active.svg",
          invalid: null,
          escape: "../escape.svg",
          foreign: "https://evil.test/foreign.svg",
        },
      },
      { track_id: 22 },
    ],
    series: [{ series_id: 32, logo: "seriesid_32.png", small_image: null }],
  };
  function read() {
    state.reads++;
    if (state.fail) throw new Error("private credential path and secret token");
  }
  const catalogs = Object.entries(documents).map(([kind, entries]) => {
    const idField = { cars: "car_id", tracks: "track_id", series: "series_id" }[
      kind
    ];
    return {
      kind,
      idField,
      resolver: {
        all: async () => {
          read();
          return documents[kind];
        },
        get: async (id) => {
          read();
          return entries.find((entry) => entry[idField] === id) ?? null;
        },
      },
    };
  });
  const server = new McpServer({ name: "asset-completion-test", version: "1" });
  registerAssetResources(server, catalogs, async () => {
    assert.fail("Completion must never download media");
  });
  const client = new Client({ name: "asset-completion-client", version: "1" });
  const [left, right] = InMemoryTransport.createLinkedPair();
  t.after(async () => {
    await client.close();
    await server.close();
  });
  await server.connect(left);
  await client.connect(right);
  const complete = (uri, name, value, args) =>
    client.complete({
      ref: { type: "ref/resource", uri },
      argument: { name, value },
      ...(args ? { context: { arguments: args } } : {}),
    });
  return { client, complete, state, documents };
}

test("asset ID completion is lazy, prefix-filtered, unique and numerically sorted", async (t) => {
  const { client, complete, state } = await setup(t);
  assert.ok(client.getServerCapabilities().completions);
  await client.listResources();
  await client.listResourceTemplates();
  assert.equal(state.reads, 0);
  for (const [kind, ids] of [
    ["cars", ["2", "12"]],
    ["tracks", ["21", "22"]],
    ["series", ["32"]],
  ]) {
    for (const uri of [
      `iracing://assets/${kind}/{id}`,
      `iracing://images/${kind}/{id}/{field}`,
    ]) {
      assert.deepEqual((await complete(uri, "id", "")).completion.values, ids);
      assert.deepEqual((await complete(uri, "id", ids[0])).completion.values, [
        ids[0],
      ]);
      assert.deepEqual(
        (await complete(uri, "id", "999")).completion.values,
        [],
      );
      const before = state.reads;
      for (const prefix of ["x", "-1", "1.2", " 2"]) {
        assert.deepEqual(
          (await complete(uri, "id", prefix)).completion.values,
          [],
        );
      }
      assert.equal(state.reads, before);
    }
  }
  assert.deepEqual(
    (await complete("iracing://track-maps/{track_id}/{layer}", "track_id", "2"))
      .completion.values,
    ["21", "22"],
  );
});

test("image field completion uses the selected asset and rejects unavailable or unsafe references", async (t) => {
  const { complete, state } = await setup(t);
  const uri = "iracing://images/cars/{id}/{field}";
  assert.deepEqual((await complete(uri, "field", "")).completion.values, []);
  assert.equal(state.reads, 0);
  for (const id of ["0", "-1", "01", "abc", "9007199254740992"]) {
    assert.deepEqual(
      (await complete(uri, "field", "", { id })).completion.values,
      [],
    );
  }
  assert.equal(state.reads, 0);
  assert.deepEqual(
    (await complete(uri, "field", "", { id: "12" })).completion.values,
    ["logo", "small_image"],
  );
  assert.deepEqual(
    (await complete(uri, "field", "sm", { id: "12" })).completion.values,
    ["small_image"],
  );
  assert.deepEqual(
    (await complete(uri, "field", "no", { id: "12" })).completion.values,
    [],
  );
  for (const id of ["2", "999"]) {
    assert.deepEqual(
      (await complete(uri, "field", "", { id })).completion.values,
      [],
    );
  }
  assert.deepEqual(
    (
      await complete("iracing://images/series/{id}/{field}", "field", "", {
        id: "32",
      })
    ).completion.values,
    ["logo"],
  );
});

test("track map completion uses exact safe layer keys from the selected track", async (t) => {
  const { complete, state } = await setup(t);
  const uri = "iracing://track-maps/{track_id}/{layer}";
  assert.deepEqual((await complete(uri, "layer", "")).completion.values, []);
  assert.deepEqual(
    (await complete(uri, "layer", "", { track_id: "bad" })).completion.values,
    [],
  );
  assert.equal(state.reads, 0);
  assert.deepEqual(
    (await complete(uri, "layer", "", { track_id: "21" })).completion.values,
    ["active", "turns"],
  );
  assert.deepEqual(
    (await complete(uri, "layer", "tu", { track_id: "21" })).completion.values,
    ["turns"],
  );
  assert.deepEqual(
    (await complete(uri, "layer", "none", { track_id: "21" })).completion
      .values,
    [],
  );
  for (const track_id of ["22", "999"]) {
    assert.deepEqual(
      (await complete(uri, "layer", "", { track_id })).completion.values,
      [],
    );
  }
});

test("asset completions preserve SDK bounds and sanitize metadata loader failures", async (t) => {
  const { complete, state, documents } = await setup(t);
  documents.cars = Array.from({ length: 151 }, (_, index) => ({
    car_id: index + 1,
  }));
  const uri = "iracing://assets/cars/{id}";
  const { completion } = await complete(uri, "id", "");
  assert.equal(completion.values.length, 100);
  assert.equal(completion.total, 151);
  assert.equal(completion.hasMore, true);
  assert.equal(completion.values[0], "1");
  assert.equal(completion.values[99], "100");
  state.fail = true;
  for (const [template, name, args] of [
    [uri, "id"],
    ["iracing://images/cars/{id}/{field}", "field", { id: "12" }],
    ["iracing://track-maps/{track_id}/{layer}", "layer", { track_id: "21" }],
  ]) {
    await assert.rejects(complete(template, name, "", args), (error) => {
      assert.equal(error.code, -32603);
      assert.match(error.message, /Unable to load asset metadata/);
      assert.doesNotMatch(error.message, /private|secret|credential/);
      return true;
    });
  }
});
