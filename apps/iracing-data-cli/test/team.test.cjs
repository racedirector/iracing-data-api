const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

for (const [operation, flags, query] of [
  [
    "get",
    ["--team-id", "123", "--include-licenses", "false"],
    { team_id: "123", include_licenses: "false" },
  ],
  [
    "get",
    ["--team-id", "123", "--include-licenses"],
    { team_id: "123", include_licenses: "true" },
  ],
  ["get", ["--team-id", "123"], { team_id: "123" }],
  ["membership", [], {}],
]) {
  test(`team ${operation} serializes ${JSON.stringify(query)} and downloads without credentials`, async () => {
    const { createTeamCommand } =
      await import("../dist/commands/team/command.js");
    const { createTeamService } =
      await import("../dist/commands/team/service.js");
    const displayed = [];
    let calls = 0;
    const root = (await createRootCommand()).addCommand(
      createTeamCommand(
        createTeamService({
          async fetch(input, init) {
            calls++;
            if (calls === 1) {
              const url = new URL(String(input));
              assert.equal(url.pathname, `/data/team/${operation}`);
              assert.deepEqual(Object.fromEntries(url.searchParams), query);
              assert.equal(
                new Headers(init.headers).get("authorization"),
                "Bearer synthetic-team-token",
              );
              return new Response(
                JSON.stringify({
                  link: "https://cache.example/team",
                  expires: 1,
                }),
              );
            }
            assert.equal(String(input), "https://cache.example/team");
            assert.equal(init, undefined);
            return new Response(JSON.stringify([{ team_id: 123 }]));
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
      "team",
      operation,
      ...flags,
      "--access-token",
      "synthetic-team-token",
    ]);
    assert.equal(calls, 2);
    assert.deepEqual(displayed, [[{ team_id: 123 }]]);
  });
}

test("invalid team inputs have no service effects", async () => {
  const { createTeamCommand } =
    await import("../dist/commands/team/command.js");
  for (const flags of [
    [],
    ["--team-id", "invalid"],
    ["--team-id", "123", "--include-licenses", "invalid"],
  ]) {
    let calls = 0;
    const root = (await createRootCommand()).addCommand(
      createTeamCommand({
        async fetchTeam() {
          calls++;
        },
        present() {
          calls++;
        },
      }),
    );
    root.exitOverride().configureOutput({ writeErr() {} });
    for (const leaf of root.commands[0].commands) {
      leaf.exitOverride().configureOutput({ writeErr() {} });
    }
    await assert.rejects(
      root.parseAsync(["node", "test", "team", "get", ...flags]),
    );
    assert.equal(calls, 0);
  }
});

for (const link of [
  "http://cache.example/team",
  "https://user:secret@cache.example/team",
  "invalid",
]) {
  test(`team rejects unsafe cache URLs without presentation`, async () => {
    const { createTeamService } =
      await import("../dist/commands/team/service.js");
    let calls = 0;
    const service = createTeamService({
      async fetch() {
        calls++;
        return new Response(JSON.stringify({ link, expires: 1 }));
      },
      display() {
        assert.fail("must not display");
      },
    });
    await assert.rejects(
      service.fetchTeam({
        accessToken: "synthetic-team-token",
        request: { operation: "membership", query: {} },
      }),
      /Team request failed/,
    );
    assert.equal(calls, 1);
  });
}
