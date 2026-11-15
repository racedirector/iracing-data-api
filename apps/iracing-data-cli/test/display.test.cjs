const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

test("shared display sends normalized object documents to its injected logger", async () => {
  const { createDisplayWriter } = await import("../dist/display.js");
  const logged = [];
  const writer = createDisplayWriter(
    {
      info(value) {
        logged.push(value);
      },
    },
    () => assert.fail("object documents must use Pino"),
  );
  writer.display({
    id: 42,
    rows: [],
    err: new Error("private"),
    omitted: undefined,
  });
  assert.deepEqual(logged, [{ id: 42, rows: [], err: {} }]);
});

test("shared display preserves arrays, primitives, and null through raw stdout", async () => {
  const { createDisplayWriter } = await import("../dist/display.js");
  const output = [];
  const writer = createDisplayWriter(
    {
      info() {
        assert.fail("non-object roots cannot use Pino records");
      },
    },
    (value) => output.push(value),
  );
  for (const document of [[{ id: 42 }], "text", 42, false, null]) {
    writer.display(document);
  }
  assert.deepEqual(output, [
    '[{"id":42}]\n',
    '"text"\n',
    "42\n",
    "false\n",
    "null\n",
  ]);
});

test("shared display propagates serialization, logger and raw output failures", async () => {
  const { createDisplayWriter } = await import("../dist/display.js");
  const cyclic = {};
  cyclic.self = cyclic;
  let writes = 0;
  const writer = createDisplayWriter(
    {
      info() {
        writes++;
      },
    },
    () => {
      writes++;
    },
  );
  assert.throws(() => writer.display(cyclic));
  assert.throws(() => writer.display(undefined), /JSON document/);
  assert.equal(writes, 0);
  const failure = new Error("fixture output failure");
  const broken = createDisplayWriter(
    {
      info() {
        throw failure;
      },
    },
    () => {
      throw failure;
    },
  );
  assert.throws(
    () => broken.display({}),
    (error) => error === failure,
  );
  assert.throws(
    () => broken.display([]),
    (error) => error === failure,
  );
});

for (const document of [
  { id: 42, err: { message: "retained" } },
  [{ id: 42 }],
  null,
]) {
  test(`entrypoint emits exact JSON without Pino metadata: ${JSON.stringify(document)}`, () => {
    const entry = pathToFileURL(require.resolve("../dist/index.js")).href;
    const script = `
      delete process.env.IRACING_CREDENTIALS;
      globalThis.fetch = async (input) => String(input).startsWith("https://members-ng.iracing.com/")
        ? Response.json({ link: "https://cache.example/results" })
        : Response.json(${JSON.stringify(document)});
      process.argv = [process.execPath, "results", "--subsession-id", "123", "--access-token", "fixture"];
      await import(${JSON.stringify(entry)});
    `;
    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", script],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.deepEqual(JSON.parse(result.stdout), document);
    assert.equal(result.stdout.trim().split("\n").length, 1);
  });
}
