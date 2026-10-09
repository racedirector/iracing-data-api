const assert = require("node:assert/strict");
const test = require("node:test");
const { mkdtemp, writeFile, readFile, rm, stat } = require("node:fs/promises");
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
const load = () => import("../dist/commands/docs.js");

function dependencies(assertToken, getDocs = async () => DOCS) {
  return {
    createDocumentationApi(accessToken) {
      assertToken?.(accessToken);
      return { getDocs };
    },
  };
}

test("fetches docs once through the injected typed client", async () => {
  const { fetchDocs } = await load();
  let calls = 0;
  const result = await fetchDocs(
    { accessToken: "synthetic" },
    dependencies(
      (token) => assert.equal(token, "synthetic"),
      async () => {
        calls++;
        return DOCS;
      },
    ),
  );
  assert.equal(calls, 1);
  assert.deepEqual(result, DOCS);
});

test("reads JSON and YAML credential files with explicit precedence", async (t) => {
  const { fetchDocs } = await load();
  const dir = await mkdtemp(path.join(os.tmpdir(), "iracing-docs-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  for (const [name, contents] of [
    ["token.json", '{"access_token":"from-file"}'],
    ["token.yaml", "access_token: from-file\n"],
  ]) {
    const file = path.join(dir, name);
    await writeFile(file, contents, { mode: 0o600 });
    await fetchDocs(
      { credentials: file, accessToken: "other" },
      dependencies((token) => assert.equal(token, "from-file")),
    );
  }
});

test("rejects missing credentials and invalid formats before client creation", async () => {
  const { fetchDocs } = await load();
  const neverCreate = {
    createDocumentationApi() {
      assert.fail("must not create client");
    },
  };
  await assert.rejects(
    fetchDocs({ accessToken: " " }, neverCreate),
    /Set IRACING_ACCESS_TOKEN/,
  );
  await assert.rejects(
    fetchDocs({ accessToken: "Bearer synthetic" }, neverCreate),
    /without a Bearer prefix/,
  );
  await assert.rejects(
    fetchDocs({ accessToken: "synthetic", format: "toml" }, neverCreate),
    /Unsupported output format/,
  );
  await assert.rejects(
    fetchDocs({ credentials: "/nonexistent/credentials.json" }, neverCreate),
    /Unable to read credentials/,
  );
});

test("maps generated client HTTP failures without exposing response content", async () => {
  const { fetchDocs } = await load();
  const responseError = (status) => {
    const error = new Error("upstream secret body");
    error.name = "ResponseError";
    error.response = new Response("secret", { status });
    return error;
  };
  await assert.rejects(
    fetchDocs(
      { accessToken: "synthetic" },
      dependencies(undefined, async () => {
        throw responseError(401);
      }),
    ),
    /HTTP 401.*Check token expiry/,
  );
  await assert.rejects(
    fetchDocs(
      { accessToken: "synthetic" },
      dependencies(undefined, async () => {
        throw responseError(500);
      }),
    ),
    /HTTP 500.*service availability/,
  );
  await assert.rejects(
    fetchDocs(
      { accessToken: "synthetic" },
      dependencies(undefined, async () => {
        throw new Error("synthetic secret");
      }),
    ),
    /network connectivity/,
  );
});

test("docs command file output is private and refuses replacement", async (t) => {
  const { createProgram } = await import("../dist/program.js");
  const dir = await mkdtemp(path.join(os.tmpdir(), "iracing-docs-output-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "docs.json");
  const diagnostics = { info() {}, warn() {}, error() {} };
  const program = () => createProgram(diagnostics, dependencies());
  await program().parseAsync(["docs", `--output=${output}`], { from: "user" });
  assert.deepEqual(JSON.parse(await readFile(output, "utf8")), DOCS);
  if (process.platform !== "win32")
    assert.equal((await stat(output)).mode & 0o777, 0o600);
  await assert.rejects(
    program().parseAsync(["docs", "--output", output], { from: "user" }),
    /already exists/,
  );
});

test("snapshot option is retired", async () => {
  const { createProgram } = await import("../dist/program.js");
  const diagnostics = { info() {}, warn() {}, error() {} };
  await assert.rejects(
    createProgram(diagnostics, dependencies()).parseAsync(
      ["docs", "--snapshot"],
      { from: "user" },
    ),
    /unknown option '--snapshot'/,
  );
});

test("uses the repository credential file when no environment token exists", async (t) => {
  const { fetchDocs } = await load();
  const { defaultCredentialsPath } = await import("../dist/credentials.js");
  const saved = process.env.IRACING_ACCESS_TOKEN;
  delete process.env.IRACING_ACCESS_TOKEN;
  t.after(() => {
    if (saved !== undefined) process.env.IRACING_ACCESS_TOKEN = saved;
  });
  await fetchDocs(
    {
      readCredentials: async (file) => {
        assert.equal(file, defaultCredentialsPath);
        return '{"access_token":"default-file"}';
      },
    },
    dependencies((token) => assert.equal(token, "default-file")),
  );
});
