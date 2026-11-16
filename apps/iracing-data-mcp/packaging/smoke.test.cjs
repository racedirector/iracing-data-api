const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

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
    assert.equal(typeof api.createFileAccessTokenProvider, "function");
    assert.equal(typeof api.createFetchQueries, "function");
    await fs.writeFile(
      path.join(directory, ".env"),
      "IRACING_MCP_CREDENTIAL_FILE=from-env.json\nIRACING_AUTH_CLIENT=synthetic-client\n",
    );
    const { Client } = await import("@modelcontextprotocol/client");
    const { StdioClientTransport } =
      await import("@modelcontextprotocol/client/stdio");
    const client = new Client({ name: "packed-smoke", version: "1" });
    const env = { ...process.env };
    delete env.IRACING_MCP_CREDENTIAL_FILE;
    delete env.IRACING_AUTH_CLIENT;
    delete env.IRACING_AUTH_SECRET;
    const transport = new StdioClientTransport({
      command: path.join(directory, "node_modules/.bin/iracing-data-mcp"),
      args: [
        "--env-file-if-exists",
        ".env",
        "--credentials",
        "explicit-missing.json",
      ],
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
      const result = await client.callTool({
        name: "get_my_driver",
        arguments: {},
      });
      assert.equal(result.isError, true);
      assert.ok(JSON.stringify(result).includes("AUTHORIZATION_REQUIRED"));
      assert.ok(!JSON.stringify(result).includes("explicit-missing.json"));
      assert.ok(stderr.includes("explicit-missing.json"));
      assert.ok(!stderr.includes("from-env.json"));
    } finally {
      await client.close();
    }
  },
);
