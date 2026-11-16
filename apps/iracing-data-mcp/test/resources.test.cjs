const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("a resource reads a persisted snapshot and hydrates only when missing", async (t) => {
  const { createFileBackedResolver, registerReferenceResources } =
    await import("../dist/resources.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "reference", "cars.json");
  let fetches = 0;
  const load = async () => {
    fetches++;
    return [{ car_id: 1 }];
  };
  const resolve = createFileBackedResolver(file, load);
  const callbacks = new Map();
  registerReferenceResources(
    { registerResource: (name, uri, _metadata, callback) => {
      assert.equal(uri, "iracing://reference/cars");
      callbacks.set(name, callback);
    } },
    new Map([["cars", resolve]]),
  );

  const read = () => callbacks.get("cars")(new URL("iracing://reference/cars"));
  const [first, concurrent] = await Promise.all([read(), read()]);

  assert.deepEqual(JSON.parse(first.contents[0].text), [{ car_id: 1 }]);
  assert.deepEqual(concurrent, first);
  assert.equal(fetches, 1);
  assert.deepEqual(JSON.parse(await fs.readFile(file, "utf8")), [{ car_id: 1 }]);

  const reopened = createFileBackedResolver(file, load);
  assert.deepEqual(await reopened(), [{ car_id: 1 }]);
  assert.equal(fetches, 1);
});

test("a failed hydration leaves no snapshot and can be retried", async (t) => {
  const { createFileBackedResolver } = await import("../dist/resources.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "cars.json");
  let attempts = 0;
  const resolve = createFileBackedResolver(file, async () => {
    attempts++;

    if (attempts === 1) {
      throw new Error("upstream unavailable");
    }

    return [{ car_id: 2 }];
  });

  await assert.rejects(resolve(), /upstream unavailable/);
  await assert.rejects(fs.access(file), { code: "ENOENT" });
  assert.deepEqual(await resolve(), [{ car_id: 2 }]);
});
