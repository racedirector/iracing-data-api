const assert = require("node:assert/strict");
const test = require("node:test");

const { createProgram } = require("../dist/program.js");

test("exposes auth login in the command hierarchy", () => {
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
