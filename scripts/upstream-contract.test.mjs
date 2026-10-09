import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  capture,
  diff,
  normalize,
  redact,
  serialize,
  snapshot,
  sources,
  validateSnapshot,
} from "./upstream-contract.mjs";

const data = await fs.readFile(
  new URL("./fixtures/upstream-contract/data.json", import.meta.url),
  "utf8",
);
const options = { capturedAt: "2026-10-01T00:00:00Z" };
const make = (kind, input, overrides = {}) =>
  snapshot(kind, input, { ...options, ...overrides });

test("JSON key order and formatting are equivalent; arrays preserve order", () => {
  const value = JSON.parse(data);
  value.car.get.parameters.car_ids = {
    note: "Comma separated IDs",
    required: false,
    type: "numbers",
  };
  assert.deepEqual(
    normalize("data", data),
    normalize("data", JSON.stringify(value)),
  );
  value.car.get.extra = [1, 2];
  const before = make("data", JSON.stringify(value));
  value.car.get.extra.reverse();
  assert.equal(diff(before, make("data", JSON.stringify(value))).changed, true);
});

test("timestamps and capture mode do not affect content comparison", () => {
  for (const [kind, input] of [["data", data]]) {
    const before = make(kind, input);
    const after = make(kind, input, {
      mode: "live",
      capturedAt: "2026-10-02T00:00:00Z",
    });
    assert.notDeepEqual(before.provenance, after.provenance);
    assert.equal(before.contentHash, after.contentHash);
    assert.deepEqual(diff(before, after).changes, []);
  }
});

test("material Data API endpoint and parameter changes are reviewable", () => {
  const value = JSON.parse(data);
  value.car.get.parameters.car_ids.required = true;
  value.car.new = { link: `${sources.data}/new`, parameters: {} };
  const result = diff(make("data", data), make("data", JSON.stringify(value)));
  assert.ok(
    result.changes.some(
      (change) =>
        change.path === "/car/get/parameters/car_ids/required" &&
        change.before === false &&
        change.after === true,
    ),
  );
  assert.ok(result.changes.some((change) => change.operation === "added"));
});

test("malformed documents, auth errors and invalid provenance fail closed", () => {
  for (const input of [
    "",
    "secret invalid json",
    "null",
    "[]",
    '{"error":"unauthorized"}',
    '{"car":{"get":{}}}',
  ])
    assert.throws(() => make("data", input));
  assert.throws(() => make("other", data));
  assert.throws(() => make("data", data, { capturedAt: "bad" }));
  assert.throws(() => make("data", data, { mode: "authenticated" }));
});

test("corrupt Data API hash, source and version fail", () => {
  const before = make("data", data);
  for (const mutate of [
    (v) => {
      v.contentHash = "invalid";
    },
    (v) => {
      v.formatVersion = 2;
    },
    (v) => {
      v.provenance.source = "https://evil.invalid";
    },
  ]) {
    const copy = structuredClone(before);
    mutate(copy);
    assert.throws(() => validateSnapshot(copy));
  }
});

test("credentials are removed from content, keys, hashes' inputs and diffs", () => {
  const value = JSON.parse(data);
  value.car.get.access_token = "unknown-token";
  value.car.get.note =
    "Bearer bearer-token https://example.com?password=query-secret exact-secret";
  value.car.get["exact-secret"] = "exact-secret";
  const result = make("data", JSON.stringify(value), {
    secrets: ["exact-secret"],
  });
  const output =
    serialize(result) + serialize(diff(make("data", data), result));
  for (const secret of [
    "unknown-token",
    "bearer-token",
    "query-secret",
    "exact-secret",
  ])
    assert.ok(!output.includes(secret));
  assert.equal(redact("provided-token", ["provided-token"]), "[REDACTED]");
});

test("authenticated capture uses fixed source, no redirects, and redacts echoed token", async () => {
  const result = await capture("data", {
    token: "private-token",
    fetcher: async (url, init) => {
      assert.equal(url, sources.data);
      assert.equal(init.redirect, "error");
      assert.equal(init.headers.Authorization, "Bearer private-token");
      const value = JSON.parse(data);
      value.car.get.note = "private-token";
      return new Response(JSON.stringify(value), {
        headers: { "content-type": "application/json" },
      });
    },
  });
  assert.equal(result.provenance.mode, "live");
  assert.ok(!serialize(result).includes("private-token"));
});

test("missing credentials, transport failures, errors and wrong content types never expose response", async () => {
  await assert.rejects(capture("data"), /IRACING_ACCESS_TOKEN/);
  for (const fetcher of [
    async () => {
      throw new Error("private-token");
    },
    async () => new Response("private-token", { status: 401 }),
    async () =>
      new Response("private-token", {
        headers: { "content-type": "text/html" },
      }),
  ]) {
    await assert.rejects(
      capture("data", { token: "private-token", fetcher }),
      (error) => !error.message.includes("private-token"),
    );
  }
});

test("CLI failure logs no credential or raw parser error", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/upstream-contract.mjs", "capture", "data", "bad.json"],
    {
      env: { ...process.env, IRACING_ACCESS_TOKEN: "private\r\ntoken" },
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 1);
  assert.ok(!`${result.stdout}${result.stderr}`.includes("private"));
});

test("verification includes offline upstream regressions", async () => {
  const { verificationPlan } = await import("./verify.mjs");
  assert.ok(
    verificationPlan("repo", {}).some((step) =>
      step.args.includes("test:upstream"),
    ),
  );
});

test("CLI confines writes and refuses to overwrite prior evidence", async (t) => {
  const name = `test-${process.pid}.json`;
  const output = new URL(`../.upstream-contract/${name}`, import.meta.url);
  t.after(() => fs.rm(output, { force: true }));
  const run = (destination) =>
    spawnSync(
      process.execPath,
      [
        "scripts/upstream-contract.mjs",
        "fixture",
        "data",
        "scripts/fixtures/upstream-contract/data.json",
        destination,
      ],
      { encoding: "utf8" },
    );
  assert.equal(run("../openapi/iracing.json").status, 1);
  assert.equal(run(name).status, 0);
  const before = await fs.readFile(output, "utf8");
  assert.equal(run(name).status, 1);
  assert.equal(await fs.readFile(output, "utf8"), before);
});

test("CLI diff reports equivalent content and drift with distinct exit codes", async (t) => {
  const names = [
    `test-before-${process.pid}.json`,
    `test-after-${process.pid}.json`,
    `test-equal-${process.pid}.json`,
    `test-drift-${process.pid}.json`,
  ];
  const files = names.map(
    (name) => new URL(`../.upstream-contract/${name}`, import.meta.url),
  );
  await fs.mkdir(new URL("../.upstream-contract/", import.meta.url), {
    recursive: true,
  });
  t.after(() => Promise.all(files.map((file) => fs.rm(file, { force: true }))));
  const before = make("data", data);
  await fs.writeFile(files[0], serialize(before));
  await fs.writeFile(
    files[1],
    serialize(make("data", data, { capturedAt: "2026-10-02T00:00:00Z" })),
  );
  const run = (name) =>
    spawnSync(
      process.execPath,
      [
        "scripts/upstream-contract.mjs",
        "diff",
        fileURLToPath(files[0]),
        fileURLToPath(files[1]),
        name,
      ],
      { encoding: "utf8" },
    );
  assert.equal(run(names[2]).status, 0);
  await fs.writeFile(
    files[1],
    serialize(
      make("data", data.replace('"required": false', '"required": true')),
    ),
  );
  assert.equal(run(names[3]).status, 2);
});

test("OAuth evidence is rejected by every retained entry point before network or writes", async () => {
  assert.deepEqual(Object.keys(sources), ["data"]);
  assert.throws(
    () => normalize("oauth", "<main>iRacing</main>"),
    /Unknown upstream kind/,
  );
  assert.throws(
    () => snapshot("oauth", "<main>iRacing</main>"),
    /Unknown upstream kind/,
  );
  const retired = structuredClone(make("data", data));
  retired.kind = "oauth";
  assert.throws(() => validateSnapshot(retired), /Invalid or corrupt snapshot/);
  assert.throws(() => diff(retired, retired), /Invalid or corrupt snapshot/);
  await assert.rejects(
    capture("oauth", { fetcher: () => assert.fail("must not fetch") }),
    /Unknown upstream kind/,
  );
  for (const args of [
    ["capture", "oauth", "retired-oauth.json"],
    [
      "fixture",
      "oauth",
      "scripts/fixtures/upstream-contract/data.json",
      "retired-oauth.json",
    ],
  ]) {
    const result = spawnSync(
      process.execPath,
      ["scripts/upstream-contract.mjs", ...args],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
  }
  await assert.rejects(
    fs.access(
      new URL("../.upstream-contract/retired-oauth.json", import.meta.url),
    ),
  );
});
