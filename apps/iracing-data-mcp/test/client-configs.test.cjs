const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../../..");
const endpoint = "http://127.0.0.1:3000/mcp";
const readJson = (relative) =>
  JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

// These are transport-only entries. An allowlist prevents accidental credentials,
// shell launchers, model/provider selection, or blanket tool approval in presets.
function transportOnly(entry, keys, urlKey = "url") {
  assert.equal(entry[urlKey], endpoint);
  for (const key of Object.keys(entry)) {
    assert.ok(keys.includes(key), `Unexpected client setting: ${key}`);
  }
}

test("portable Claude Code/Copilot config uses HTTP with no auth or command", () => {
  const config = readJson(".mcp.json");
  assert.deepEqual(Object.keys(config), ["mcpServers"]);
  assert.deepEqual(Object.keys(config.mcpServers), ["iracing-data"]);
  const entry = config.mcpServers["iracing-data"];
  transportOnly(entry, ["type", "url"]);
  assert.equal(entry.type, "http");
});

test("Cursor config uses its URL entry without spawning another owner", () => {
  const entry = readJson(".cursor/mcp.json").mcpServers["iracing-data"];
  transportOnly(entry, ["url"]);
});

test("Gemini uses Streamable HTTP rather than its SSE URL and retains approvals", () => {
  const entry = readJson(".gemini/settings.json").mcpServers["iracing-data"];
  transportOnly(entry, ["httpUrl", "timeout", "trust"], "httpUrl");
  assert.equal(entry.trust, false);
  assert.ok(entry.timeout > 0);
});

test("Codex project config has only a loopback MCP URL", async () => {
  const { parse } = await import("smol-toml");
  const config = parse(
    fs.readFileSync(path.join(root, ".codex/config.toml"), "utf8"),
  );
  assert.deepEqual(Object.keys(config), ["mcp_servers"]);
  transportOnly(config.mcp_servers["iracing-data"], ["url"]);
});

test("OpenCode disables MCP OAuth while keeping the HTTP connection enabled", () => {
  const config = readJson("opencode.json");
  assert.deepEqual(Object.keys(config).sort(), ["$schema", "mcp"]);
  const entry = config.mcp["iracing-data"];
  transportOnly(entry, ["type", "url", "enabled", "oauth", "timeout"]);
  assert.equal(entry.type, "remote");
  assert.equal(entry.oauth, false);
  assert.equal(entry.enabled, true);
  assert.ok(entry.timeout > 0);
});

test("Cline explicitly uses Streamable HTTP and does not auto-approve tools", () => {
  const entry = readJson("apps/iracing-data-mcp/client-configs/cline.json")
    .mcpServers["iracing-data"];
  transportOnly(entry, ["type", "url", "disabled", "autoApprove"]);
  assert.equal(entry.type, "streamableHttp");
  assert.equal(entry.disabled, false);
  assert.deepEqual(entry.autoApprove, []);
});
