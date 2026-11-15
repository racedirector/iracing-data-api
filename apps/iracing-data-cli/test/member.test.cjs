const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

for (const [operation, wire, flags, query] of [
  ["awards", "awards", [], {}],
  ["awards", "awards", ["--cust-id", "123"], { cust_id: "123" }],
  [
    "award-instances",
    "award_instances",
    ["--award-id", "88"],
    { award_id: "88" },
  ],
  [
    "chart-data",
    "chart_data",
    ["--category-id", "1", "--chart-type", "1"],
    { category_id: "1", chart_type: "1" },
  ],
  ["profile", "profile", [], {}],
  ["info", "info", [], {}],
  ["participation-credits", "participation_credits", [], {}],
]) {
  test(`member ${operation} validates and materializes its modeled response`, async () => {
    const { createImportCommands } =
      await import("../dist/commands/import-data/command.js");
    const { createImportService } =
      await import("../dist/commands/import-data/service.js");
    let calls = 0;
    const displayed = [];
    const root = await createRootCommand();
    for (const command of createImportCommands(
      createImportService({
        async fetch(input, init) {
          calls++;
          if (calls === 1) {
            const url = new URL(String(input));
            assert.equal(url.pathname, `/data/member/${wire}`);
            assert.deepEqual(Object.fromEntries(url.searchParams), query);
            assert.equal(
              new Headers(init.headers).get("authorization"),
              "Bearer synthetic-member-token",
            );
            if (["awards", "award-instances"].includes(operation)) {
              return Response.json({
                type:
                  operation === "awards"
                    ? "member_awards"
                    : "member_award_instances",
                data: {
                  success: true,
                  cust_id: 123,
                  award_count: 1,
                  award_id: 88,
                },
                data_url: "https://cache.example/member",
              });
            }
            return Response.json({
              link: "https://cache.example/member",
              expires: "2026-11-15T01:00:00Z",
            });
          }
          assert.equal(String(input), "https://cache.example/member");
          assert.equal(init, undefined);
          return Response.json([{ example: true }]);
        },
        display(value) {
          displayed.push(value);
        },
      }),
    ))
      root.addCommand(command);
    await root.parseAsync([
      "node",
      "test",
      "--access-token",
      "synthetic-member-token",
      "member",
      operation,
      ...flags,
    ]);
    assert.equal(calls, 2);
    assert.deepEqual(displayed, [[{ example: true }]]);
  });
}

test("member response-only preserves raw fields and never downloads", async () => {
  const { createImportCommands } =
    await import("../dist/commands/import-data/command.js");
  const { createImportService } =
    await import("../dist/commands/import-data/service.js");
  const wire = {
    type: "member_awards",
    data: { success: true },
    data_url: "https://cache.example/data",
    future_field: true,
  };
  let calls = 0;
  const displayed = [];
  const root = await createRootCommand();
  for (const command of createImportCommands(
    createImportService({
      async fetch() {
        calls++;
        return Response.json(wire);
      },
      display(value) {
        displayed.push(value);
      },
    }),
  ))
    root.addCommand(command);
  await root.parseAsync([
    "node",
    "test",
    "member",
    "awards",
    "--response-only",
    "--access-token",
    "synthetic-member-token",
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(displayed, [wire]);
});

test("member validates required flags, numbers and chart enums before effects", async () => {
  const { createImportCommands } =
    await import("../dist/commands/import-data/command.js");
  for (const args of [
    ["award-instances"],
    ["award-instances", "--award-id", "invalid"],
    ["chart-data", "--category-id", "1", "--chart-type", "9"],
    ["awards", "--cust-id", "invalid"],
  ]) {
    let effects = 0;
    const root = await createRootCommand();
    for (const command of createImportCommands({
      async fetchDocument() {
        effects++;
      },
      present() {
        effects++;
      },
    }))
      root.addCommand(command);
    for (const command of [
      root,
      ...root.commands,
      ...root.commands.flatMap((c) => c.commands),
    ]) {
      command.exitOverride().configureOutput({ writeErr() {} });
    }
    await assert.rejects(root.parseAsync(["node", "test", "member", ...args]));
    assert.equal(effects, 0);
  }
});

for (const success of [false, undefined]) {
  test(`member awards rejects unsuccessful metadata (${String(success)}) without download`, async () => {
    const { createImportService } =
      await import("../dist/commands/import-data/service.js");
    let calls = 0;
    const service = createImportService({
      async fetch() {
        calls++;
        return Response.json({
          type: "member_awards",
          data: { success },
          data_url: "https://cache.example/private",
        });
      },
      display() {
        assert.fail("No failed requests may be displayed");
      },
    });
    await assert.rejects(
      service.fetchDocument({
        request: { operation: "member-awards", query: {} },
        accessToken: "synthetic-member-token",
      }),
      /Import data request failed/,
    );
    assert.equal(calls, 1);
  });
}
