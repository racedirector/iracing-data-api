const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

test("executable exposes results and its request flags", () => {
  const result = spawnSync(
    process.execPath,
    [require.resolve("../dist/index.js"), "results", "--help"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--subsession-id <id>/);
  assert.match(result.stdout, /--include-licenses \[boolean\]/);
});

test("results parses canonical query flags and forwards only API credentials", async () => {
  const { createResultsCommand } =
    await import("../dist/commands/results/command.js");
  const { createRootCommand } = require("./root-command.cjs");
  for (const [flags, expected] of [
    [[], undefined],
    [["--include-licenses"], true],
    [["--include-licenses", "false"], false],
  ]) {
    const calls = [];
    const root = (await createRootCommand()).addCommand(
      createResultsCommand({
        async fetchResults(options) {
          calls.push(options);
          return { result: true };
        },
        present(document) {
          assert.deepEqual(document, { result: true });
        },
      }),
    );
    await root.parseAsync(
      [
        "--access-token",
        "fixture",
        "results",
        "--subsession-id",
        "123",
        ...flags,
      ],
      { from: "user" },
    );
    assert.deepEqual(calls[0].query, {
      subsession_id: 123,
      include_licenses: expected,
    });
    assert.equal(calls[0].accessToken, "fixture");
    assert.equal(calls[0].password, undefined);
  }
});

test("results rejects invalid query input before I/O", async () => {
  const { createResultsCommand } =
    await import("../dist/commands/results/command.js");
  for (const flags of [
    ["--subsession-id", "abc"],
    ["--subsession-id", "1", "--include-licenses", "invalid"],
  ]) {
    let called = false;
    const command = createResultsCommand({
      async fetchResults() {
        called = true;
      },
      present() {},
    });
    await assert.rejects(command.parseAsync(flags, { from: "user" }));
    assert.equal(called, false);
  }
});

test("results authenticates API requests but not cache downloads", async () => {
  const { createResultsService } =
    await import("../dist/commands/results/service.js");
  const requests = [];
  const service = createResultsService({
    async fetch(input, init) {
      requests.push(String(input));
      if (requests.length === 1) {
        const url = new URL(String(input));
        assert.equal(url.pathname, "/data/results/get");
        assert.equal(url.searchParams.get("subsession_id"), "123");
        assert.equal(url.searchParams.get("include_licenses"), "false");
        assert.equal(
          new Headers(init.headers).get("authorization"),
          "Bearer fixture",
        );
        return Response.json({ link: "https://cache.example/results" });
      }
      assert.equal(init, undefined);
      return Response.json({ subsession_id: 123 });
    },
    display() {},
  });
  assert.deepEqual(
    await service.fetchResults({
      accessToken: "fixture",
      query: { subsession_id: 123, include_licenses: false },
    }),
    { subsession_id: 123 },
  );
  assert.equal(requests.length, 2);
});

test("results sanitizes failures and rejects insecure cache links", async () => {
  const { createResultsService } =
    await import("../dist/commands/results/service.js");
  for (const response of [
    () => Response.json({ link: "http://cache.example/results" }),
    () => Response.json({}, { status: 403 }),
    () => {
      throw new Error("secret-token");
    },
  ]) {
    let calls = 0;
    const service = createResultsService({
      fetch: async () => {
        calls++;
        return response();
      },
      display() {},
    });
    await assert.rejects(
      service.fetchResults({
        accessToken: "fixture",
        query: { subsession_id: 123 },
      }),
      { message: /Results request failed/ },
    );
    assert.equal(calls, 1);
  }
});

test("cache HTTP and JSON failures never present partial results or upstream secrets", async () => {
  const { createResultsService } =
    await import("../dist/commands/results/service.js");
  const { createExecute } = await import("../dist/commands/results/command.js");
  for (const cacheResponse of [
    () => new Response("secret-token", { status: 403 }),
    () => new Response("secret-token"),
    () => {
      throw new Error("secret-token");
    },
  ]) {
    let calls = 0;
    let displayed = false;
    const service = createResultsService({
      async fetch() {
        if (++calls === 1) {
          return Response.json({ link: "https://cache.example/results" });
        }
        return cacheResponse();
      },
      display() {
        displayed = true;
      },
    });
    await assert.rejects(
      createExecute(service)({
        accessToken: "fixture",
        query: { subsession_id: 123 },
      }),
      {
        message:
          "Results request failed. Check connectivity, token expiry, iracing.auth scope, and subsession access.",
      },
    );
    assert.equal(calls, 2);
    assert.equal(displayed, false);
  }
});

test("results forwards credential-file selection", async () => {
  const { createResultsCommand } =
    await import("../dist/commands/results/command.js");
  const { createRootCommand } = require("./root-command.cjs");
  let selected;
  const root = (await createRootCommand()).addCommand(
    createResultsCommand({
      async fetchResults(options) {
        selected = options;
        return {};
      },
      present() {},
    }),
  );
  await root.parseAsync(
    ["results", "--subsession-id", "123", "--credentials", "credentials.json"],
    { from: "user" },
  );
  assert.equal(selected.credentials, "credentials.json");
  assert.equal(selected.query.subsession_id, 123);
});
