const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const { localSession } = require("./fixtures/local-session.cjs");

test("Zod applies environment defaults and maps directly to runtime options", async () => {
  const { parseConfig, EnvironmentSchema } = await import("../dist/config.js");
  const config = parseConfig({});
  assert.deepEqual(EnvironmentSchema.parse({}), config);
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.port, 3000);
  assert.equal(
    config.credentialsFile,
    path.resolve(
      process.cwd(),
      ".iracing-data/iracing-data-mcp/credentials.json",
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
    { clientId: "synthetic-client", scopes: [] },
  );
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
    args: ["exec", "iracing-data-mcp"],
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
      "--credentials",
      fixture.file,
    ],
    env: { ...fixture.env, IRACING_MCP_CREDENTIAL_FILE: "" },
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
    `IRACING_AUTH_CLIENT=synthetic-client\nIRACING_MCP_CREDENTIAL_FILE=${fixture.file}\n`,
  );
  for (const inherited of [
    undefined,
    path.join(fixture.directory, "missing.json"),
  ]) {
    const env = { ...fixture.env };
    delete env.IRACING_MCP_CREDENTIAL_FILE;
    delete env.IRACING_AUTH_CLIENT;
    if (inherited) env.IRACING_MCP_CREDENTIAL_FILE = inherited;
    const client = new Client({ name: "env-test", version: "1" });
    const transport = new StdioClientTransport({
      command: path.resolve(__dirname, "../../../node_modules/.bin/dotenv"),
      args: [
        "-e",
        file,
        "--",
        path.resolve(__dirname, "../../../node_modules/.bin/iracing-data-mcp"),
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
      if (inherited) {
        await assert.rejects(client.connect(transport));
      } else {
        await client.connect(transport);
        assert.equal((await client.listTools()).tools.length, 3);
      }
      await client.close();
      if (inherited) assert.ok(stderr.includes(inherited), stderr);
      else assert.equal(stderr, "");
    } finally {
      await client.close();
    }
  }
});

test("stdio registration validation is explicit and HTTP configuration stays independent", async () => {
  const { parseConfig, parseStdioConfig } = await import("../dist/config.js");
  assert.equal(parseConfig({}).port, 3000);
  for (const value of [undefined, "", " \t"]) {
    assert.throws(
      () => parseStdioConfig({ IRACING_AUTH_CLIENT: value }),
      /IRACING_AUTH_CLIENT/,
    );
  }
  const config = parseStdioConfig({
    IRACING_AUTH_CLIENT: "fixture",
    IRACING_AUTH_SECRET: "",
  });
  assert.deepEqual(config.clientMetadata, {
    clientId: "fixture",
    clientSecret: undefined,
    scopes: [],
  });
  const secret = "SECRET_MUST_NOT_BE_PRINTED";
  assert.throws(
    () =>
      parseStdioConfig({
        IRACING_MCP_PORT: secret,
        IRACING_AUTH_SECRET: secret,
      }),
    (error) => {
      assert.match(error.message, /IRACING_AUTH_CLIENT/);
      assert.match(error.message, /IRACING_MCP_PORT/);
      assert.match(error.message, /#environment-configuration/);
      assert.ok(!error.message.includes(secret));
      return true;
    },
  );
});

test("startup fails usefully before protocol output for missing configuration and credentials", async (t) => {
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
    [missingRegistration, [], /IRACING_AUTH_CLIENT/],
    [
      { ...fixture.env, IRACING_MCP_PORT: "invalid-secret" },
      [],
      /IRACING_MCP_PORT/,
    ],
    [
      {
        ...fixture.env,
        IRACING_MCP_CREDENTIAL_FILE: path.join(
          fixture.directory,
          "missing.json",
        ),
      },
      [],
      /No OAuth session found/,
    ],
    [
      fixture.env,
      ["--env-file-if-exists", ".env"],
      /Supported option: --credentials/,
    ],
  ]) {
    const result = spawnSync(binary, args, {
      cwd: fixture.directory,
      env,
      encoding: "utf8",
      timeout: 10000,
    });
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, expected);
    assert.match(result.stderr, /#environment-configuration/);
    assert.ok(!result.stderr.includes("invalid-secret"));
    assert.ok(!result.stderr.includes("synthetic-refresh"));
  }
  await fs.writeFile(fixture.file, "invalid JSON", { mode: 0o600 });
  const corrupt = spawnSync(binary, [], {
    cwd: fixture.directory,
    env: fixture.env,
    encoding: "utf8",
    timeout: 10000,
  });
  assert.equal(corrupt.status, 1);
  assert.equal(corrupt.stdout, "");
  assert.match(corrupt.stderr, /invalid_document/);
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
