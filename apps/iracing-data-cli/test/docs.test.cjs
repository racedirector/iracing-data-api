const assert = require("node:assert/strict");
const { mkdtemp, readFile, rm, stat, writeFile } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const responseError = (status) => {
  const error = new Error("upstream secret body");
  error.name = "ResponseError";
  error.response = new Response("secret", { status });
  return error;
};

const DOCS = {
  car: {
    get: {
      link: "https://members-ng.iracing.com/data/car/get",
      note: ["retained unknown field"],
    },
  },
};

const diagnostics = { info() {}, warn() {}, error() {} };
const loadCommand = () => import("../dist/commands/docs/command.js");
const loadExecutor = () => import("../dist/commands/docs/execute.js");

function testIo({
  accessToken = "synthetic",
  getDocs = async () => DOCS,
  writeOutput = async () => {},
  onOptions,
  onToken,
} = {}) {
  return {
    async resolveAccessToken(options) {
      onOptions?.(options);
      return accessToken;
    },
    createDocumentationClient(token) {
      onToken?.(token);
      return { getDocs };
    },
    writeDocumentOutput: writeOutput,
  };
}

async function commandWithIo(io, overrides = {}) {
  const { createDocsCommand } = await loadCommand();
  const { executeDocs } = await loadExecutor();
  return createDocsCommand({
    diagnostics,
    resolveAccessToken: (options) =>
      io.resolveAccessToken({ ...overrides, ...options }),
    execute: (options, context) =>
      executeDocs({ ...overrides, ...options }, context, io),
  });
}

test("command registration/help is lazy and invocation resolves then executes once", async () => {
  const { createDocsCommand } = await loadCommand();
  const events = [];
  const command = createDocsCommand({
    diagnostics,
    async resolveAccessToken(options) {
      events.push("token");
      assert.equal(options.credentials, "token.json");
      return "resolved";
    },
    async execute(options, context) {
      events.push("execute");
      assert.equal(context.accessToken, "resolved");
      assert.equal(context.diagnostics, diagnostics);
      assert.equal(options.credentials, "token.json");
    },
  })
    .configureOutput({ writeOut() {}, writeErr() {} })
    .exitOverride();
  assert.deepEqual(events, []);
  await assert.rejects(command.parseAsync(["--help"], { from: "user" }), {
    code: "commander.helpDisplayed",
  });
  assert.deepEqual(events, []);
  await command.parseAsync(["--credentials", "token.json"], { from: "user" });
  assert.deepEqual(events, ["token", "execute"]);
});

test("invalid format and Commander input never resolve credentials", async () => {
  const { createDocsCommand } = await loadCommand();
  for (const args of [
    ["--format", "toml"],
    ["--credentials"],
    ["--snapshot"],
  ]) {
    const command = createDocsCommand({
      diagnostics,
      async resolveAccessToken() {
        assert.fail("token lookup");
      },
      async execute() {
        assert.fail("execution");
      },
    })
      .configureOutput({ writeErr() {} })
      .exitOverride();
    await assert.rejects(command.parseAsync(args, { from: "user" }));
  }
});

test("credential rejection prevents execution", async () => {
  const { createDocsCommand } = await loadCommand();
  const failure = new Error("credential failure");
  const command = createDocsCommand({
    diagnostics,
    async resolveAccessToken() {
      throw failure;
    },
    async execute() {
      assert.fail("execution");
    },
  });
  await assert.rejects(
    command.parseAsync([], { from: "user" }),
    (error) => error === failure,
  );
});

test("executor fetches and writes once before success; writer errors retain identity", async () => {
  const { executeDocs } = await loadExecutor();
  const events = [];
  const context = {
    accessToken: "resolved",
    diagnostics: {
      ...diagnostics,
      info(message) {
        events.push(message);
      },
    },
  };
  const failure = new Error("output failure");
  const io = {
    createDocumentationClient(token) {
      assert.equal(token, "resolved");
      events.push("client");
      return {
        async getDocs() {
          events.push("get");
          return DOCS;
        },
      };
    },
    async writeDocumentOutput(document, options) {
      assert.equal(document, DOCS);
      assert.equal(options.outputLabel, "Documentation");
      events.push("write");
    },
  };
  await executeDocs({}, context, io);
  assert.deepEqual(events, [
    "client",
    "get",
    "write",
    "Data API documentation fetched.",
  ]);
  events.length = 0;
  await assert.rejects(
    executeDocs({}, context, {
      ...io,
      async writeDocumentOutput() {
        throw failure;
      },
    }),
    (error) => error === failure,
  );
  assert.deepEqual(events, ["client", "get"]);
});

test("executor maps generated client failures without exposing upstream content", async () => {
  for (const [error, expected] of [
    [responseError(403), /HTTP 403.*Check token expiry/],
    [responseError(401), /HTTP 401.*Check token expiry/],
    [responseError(500), /HTTP 500.*service availability/],
    [new Error("synthetic secret"), /network connectivity/],
  ]) {
    const { executeDocs } = await loadExecutor();
    const io = testIo({
      async getDocs() {
        throw error;
      },
      async writeOutput() {
        assert.fail("failed request must not write");
      },
    });
    await assert.rejects(
      executeDocs({}, { accessToken: "synthetic", diagnostics }, io),
      (mapped) => {
        assert.match(mapped.message, expected);
        assert.doesNotMatch(mapped.message, /secret/);
        assert.equal(mapped.cause, error);
        return true;
      },
    );
  }
});

test("executor owns documentation output policy", async (t) => {
  const { writeDocumentOutput } = await import("../dist/token-output.js");
  const dir = await mkdtemp(path.join(os.tmpdir(), "iracing-docs-output-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "docs.json");

  const io = testIo({ writeOutput: writeDocumentOutput });
  const command = () => commandWithIo(io);

  await (await command()).parseAsync([`--output=${output}`], { from: "user" });
  assert.deepEqual(JSON.parse(await readFile(output, "utf8")), DOCS);
  if (process.platform !== "win32")
    assert.equal((await stat(output)).mode & 0o777, 0o600);
  await assert.rejects(
    (await command()).parseAsync(["--output", output], { from: "user" }),
    /already exists/,
  );
});

test("snapshot option is retired", async () => {
  const { createDocsCommand } = await loadCommand();
  const command = createDocsCommand({
    diagnostics,
    async resolveAccessToken() {
      assert.fail("token must not be resolved");
    },
    async execute() {
      assert.fail("executor must not run");
    },
  });
  command.configureOutput({ writeErr() {} });
  command.exitOverride();

  await assert.rejects(
    command.parseAsync(["--snapshot"], { from: "user" }),
    (error) => {
      assert.equal(error.code, "commander.unknownOption");
      assert.match(error.message, /unknown option '--snapshot'/);
      return true;
    },
  );
});

test("command can resolve the repository credential file through the existing credential owner", async (t) => {
  const { resolveAccessToken, defaultCredentialsPath } =
    await import("../dist/credentials.js");
  const saved = process.env.IRACING_ACCESS_TOKEN;
  delete process.env.IRACING_ACCESS_TOKEN;
  t.after(() => {
    if (saved === undefined) delete process.env.IRACING_ACCESS_TOKEN;
    else process.env.IRACING_ACCESS_TOKEN = saved;
  });

  let token;
  const io = {
    resolveAccessToken,
    createDocumentationClient(accessToken) {
      token = accessToken;
      return {
        async getDocs() {
          return DOCS;
        },
      };
    },
    async writeDocumentOutput() {},
  };

  const command = await commandWithIo(io, {
    readCredentials: async (file) => {
      assert.equal(file, defaultCredentialsPath);
      return '{"access_token":"default-file"}';
    },
  });
  await command.parseAsync([], { from: "user" });
  assert.equal(token, "default-file");
});

test("command honors explicit JSON and YAML credential files", async (t) => {
  const { resolveAccessToken } = await import("../dist/credentials.js");
  const dir = await mkdtemp(path.join(os.tmpdir(), "iracing-docs-"));
  t.after(() => rm(dir, { recursive: true, force: true }));

  for (const [name, contents] of [
    ["token.json", '{"access_token":"from-file"}'],
    ["token.yaml", "access_token: from-file\n"],
  ]) {
    const file = path.join(dir, name);
    await writeFile(file, contents, { mode: 0o600 });
    let token;
    const io = {
      resolveAccessToken,
      createDocumentationClient(accessToken) {
        token = accessToken;
        return {
          async getDocs() {
            return DOCS;
          },
        };
      },
      async writeDocumentOutput() {},
    };
    const command = await commandWithIo(io, {
      credentials: file,
      accessToken: "other",
    });
    await command.parseAsync(["--credentials", file], { from: "user" });
    assert.equal(token, "from-file");
  }
});

test("selected invalid credentials fail closed before client construction", async () => {
  const { resolveAccessToken } = await import("../dist/credentials.js");
  for (const readCredentials of [
    async () => "invalid-json",
    async () => {
      throw new Error("secret");
    },
  ]) {
    const command = await commandWithIo(
      {
        resolveAccessToken,
        createDocumentationClient() {
          assert.fail("client must not be constructed");
        },
        async writeDocumentOutput() {
          assert.fail("output must not be written");
        },
      },
      { accessToken: "fallback", readCredentials },
    );
    await assert.rejects(
      command.parseAsync(["--credentials", "selected.json"], { from: "user" }),
      /Unable to read credentials/,
    );
  }
});

test("executor preserves JSON stdout and YAML file output with force replacement", async (t) => {
  const { executeDocs } = await loadExecutor();
  const { writeDocumentOutput } = await import("../dist/token-output.js");
  const { parse } = await import("yaml");
  const dir = await mkdtemp(path.join(os.tmpdir(), "iracing-docs-formats-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const io = testIo({ writeOutput: writeDocumentOutput });
  const context = { accessToken: "synthetic", diagnostics };
  const stdout = [];
  await executeDocs({ writeStdout: (text) => stdout.push(text) }, context, io);
  assert.equal(stdout.length, 1);
  assert.equal(stdout[0], JSON.stringify(DOCS, null, 2) + "\n");
  const output = path.join(dir, "docs.yaml");
  await writeFile(output, "old");
  await executeDocs(
    {
      output,
      force: true,
      writeStdout() {
        assert.fail("file output must leave stdout empty");
      },
    },
    context,
    io,
  );
  assert.deepEqual(parse(await readFile(output, "utf8")), DOCS);
});
