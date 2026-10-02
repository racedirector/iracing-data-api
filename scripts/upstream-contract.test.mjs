import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import test from "node:test";
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

const oauth = await fs.readFile(
  new URL("./fixtures/upstream-contract/oauth.html", import.meta.url),
  "utf8",
);
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

test("HTML shell, attributes, comments, entities and prose formatting do not drift", () => {
  const before = oauth.replace("Use ", "Use &amp; ");
  const after = before
    .replace("&amp;", "&#38;")
    .replace("Use ", "Use\n  ")
    .replace('id="fixture"', 'id="changed" class="theme"')
    .replace("Fixture navigation", "new nav")
    .replace("<p>", "<!-- build -->\n<p>");
  assert.deepEqual(normalize("oauth", before), normalize("oauth", after));
});

test("timestamps and capture mode do not affect content comparison", () => {
  for (const [kind, input] of [
    ["oauth", oauth],
    ["data", data],
  ]) {
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

test("material endpoint, parameter, link, prose, code and table changes are reviewable", () => {
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
  for (const [old, next] of [
    ["Workflow", "Updated"],
    ["data_api_workflow.html", "tokens_overview.html"],
    ["scope=iracing.auth", "scope=iracing.profile"],
    [">yes<", ">no<"],
  ]) {
    assert.equal(
      diff(make("oauth", oauth), make("oauth", oauth.replace(old, next)))
        .changed,
      true,
    );
  }
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
  for (const input of [
    "",
    "<main>iRacing",
    "<html>login</html>",
    "<main>iRacing</main><main>other</main>",
  ])
    assert.throws(() => make("oauth", input));
  assert.throws(() => make("other", data));
  assert.throws(() => make("data", data, { capturedAt: "bad" }));
  assert.throws(() => make("data", data, { mode: "authenticated" }));
});

test("corrupt hash, source, version and cross-source comparisons fail", () => {
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
  assert.throws(() => diff(before, make("oauth", oauth)));
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
  assert.ok(!serialize(make("oauth", oauth)).includes("fixture-token"));
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
        files[0].pathname,
        files[1].pathname,
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
