const assert = require("node:assert/strict");
const test = require("node:test");

test("exposes auth login in the command hierarchy", async () => {
  const { createProgram } = await import("../dist/program.js");
  const messages = [];
  const diagnostics = {
    info: (message) => messages.push(message),
    warn: (message) => messages.push(message),
    error: (message) => messages.push(message),
  };
  const program = createProgram(diagnostics);
  const auth = program.commands.find((command) => command.name() === "auth");
  assert.ok(auth);
  assert.ok(auth.commands.some((command) => command.name() === "login"));
});
