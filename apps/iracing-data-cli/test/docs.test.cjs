const assert = require("node:assert/strict");
const test = require("node:test");
const { mkdtemp, readFile, rm, stat, writeFile } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

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
const loadScope = () => import("../dist/commands/docs/scope.js");

function scopeDependencies({
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

test("command factory resolves one invocation scope and runs the docs handler", async () => {
  const { createDocsCommand } = await loadCommand();
  const events = [];
  const command = createDocsCommand({
    async createScope(options) {
      events.push("scope");
      assert.equal(options.credentials, "credentials.json");
      return {
        docs: {
          async get() {
            events.push("get");
            return DOCS;
          },
        },
        output: {
          async write(document) {
            events.push("write");
            assert.deepEqual(document, DOCS);
          },
        },
        diagnostics: {
          ...diagnostics,
          info(message) {
            events.push(message);
          },
        },
      };
    },
  });

  await command.parseAsync(["--credentials", "credentials.json"], {
    from: "user",
  });

  assert.deepEqual(events, [
    "scope",
    "get",
    "write",
    "Data API documentation fetched.",
  ]);
});

test("scope resolves credentials and constructs the generated client once", async () => {
  const { createDocsCommandScopeFactory } = await loadScope();
  let clients = 0;
  let calls = 0;
  const createScope = createDocsCommandScopeFactory(
    diagnostics,
    scopeDependencies({
      accessToken: "resolved-token",
      onToken(token) {
        clients++;
        assert.equal(token, "resolved-token");
      },
      async getDocs() {
        calls++;
        return DOCS;
      },
    }),
  );

  const scope = await createScope({ credentials: "credentials.json" });
  assert.equal(clients, 1);
  assert.deepEqual(await scope.docs.get(), DOCS);
  assert.equal(calls, 1);
});

test("scope validates output format before resolving credentials", async () => {
  const { createDocsCommandScopeFactory } = await loadScope();
  const createScope = createDocsCommandScopeFactory(diagnostics, {
    async resolveAccessToken() {
      assert.fail("credentials must not be resolved");
    },
    createDocumentationClient() {
      assert.fail("client must not be created");
    },
    async writeDocumentOutput() {
      assert.fail("output must not be written");
    },
  });

  await assert.rejects(
    createScope({ format: "toml" }),
    /Unsupported output format/,
  );
});

test("scope maps generated client failures without exposing upstream content", async () => {
  const { createDocsCommandScopeFactory } = await loadScope();
  const responseError = (status) => {
    const error = new Error("upstream secret body");
    error.name = "ResponseError";
    error.response = new Response("secret", { status });
    return error;
  };

  for (const [error, expected] of [
    [responseError(401), /HTTP 401.*Check token expiry/],
    [responseError(500), /HTTP 500.*service availability/],
    [new Error("synthetic secret"), /network connectivity/],
  ]) {
    const createScope = createDocsCommandScopeFactory(
      diagnostics,
      scopeDependencies({
        async getDocs() {
          throw error;
        },
      }),
    );
    const scope = await createScope({});
    await assert.rejects(scope.docs.get(), expected);
  }
});

test("scope owns documentation output policy", async (t) => {
  const { createDocsCommand } = await loadCommand();
  const { createDocsCommandScopeFactory } = await loadScope();
  const { writeDocumentOutput } = await import("../dist/token-output.js");
  const dir = await mkdtemp(path.join(os.tmpdir(), "iracing-docs-output-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "docs.json");

  const createScope = createDocsCommandScopeFactory(
    diagnostics,
    scopeDependencies({ writeOutput: writeDocumentOutput }),
  );
  const command = () => createDocsCommand({ createScope });

  await command().parseAsync([`--output=${output}`], { from: "user" });
  assert.deepEqual(JSON.parse(await readFile(output, "utf8")), DOCS);
  if (process.platform !== "win32")
    assert.equal((await stat(output)).mode & 0o777, 0o600);
  await assert.rejects(
    command().parseAsync(["--output", output], { from: "user" }),
    /already exists/,
  );
});

test("snapshot option is retired", async () => {
  const { createDocsCommand } = await loadCommand();
  const command = createDocsCommand({
    async createScope() {
      assert.fail("scope must not be created");
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

test("scope can resolve the repository credential file through the existing credential owner", async (t) => {
  const { createDocsCommandScopeFactory } = await loadScope();
  const { resolveAccessToken, defaultCredentialsPath } =
    await import("../dist/credentials.js");
  const saved = process.env.IRACING_ACCESS_TOKEN;
  delete process.env.IRACING_ACCESS_TOKEN;
  t.after(() => {
    if (saved === undefined) delete process.env.IRACING_ACCESS_TOKEN;
    else process.env.IRACING_ACCESS_TOKEN = saved;
  });

  let token;
  const createScope = createDocsCommandScopeFactory(diagnostics, {
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
  });

  const scope = await createScope({
    readCredentials: async (file) => {
      assert.equal(file, defaultCredentialsPath);
      return '{"access_token":"default-file"}';
    },
  });
  await scope.docs.get();
  assert.equal(token, "default-file");
});

test("scope honors explicit JSON and YAML credential files", async (t) => {
  const { createDocsCommandScopeFactory } = await loadScope();
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
    const createScope = createDocsCommandScopeFactory(diagnostics, {
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
    });
    const scope = await createScope({
      credentials: file,
      accessToken: "other",
    });
    await scope.docs.get();
    assert.equal(token, "from-file");
  }
});
