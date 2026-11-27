const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

const cases = [
  [
    ["member", "get", "--cust-ids", "123,456", "--include-licenses", "false"],
    "/data/member/get",
    { cust_ids: "123,456", include_licenses: "false" },
  ],
  [
    ["member", "get", "--cust-ids", "123", "--include-licenses"],
    "/data/member/get",
    { cust_ids: "123", include_licenses: "true" },
  ],
  [["metadata", "car"], "/data/car/get", {}],
  [["metadata", "car-class"], "/data/carclass/get", {}],
  [["metadata", "track"], "/data/track/get", {}],
  [
    [
      "results-search-hosted",
      "--league-id",
      "6529",
      "--league-season-id",
      "123",
      "--team-id",
      "42",
      "--cust-id",
      "12",
      "--host-cust-id",
      "34",
      "--start-range-begin",
      "2026-01-01T00:00:00Z",
      "--start-range-end",
      "2026-04-01T00:00:00Z",
      "--finish-range-begin",
      "2026-01-01T00:00:00Z",
      "--finish-range-end",
      "2026-04-01T00:00:00Z",
      "--session-name",
      "Race",
      "--car-id",
      "1",
      "--track-id",
      "2",
      "--category-ids",
      "1,2",
    ],
    "/data/results/search_hosted",
    {
      league_id: "6529",
      league_season_id: "123",
      team_id: "42",
      cust_id: "12",
      host_cust_id: "34",
      start_range_begin: "2026-01-01T00:00:00Z",
      start_range_end: "2026-04-01T00:00:00Z",
      finish_range_begin: "2026-01-01T00:00:00Z",
      finish_range_end: "2026-04-01T00:00:00Z",
      session_name: "Race",
      car_id: "1",
      track_id: "2",
      category_ids: "1,2",
    },
  ],
];

// Modify results-search-hosted: retain inline manifests without expanding chunks.
for (const responseOnly of [false, true]) {
  test(`hosted search preserves inline JSON (response-only=${responseOnly})`, async () => {
    const { createImportCommands } =
      await import("../dist/commands/import-data/command.js");
    const { createImportService } =
      await import("../dist/commands/import-data/service.js");
    const document = {
      type: "search_hosted_results",
      data: {
        success: true,
        chunk_info: {
          num_results: 1,
          base_download_url: "https://cache.example/chunks/",
          chunk_file_names: ["chunk.json"],
        },
      },
      additional_field: "preserved",
    };
    let calls = 0;
    const displayed = [];
    const service = createImportService({
      async fetch() {
        assert.equal(++calls, 1, "must not expand chunks");
        return new Response(JSON.stringify(document));
      },
      display(value) {
        displayed.push(value);
      },
    });
    const root = await createRootCommand();
    for (const command of createImportCommands(service))
      root.addCommand(command);
    await root.parseAsync([
      "node",
      "test",
      "--access-token",
      "synthetic-import-token",
      "results-search-hosted",
      "--start-range-begin",
      "2023-10-08T00:00:00Z",
      "--start-range-end",
      "2023-10-11T00:00:00Z",
      "--session-name",
      "FTR",
      "--track-id",
      "192",
      ...(responseOnly ? ["--response-only"] : []),
    ]);
    assert.equal(calls, 1);
    assert.deepEqual(displayed, [document]);
  });
}

for (const [args, path, query] of cases) {
  test(`import support ${args.join(" ")} uses generated client and safe download`, async () => {
    const { createImportCommands } =
      await import("../dist/commands/import-data/command.js");
    const { createImportService } =
      await import("../dist/commands/import-data/service.js");
    const displayed = [];
    let calls = 0;
    const service = createImportService({
      async fetch(input, init) {
        calls++;
        if (calls === 1) {
          const url = new URL(String(input));
          assert.equal(url.pathname, path);
          assert.deepEqual(
            Object.fromEntries(url.searchParams),
            Object.fromEntries(
              Object.entries(query).map(([key, value]) => [
                key,
                key.includes("_range_") ? new Date(value).toISOString() : value,
              ]),
            ),
          );
          assert.equal(
            new Headers(init.headers).get("authorization"),
            "Bearer synthetic-import-token",
          );
          return new Response(
            JSON.stringify({
              link: "https://cache.example/document",
              expires: 1,
            }),
          );
        }
        assert.equal(init, undefined);
        assert.equal(String(input), "https://cache.example/document");
        return new Response(JSON.stringify([{ id: 123 }]));
      },
      display(document) {
        displayed.push(document);
      },
    });
    const root = await createRootCommand();
    for (const command of createImportCommands(service))
      root.addCommand(command);
    await root.parseAsync([
      "node",
      "test",
      "--access-token",
      "synthetic-import-token",
      ...args,
    ]);
    assert.equal(calls, 2);
    assert.deepEqual(displayed, [[{ id: 123 }]]);
  });
}

test("invalid import flags do not invoke services", async () => {
  const { createImportCommands } =
    await import("../dist/commands/import-data/command.js");
  for (const args of [
    ["member", "get"],
    ["member", "get", "--cust-ids", "not-ids"],
    ["member", "get", "--cust-ids", "123", "--include-licenses", "invalid"],
    ["results-search-hosted", "--category-ids", "2,,5"],
    ["results-search-hosted", "--start-range-begin", "yesterday"],
    ["results-search-hosted", "--team-id", "invalid"],
  ]) {
    const root = await createRootCommand();
    for (const command of createImportCommands({
      async fetchDocument() {
        assert.fail("must not fetch");
      },
      present() {
        assert.fail("must not present");
      },
    })) {
      command.exitOverride().configureOutput({ writeErr() {} });
      for (const leaf of command.commands)
        leaf.exitOverride().configureOutput({ writeErr() {} });
      root.addCommand(command);
    }
    await assert.rejects(root.parseAsync(["node", "test", ...args]));
  }
});

for (const failure of [
  "api",
  "unsafe",
  "credentials-in-url",
  "http",
  "decode",
]) {
  test(`import service sanitizes ${failure} failure`, async () => {
    const { createImportService } =
      await import("../dist/commands/import-data/service.js");
    let calls = 0;
    const service = createImportService({
      async fetch() {
        calls++;
        if (calls === 1) {
          if (failure === "api") throw new Error("synthetic-secret");
          const links = {
            unsafe: "http://cache.example/document",
            "credentials-in-url": "https://user:secret@cache.example/document",
          };
          return new Response(
            JSON.stringify({
              link: links[failure] ?? "https://cache.example/document",
              expires: 1,
            }),
          );
        }
        return failure === "http"
          ? new Response("synthetic-secret", { status: 403 })
          : new Response("invalid JSON synthetic-secret");
      },
      display() {
        assert.fail("must not display");
      },
    });
    await assert.rejects(
      service.fetchDocument({
        accessToken: "synthetic-import-token",
        request: { operation: "track", query: {} },
      }),
      (error) => {
        assert.match(error.message, /Import data request failed/);
        assert.match(
          error.message,
          failure === "api" ? /during API request/ : /during cache/,
        );
        assert.doesNotMatch(error.message, /token expiry|scope|authentication/);
        assert.doesNotMatch(
          error.message,
          /synthetic-secret|https:|user:secret/,
        );
        return true;
      },
    );
    assert.equal(
      calls,
      ["api", "unsafe", "credentials-in-url"].includes(failure) ? 1 : 2,
    );
  });
}

test("import service identifies malformed response JSON without leaking its body", async () => {
  const { createImportService } =
    await import("../dist/commands/import-data/service.js");
  const service = createImportService({
    async fetch() {
      return new Response("synthetic-secret invalid JSON");
    },
    display() {
      assert.fail("must not display");
    },
  });
  await assert.rejects(
    service.fetchDocument({
      accessToken: "synthetic-import-token",
      request: { operation: "search-hosted", query: {} },
    }),
    { message: "Import data request failed during response decoding." },
  );
});
