const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const readJson = (relative) => JSON.parse(read(relative));

test("MCP lifecycle docs match the implementation", () => {
  const rootPackage = readJson("package.json");
  const appPackage = readJson("apps/iracing-data-mcp/package.json");
  const guide = read("apps/iracing-data-mcp/local-container.md");
  const helper = read("apps/iracing-data-mcp/scripts/local-container.mjs");

  assert.equal(
    rootPackage.scripts["mcp:local"],
    "node --env-file-if-exists=.env apps/iracing-data-mcp/scripts/local-container.mjs",
  );
  assert.equal(appPackage.scripts["mcp:local"], undefined);
  assert.ok(guide.includes("repository-root `package.json`"));

  for (const command of ["login", "up", "stop", "reset", "status"]) {
    assert.ok(guide.includes(`pnpm mcp:local ${command}`));
    assert.ok(helper.includes(`case "${command}"`));
  }
});

test("ChatGPT tunnel docs gate optional runtimes", () => {
  const guide = read(
    ".agents/skills/iracing-data-mcp-onboarding/references/chatgpt.md",
  );
  const baselineCommands = [
    "tunnel-client --version",
    "tunnel-client help quickstart",
    "tunnel-client init --help",
    "tunnel-client doctor --help",
    "tunnel-client run --help",
  ];

  for (const command of baselineCommands) {
    assert.ok(guide.includes(command));
  }

  assert.ok(guide.includes("optional version-specific conveniences"));
  assert.ok(guide.includes("tunnel-client runtimes --help"));
  assert.ok(!guide.includes("use the client's managed runtime supervision"));
  assert.match(guide, /never invent a missing command/i);
});
