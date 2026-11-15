const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

for (const [operation, wire, flags, query] of [
  ["countries", "countries", [], {}],
  ["current-season", "current_season", [], {}],
  ["flairs", "flairs", [], {}],
  ["licenses", "licenses", [], {}],
  ["get", "get", [], {}],
  [
    "get",
    "get",
    [
      "--weather",
      "weather_wind_speed_units",
      "weather_wind_speed_max",
      "--licenselevels",
      "licenselevels",
    ],
    {
      weather: ["weather_wind_speed_units", "weather_wind_speed_max"],
      licenselevels: ["licenselevels"],
    },
  ],
  [
    "drivers",
    "drivers",
    ["--search-term", "Example", "--league-id", "123"],
    {
      search_term: ["Example"],
      league_id: ["123"],
    },
  ],
]) {
  test(`lookup ${operation} serializes ${JSON.stringify(query)} and materializes without credentials`, async () => {
    const { createLookupCommand } =
      await import("../dist/commands/lookup/command.js");
    const { createLookupService } =
      await import("../dist/commands/lookup/service.js");
    const displayed = [];
    let calls = 0;
    const root = (await createRootCommand()).addCommand(
      createLookupCommand(
        createLookupService({
          async fetch(input, init) {
            calls++;
            if (calls === 1) {
              const url = new URL(String(input));
              assert.equal(url.pathname, `/data/lookup/${wire}`);
              for (const [key, values] of Object.entries(query)) {
                assert.deepEqual(url.searchParams.getAll(key), values);
              }
              assert.equal(
                new Set(url.searchParams.keys()).size,
                Object.keys(query).length,
              );
              assert.equal(
                new Headers(init.headers).get("authorization"),
                "Bearer synthetic-lookup-token",
              );
              return Response.json({
                link: "https://cache.example/lookup",
                expires: "2026-11-15T01:00:00Z",
              });
            }
            assert.equal(String(input), "https://cache.example/lookup");
            assert.equal(init, undefined);
            return Response.json([{ example: true }]);
          },
          display(document) {
            displayed.push(document);
          },
        }),
      ),
    );
    await root.parseAsync([
      "node",
      "test",
      "lookup",
      operation,
      ...flags,
      "--access-token",
      "synthetic-lookup-token",
    ]);
    assert.equal(calls, 2);
    assert.deepEqual(displayed, [[{ example: true }]]);
  });
}

test("invalid lookup inputs have no service effects", async () => {
  const { createLookupCommand } =
    await import("../dist/commands/lookup/command.js");
  for (const flags of [
    [],
    ["--search-term", "Example", "--league-id", "invalid"],
  ]) {
    let effects = 0;
    const root = (await createRootCommand()).addCommand(
      createLookupCommand({
        async fetchLookup() {
          effects++;
        },
        present() {
          effects++;
        },
      }),
    );
    for (const command of [
      root,
      ...root.commands,
      ...root.commands.flatMap((c) => c.commands),
    ]) {
      command.exitOverride().configureOutput({ writeErr() {} });
    }
    await assert.rejects(
      root.parseAsync(["node", "test", "lookup", "drivers", ...flags]),
    );
    assert.equal(effects, 0);
  }
});

for (const failure of [
  "http",
  "decode",
  "unsafe",
  "cache-http",
  "cache-decode",
]) {
  test(`lookup ${failure} failure is sanitized and never presented`, async () => {
    const { createLookupCommand } =
      await import("../dist/commands/lookup/command.js");
    const { createLookupService } =
      await import("../dist/commands/lookup/service.js");
    let calls = 0;
    const root = (await createRootCommand()).addCommand(
      createLookupCommand(
        createLookupService({
          async fetch() {
            calls++;
            if (calls === 1) {
              if (failure === "http")
                return new Response("private-detail", { status: 401 });
              if (failure === "decode") return new Response("private-detail");
              return Response.json({
                link:
                  failure === "unsafe"
                    ? "https://user:private-detail@cache.example/data"
                    : "https://cache.example/data",
                expires: "2026-11-15T01:00:00Z",
              });
            }
            return new Response("private-detail", {
              status: failure === "cache-http" ? 500 : 200,
            });
          },
          display() {
            assert.fail("Must not present failed requests");
          },
        }),
      ),
    );
    await assert.rejects(
      root.parseAsync([
        "node",
        "test",
        "lookup",
        "countries",
        "--access-token",
        "synthetic-lookup-token",
      ]),
      (error) => {
        assert.match(error.message, /Lookup request failed/);
        assert.doesNotMatch(
          error.message,
          /private-detail|cache.example|synthetic-lookup-token/,
        );
        assert.equal(error.cause, undefined);
        return true;
      },
    );
    assert.equal(calls, failure.startsWith("cache-") ? 2 : 1);
  });
}
