const assert = require("node:assert/strict");
const test = require("node:test");

test("the program retires league-history in favor of composable JSON endpoint commands", async () => {
  const { createProgram } = await import("../dist/program.js");
  const root = createProgram({
    diagnostics: { debug() {}, info() {}, warn() {}, error() {} },
    async fetch() {
      assert.fail("Help must not invoke transport");
    },
    display: { display() {}, writeStdout() {} },
  });
  assert.equal(
    root.commands.some((command) => command.name() === "league-history"),
    false,
  );
  assert.equal(
    root.commands.some((command) => command.name() === "league"),
    true,
  );
  root.exitOverride().configureOutput({ writeErr() {} });
  await assert.rejects(root.parseAsync(["node", "test", "league-history"]));
});
