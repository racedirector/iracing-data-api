const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../../..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");
const readJson = (relative) => JSON.parse(read(relative));

test("documented MCP lifecycle command is owned by the root manifest", () => {
  const rootPackage = readJson("package.json");
  const appPackage = readJson("apps/iracing-data-mcp/package.json");
  const guide = read("apps/iracing-data-mcp/local-container.md");
  const helper = read("apps/iracing-data-mcp/scripts/local-container.mjs");

  assert.equal(
    rootPackage.scripts["mcp:local"],
    "node --env-file-if-exists=.env apps/iracing-data-mcp/scripts/local-container.mjs",
  );
  assert.equal(appPackage.scripts["mcp:local"], undefined);
  assert.match(
    guide,
    /lifecycle is intentionally owned by the repository-root `package\.json`/,
  );

  for (const command of ["login", "up", "stop", "reset", "status"]) {
    assert.match(guide, new RegExp(`pnpm mcp:local ${command}`));
    assert.match(helper, new RegExp(`case "${command}"`));
  }
});

test(
  "ChatGPT tunnel guidance uses baseline commands and gates optional runtimes",
  () => {
    const guide = read(
      ".agents/skills/iracing-data-mcp-onboarding/references/chatgpt.md",
    );

    for (const command of [
      "tunnel-client --version",
      "tunnel-client help quickstart",
      "tunnel-client init --help",
      "tunnel-client doctor --help",
      "tunnel-client run --help",
    ]) {
      assert.match(
        guide,
        new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    }

    assert.match(guide, /optional version-specific conveniences/);
    assert.match(guide, /tunnel-client runtimes --help/);
    assert.doesNotMatch(
      guide,
      /For a long-lived local process, use the client's managed runtime supervision:/,
    );
    assert.match(guide, /never invent a missing command/i);
  },
);
