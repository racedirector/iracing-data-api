const assert = require("node:assert/strict");
const test = require("node:test");

test("docs Commander adapter parses flags and dispatches normalized input", async () => {
  const { createDocsCommand } = await import("../dist/commands/docs/index.js");
  const calls = [];
  const command = createDocsCommand({
    async execute(options) {
      calls.push(options);
    },
  });

  await command.parseAsync(
    [
      "--credentials",
      "selected.yaml",
      "--output",
      "report.yaml",
      "--format",
      "json",
      "--force",
    ],
    { from: "user" },
  );

  assert.deepEqual(calls, [
    {
      credentials: "selected.yaml",
      output: "report.yaml",
      format: "json",
      force: true,
    },
  ]);
});

test("docs Commander adapter rejects invalid format before invoking service", async () => {
  const { createDocsCommand } = await import("../dist/commands/docs/index.js");
  let called = false;
  const command = createDocsCommand({
    async execute() {
      called = true;
    },
  }).exitOverride();
  await assert.rejects(
    command.parseAsync(["--format", "toml"], { from: "user" }),
    /Unsupported output format/,
  );
  assert.equal(called, false);
});

test("docs Commander adapter propagates service errors without handling requests itself", async () => {
  const { createDocsCommand } = await import("../dist/commands/docs/index.js");
  const failure = new Error("service failed");
  const command = createDocsCommand({
    async execute() {
      throw failure;
    },
  });
  await assert.rejects(
    command.parseAsync([], { from: "user" }),
    (error) => error === failure,
  );
});

test("docs registration does not invoke its service", async () => {
  const { createDocsCommand } = await import("../dist/commands/docs/index.js");
  let count = 0;
  const command = createDocsCommand({
    async execute() {
      count++;
    },
  });
  assert.equal(command.name(), "docs");
  assert.equal(count, 0);
});
