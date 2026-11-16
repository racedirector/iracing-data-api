const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

test("Zod applies environment defaults and maps directly to runtime options", async () => {
  const { parseConfig, EnvironmentSchema } = await import("../dist/config.js");
  const config = parseConfig({});
  assert.deepEqual(EnvironmentSchema.parse({}), config);
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.port, 3000);
  assert.equal(
    config.credentialsFile,
    path.resolve(
      __dirname,
      "../../../.iracing-data/iracing-data-mcp/credentials.json",
    ),
  );
  assert.equal(parseConfig({ IRACING_MCP_PORT: "4555" }).port, 4555);
  assert.equal(
    parseConfig({ IRACING_MCP_CREDENTIAL_FILE: "/custom/credentials.json" })
      .credentialsFile,
    "/custom/credentials.json",
  );
  for (const invalid of [
    { IRACING_MCP_PORT: "0" },
    { IRACING_MCP_PORT: "not-a-number" },
    { IRACING_MCP_CREDENTIAL_FILE: "" },
  ]) {
    assert.throws(() => parseConfig(invalid));
  }
});

test("local stdio capabilities are constructed lazily without network calls", async () => {
  const { createFileCapabilities } = await import("../dist/credentials.js");
  const queries = createFileCapabilities(
    "/tmp/unconfigured-iracing-mcp-test-token.json",
  );
  assert.equal(typeof queries.driverQueries.getCurrent, "function");
  assert.equal(typeof queries.recentRaceQueries.getRecent, "function");
  assert.equal(typeof queries.raceSearchQueries.search, "function");
});

test("local stdio executable initializes and advertises all tools", async () => {
  const { Client } = await import("@modelcontextprotocol/client");
  const { StdioClientTransport } =
    await import("@modelcontextprotocol/client/stdio");
  const client = new Client({ name: "offline-stdio-test", version: "1" });
  const transport = new StdioClientTransport({
    command: "pnpm",
    args: ["exec", "iracing-data-mcp", "--env-file-if-exists", "missing.env"],
    cwd: path.resolve(__dirname, "../../.."),
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
});

test("explicit credential path overrides an invalid environment path", async () => {
  const { Client } = await import("@modelcontextprotocol/client");
  const { StdioClientTransport } =
    await import("@modelcontextprotocol/client/stdio");
  const client = new Client({
    name: "offline-credential-override",
    version: "1",
  });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      path.resolve(__dirname, "../dist/main.js"),
      "--credentials",
      path.resolve(__dirname, "missing-credentials.json"),
    ],
    env: { ...process.env, IRACING_MCP_CREDENTIAL_FILE: "" },
  });

  try {
    await client.connect(transport);
    assert.equal((await client.listTools()).tools.length, 3);
  } finally {
    await client.close();
  }
});

test("public executable loads optional environment files without overriding inherited values", async (t) => {
  const fs = require("node:fs/promises");
  const os = require("node:os");
  const { Client } = await import("@modelcontextprotocol/client");
  const { StdioClientTransport } =
    await import("@modelcontextprotocol/client/stdio");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-env-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, ".env");
  await fs.writeFile(file, "IRACING_MCP_CREDENTIAL_FILE=from-env.json\n");
  for (const inherited of [undefined, path.join(directory, "inherited.json")]) {
    const env = { ...process.env };
    delete env.IRACING_MCP_CREDENTIAL_FILE;
    if (inherited) env.IRACING_MCP_CREDENTIAL_FILE = inherited;
    const client = new Client({ name: "env-test", version: "1" });
    const transport = new StdioClientTransport({
      command: path.resolve(
        __dirname,
        "../../../node_modules/.bin/iracing-data-mcp",
      ),
      args: ["--env-file-if-exists", file],
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
      const result = await client.callTool({
        name: "get_my_driver",
        arguments: {},
      });
      assert.equal(result.isError, true);
      await client.close();
      assert.ok(stderr.includes(inherited ?? "from-env.json"), stderr);
    } finally {
      await client.close();
    }
  }
});

test("invalid actor search capabilities fail closed with a safe configuration error", async () => {
  const { composeMcpServices } = await import("../dist/composition.js");
  const { errorEnvelope, createRequestContext } =
    await import("@iracing-data/mcp");
  const services = composeMcpServices(
    { id: "alice", provider: "test" },
    () => ({
      driverQueries: { getCurrent: async () => ({ cust_id: 1 }) },
      recentRaceQueries: { getRecent: async () => ({ cust_id: 1, races: [] }) },
    }),
  );
  await assert.rejects(
    services.getRaceSearchQueries({
      signal: new AbortController().signal,
    }),
    (error) => {
      const envelope = errorEnvelope(error, createRequestContext());
      assert.equal(envelope.error.code, "CONFIGURATION_ERROR");
      return true;
    },
  );
});
