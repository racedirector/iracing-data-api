const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { localSession } = require("../test/fixtures/local-session.cjs");

// Build the dependency closure first. This test packs the real publication
// artifacts and installs them outside the workspace, without publishing.
test(
  "packed runtime installs and serves MCP through its public executable",
  { timeout: 120000 },
  async (t) => {
    const root = path.resolve(__dirname, "../../..");
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "iracing-mcp-package-"),
    );
    t.after(() => fs.rm(directory, { recursive: true, force: true }));
    const run = (command, args, cwd = root) => {
      const result = spawnSync(command, args, {
        cwd,
        encoding: "utf8",
        timeout: 90000,
      });
      assert.equal(
        result.status,
        0,
        `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`,
      );
      return result.stdout;
    };
    const { workspaces } = require("../../../workspace-policy.json");
    const packed = new Map();
    async function pack(name) {
      if (packed.has(name)) return;
      const entry = workspaces.find((item) => item.name === name);
      assert.ok(entry);
      const manifest = require(path.join(root, entry.path, "package.json"));
      assert.notEqual(manifest.private, true);
      for (const [dependency, version] of Object.entries(
        manifest.dependencies ?? {},
      )) {
        if (version.startsWith("workspace:")) await pack(dependency);
      }
      const archive = path.join(
        directory,
        `${name.replaceAll("/", "-").replace("@", "")}.tgz`,
      );
      run("pnpm", ["--filter", name, "pack", "--out", archive]);
      packed.set(name, archive);
    }
    await pack("@iracing-data/iracing-data-mcp");
    await fs.writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ private: true }),
    );
    run(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
        ...packed.values(),
      ],
      directory,
    );
    const runtimePath = path.join(
      directory,
      "node_modules/@iracing-data/iracing-data-mcp",
    );
    const manifest = JSON.parse(
      await fs.readFile(path.join(runtimePath, "package.json"), "utf8"),
    );
    assert.equal(manifest.bin["iracing-data-mcp"], "dist/main.js");
    assert.ok(
      (
        await fs.readFile(
          path.join(runtimePath, manifest.bin["iracing-data-mcp"]),
          "utf8",
        )
      ).startsWith("#!/usr/bin/env node\n"),
    );
    assert.ok(!JSON.stringify(manifest.dependencies).includes("workspace:"));
    await assert.rejects(fs.stat(path.join(runtimePath, "src")), {
      code: "ENOENT",
    });
    const { pathToFileURL } = require("node:url");
    const api = await import(
      pathToFileURL(path.join(runtimePath, manifest.main)).href
    );
    assert.equal(typeof api.createTokenProvider, "function");
    assert.equal("createFileAccessTokenProvider" in api, false);
    assert.equal("createFileCapabilities" in api, false);
    assert.equal("validateFileSession" in api, false);
    assert.equal(typeof api.createFetchQueries, "function");
    assert.equal(typeof api.createHttpTransport, "function");
    assert.equal(typeof api.createStdioTransport, "function");
    assert.equal(typeof api.createMcpServices, "function");
    assert.equal(typeof api.McpServices, "function");
    assert.equal(manifest.dependencies.awilix, undefined);
    assert.equal(manifest.exports["."].import, "./dist/index.js");
    await fs.stat(path.join(runtimePath, manifest.exports["."].types));
    const fixture = await localSession(t);
    const { Client } = await import("@modelcontextprotocol/client");
    const { StdioClientTransport } =
      await import("@modelcontextprotocol/client/stdio");
    const client = new Client({ name: "packed-smoke", version: "1" });
    const env = fixture.env;
    const transport = new StdioClientTransport({
      command: path.join(directory, "node_modules/.bin/iracing-data-mcp"),
      args: ["serve", "--credentials", fixture.file],
      cwd: directory,
      env,
      stderr: "pipe",
    });
    let stderr = "";
    transport.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    try {
      await client.connect(transport);
      assert.deepEqual(
        (await client.listTools()).tools.map((tool) => tool.name),
        ["get_my_driver", "get_recent_races", "search_race_results"],
      );
    } finally {
      await client.close();
    }
    assert.doesNotMatch(stderr, /synthetic-refresh|synthetic-token/);
    const missing = spawnSync(
      path.join(directory, "node_modules/.bin/iracing-data-mcp"),
      ["serve", "--transport", "unsupported"],
      { cwd: directory, env, encoding: "utf8", timeout: 10000 },
    );
    assert.equal(missing.status, 1);
    assert.equal(missing.stdout, "");
    assert.match(missing.stderr, /--transport/);
  },
);
