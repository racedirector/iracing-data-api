const assert = require("node:assert/strict");
const test = require("node:test");

const diagnostics = { info() {}, warn() {}, error() {} };

test("help exposes the assets group and car leaf", async () => {
  const { createProgram } = await import("../dist/program.js");
  const program = createProgram(diagnostics);

  assert.match(program.helpInformation(), /\bassets\b/);

  const assets = program.commands.find(
    (command) => command.name() === "assets",
  );
  assert.ok(assets);
  assert.match(assets.helpInformation(), /\bcar\b/);
});
