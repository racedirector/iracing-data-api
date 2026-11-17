const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const { localSession } = require("./fixtures/local-session.cjs");

test("Zod applies transport defaults and validates runtime options", async () => {
  const { ServeOptionsSchema } =
    await import("../dist/cli/commands/serve/schema.js");
  const parse = (options) =>
    ServeOptionsSchema.parse({
      accessToken: "synthetic-token",
      transport: "http",
      ...options,
    });
  const config = parse({});
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.port, 3000);
  assert.equal(parse({ port: "4555" }).port, 4555);
  for (const invalid of [
    { port: "0" },
    { port: "not-a-number" },
    { port: 65536 },
    { host: "" },
    { transport: "unsupported" },
  ]) {
    assert.throws(() => parse(invalid));
  }
});

test("local stdio capabilities are constructed lazily without network calls", async () => {
  const { createFetchQueries } = await import("../dist/index.js");
  const queries = createFetchQueries(async () => {
    assert.fail("No token lookup while constructing query adapters");
  });
  assert.equal(typeof queries.driverQueries.getCurrent, "function");
  assert.equal(typeof queries.recentRaceQueries.getRecent, "function");
  assert.equal(typeof queries.raceSearchQueries.search, "function");
});

test("local stdio executable initializes and advertises all tools", async (t) => {
  const fixture = await localSession(t);
  const { Client } = await import("@modelcontextprotocol/client");
  const { StdioClientTransport } =
    await import("@modelcontextprotocol/client/stdio");
  const client = new Client({ name: "offline-stdio-test", version: "1" });
  const transport = new StdioClientTransport({
    command: "pnpm",
    args: ["exec", "iracing-data-mcp", "serve"],
    cwd: path.resolve(__dirname, "../../.."),
    env: fixture.env,
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

test("explicit credential path overrides an invalid environment path", async (t) => {
  const fixture = await localSession(t);
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
      "serve",
      "--credentials",
      fixture.file,
    ],
    env: { ...fixture.env, IRACING_CREDENTIALS: "" },
  });

  try {
    await client.connect(transport);
    assert.equal((await client.listTools()).tools.length, 3);
  } finally {
    await client.close();
  }
});

test("dotenv CLI loads environment outside the MCP executable and respects inherited values", async (t) => {
  const fixture = await localSession(t);
  const { Client } = await import("@modelcontextprotocol/client");
  const { StdioClientTransport } =
    await import("@modelcontextprotocol/client/stdio");
  const file = path.join(fixture.directory, ".env");
  await fs.writeFile(
    file,
    `IRACING_AUTH_CLIENT=synthetic-client\nIRACING_CREDENTIALS=${fixture.file}\n`,
  );
  for (const inherited of [
    undefined,
    path.join(fixture.directory, "missing.json"),
  ]) {
    const env = { ...fixture.env };
    delete env.IRACING_CREDENTIALS;
    delete env.IRACING_AUTH_CLIENT;
    if (inherited) env.IRACING_CREDENTIALS = inherited;
    const client = new Client({ name: "env-test", version: "1" });
    const transport = new StdioClientTransport({
      command: path.resolve(__dirname, "../../../node_modules/.bin/dotenv"),
      args: [
        "-e",
        file,
        "--",
        path.resolve(__dirname, "../../../node_modules/.bin/iracing-data-mcp"),
        "serve",
      ],
      cwd: fixture.directory,
      env,
      stderr: "pipe",
    });
    let stderr = "";
    transport.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    try {
      await client.connect(transport);
      assert.equal((await client.listTools()).tools.length, 3);
      if (inherited) {
        const result = await client.callTool({
          name: "get_my_driver",
          arguments: {},
        });
        assert.equal(result.isError, true);
        assert.equal(
          result.structuredContent.error.code,
          "AUTHORIZATION_REQUIRED",
        );
      }
      await client.close();
      assert.ok(!stderr.includes("synthetic-refresh"));
    } finally {
      await client.close();
    }
  }
});

test("registration validation permits explicit access tokens without OAuth metadata", async () => {
  const { ServeOptionsSchema } =
    await import("../dist/cli/commands/serve/schema.js");
  for (const value of [undefined, "", " \t"]) {
    assert.equal(
      ServeOptionsSchema.safeParse({
        transport: "stdio",
        credentials: "credentials.json",
        clientId: value,
      }).success,
      false,
    );
  }
  const config = ServeOptionsSchema.parse({
    transport: "stdio",
    clientId: "fixture",
    credentials: "credentials.json",
  });
  assert.equal(config.clientId, "fixture");
  assert.deepEqual(
    ServeOptionsSchema.parse({
      transport: "stdio",
      accessToken: "synthetic-token",
    }),
    { transport: "stdio", accessToken: "synthetic-token" },
  );
});

test("startup rejects invalid configuration before protocol output", async (t) => {
  const fixture = await localSession(t);
  const binary = path.resolve(
    __dirname,
    "../../../node_modules/.bin/iracing-data-mcp",
  );
  // A local .env must not be loaded by the MCP executable itself.
  await fs.writeFile(
    path.join(fixture.directory, ".env"),
    "IRACING_AUTH_CLIENT=from-file\n",
  );
  const missingRegistration = { ...fixture.env };
  delete missingRegistration.IRACING_AUTH_CLIENT;
  for (const [env, args, expected] of [
    [missingRegistration, [], /Invalid input/],
    [fixture.env, ["--transport", "unsupported"], /--transport/],
    [fixture.env, ["--env-file-if-exists", ".env"], /unknown option/],
  ]) {
    const result = spawnSync(binary, ["serve", ...args], {
      cwd: fixture.directory,
      env,
      encoding: "utf8",
      timeout: 10000,
    });
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, expected);
    assert.ok(!result.stderr.includes("invalid-secret"));
    assert.ok(!result.stderr.includes("synthetic-refresh"));
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
