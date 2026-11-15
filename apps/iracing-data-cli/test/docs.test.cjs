const assert = require("node:assert/strict");
const { mkdtemp, readFile, rm, stat, writeFile } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

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
const loadService = () => import("../dist/commands/docs/service.js");
const options = { accessToken: "synthetic", format: "json", force: false };

async function fixture(overrides = {}) {
  const { createDocsService } = await loadService();
  return createDocsService({
    diagnostics,
    fetch: async () => Response.json(DOCS),
    async writeDocumentOutput() {},
    ...overrides,
  });
}

test("docs command parses flags and calls its injected capability", async () => {
  const { createDocsCommand } = await loadCommand();
  const events = [];
  const command = createDocsCommand({
    async fetchDocs(input) {
      events.push(input);
    },
    present() {
      events.push("present");
    },
  });
  await command.parseAsync(
    [
      "--credentials",
      "credentials.json",
      "--output",
      "docs.yaml",
      "--format",
      "yaml",
      "--force",
    ],
    { from: "user" },
  );
  assert.deepEqual(events, [
    {
      credentials: "credentials.json",
      accessToken: undefined,
      output: "docs.yaml",
      format: "yaml",
      force: true,
    },
    "present",
  ]);
});

test("docs validates formats before invoking any service capability", async () => {
  const { createDocsCommand } = await loadCommand();
  const command = createDocsCommand({
    async fetchDocs() {
      assert.fail("service must not be called");
    },
    present() {
      assert.fail("must not report success");
    },
  });
  await assert.rejects(
    command.parseAsync(["--format", "toml"], { from: "user" }),
  );
});

test("docs service makes exactly one authenticated modeled request and preserves the document", async () => {
  const events = [];
  const service = await fixture({
    async fetch(input, init) {
      events.push("request");
      assert.equal(new URL(String(input)).pathname, "/data/doc");
      assert.equal(
        new Headers(init.headers).get("authorization"),
        "Bearer synthetic",
      );
      return Response.json(DOCS);
    },
    async writeDocumentOutput(document, output) {
      events.push("write");
      assert.deepEqual(document, DOCS);
      assert.equal(output.outputLabel, "Documentation");
      assert.equal(output.format, "json");
    },
    diagnostics: {
      info(message) {
        events.push(message);
      },
    },
  });
  const { createExecute } = await loadCommand();
  await createExecute(service)(options);
  assert.deepEqual(events, [
    "request",
    "write",
    "Data API documentation fetched.",
  ]);
});

test("docs service rejects unsupported formats before reading credentials", async () => {
  const service = await fixture({
    async fetch() {
      assert.fail("must not request");
    },
  });
  await assert.rejects(
    service.fetchDocs({
      ...options,
      format: "toml",
      credentials: "missing-file.json",
    }),
    /Unsupported output format/,
  );
});

for (const [label, fetch, expected] of [
  [
    "401",
    async () => new Response("secret", { status: 401 }),
    /HTTP 401.*Check token expiry/,
  ],
  [
    "403",
    async () => new Response("secret", { status: 403 }),
    /HTTP 403.*Check token expiry/,
  ],
  [
    "500",
    async () => new Response("secret", { status: 500 }),
    /HTTP 500.*service availability/,
  ],
  [
    "transport",
    async () => {
      throw new Error("secret");
    },
    /network connectivity/,
  ],
  ["invalid JSON", async () => new Response("secret"), /network connectivity/],
]) {
  test(`docs safely maps ${label} failures without output or success`, async () => {
    const { createExecute } = await loadCommand();
    const service = await fixture({
      fetch,
      async writeDocumentOutput() {
        assert.fail("must not write");
      },
      diagnostics: {
        info() {
          assert.fail("must not report success");
        },
      },
    });
    await assert.rejects(createExecute(service)(options), (error) => {
      assert.match(error.message, expected);
      assert.doesNotMatch(error.message, /secret/);
      return true;
    });
  });
}

test("docs retains private file output, overwrite protection, and explicit force", async (t) => {
  const { createDocsCommand } = await loadCommand();
  const { writeDocumentOutput } = await import("../dist/token-output.js");
  const dir = await mkdtemp(path.join(os.tmpdir(), "iracing-docs-output-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "docs.json");
  const service = await fixture({ writeDocumentOutput });
  const command = () => createDocsCommand(service);
  // The test service uses real credential selection, without reading user credentials.
  const { createRootCommand } = require("./root-command.cjs");
  const run = async (flags) => {
    const root = (await createRootCommand()).addCommand(command());
    await root.parseAsync(
      ["--access-token", "synthetic", "docs", "--output", output, ...flags],
      { from: "user" },
    );
  };
  await run([]);
  assert.deepEqual(JSON.parse(await readFile(output, "utf8")), DOCS);
  if (process.platform !== "win32")
    assert.equal((await stat(output)).mode & 0o777, 0o600);
  await assert.rejects(run([]), /already exists/);
  await run(["--force"]);
});

test("docs writer failures propagate without reporting success", async () => {
  const { createExecute } = await loadCommand();
  const failure = new Error("fixture writer failure");
  const service = await fixture({
    async writeDocumentOutput() {
      throw failure;
    },
    diagnostics: {
      info() {
        assert.fail("must not report success");
      },
    },
  });
  await assert.rejects(
    createExecute(service)(options),
    (error) => error === failure,
  );
});

test("docs snapshot option remains retired", async () => {
  const { createDocsCommand } = await loadCommand();
  const command = createDocsCommand({
    async fetchDocs() {
      assert.fail("must not invoke service");
    },
    present() {},
  })
    .configureOutput({ writeErr() {} })
    .exitOverride();
  await assert.rejects(
    command.parseAsync(["--snapshot"], { from: "user" }),
    (error) => error.code === "commander.unknownOption",
  );
});

test("docs resolves default credentials through the existing credential owner", async (t) => {
  const { defaultCredentialsPath } = await import("../dist/credentials.js");
  const saved = process.env.IRACING_ACCESS_TOKEN;
  delete process.env.IRACING_ACCESS_TOKEN;
  t.after(() => {
    if (saved === undefined) delete process.env.IRACING_ACCESS_TOKEN;
    else process.env.IRACING_ACCESS_TOKEN = saved;
  });
  let calls = 0;
  const service = await fixture({
    async fetch(_input, init) {
      calls++;
      assert.equal(
        new Headers(init.headers).get("authorization"),
        "Bearer default-file",
      );
      return Response.json(DOCS);
    },
  });
  await service.fetchDocs({
    format: "json",
    force: false,
    readCredentials: async (file) => {
      assert.equal(file, defaultCredentialsPath);
      return '{"access_token":"default-file"}';
    },
  });
  assert.equal(calls, 1);
});

test("docs honors explicit JSON and YAML credentials over a direct token", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "iracing-docs-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  for (const [name, contents] of [
    ["token.json", '{"access_token":"from-file"}'],
    ["token.yaml", "access_token: from-file\n"],
  ]) {
    const file = path.join(dir, name);
    await writeFile(file, contents, { mode: 0o600 });
    const service = await fixture({
      async fetch(_input, init) {
        assert.equal(
          new Headers(init.headers).get("authorization"),
          "Bearer from-file",
        );
        return Response.json(DOCS);
      },
    });
    await service.fetchDocs({ ...options, credentials: file });
  }
});
