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
test("fetches docs once with authentication and preserves undocumented fields", async () => {
  const { fetchDocs } = await load();
  let calls = 0;
  const result = await fetchDocs({
    accessToken: "synthetic",
    fetcher: async (url, options) => {
      calls++;
      assert.equal(url, "https://members-ng.iracing.com/data/doc");
      assert.equal(options.headers.Authorization, "Bearer synthetic");
      assert.equal(options.redirect, "error");
      assert.ok(options.signal);
      return Response.json(DOCS);
    },
  });
  assert.equal(calls, 1);
  assert.deepEqual(result, DOCS);
});
test("snapshot output validates and records live provenance", async () => {
  const { fetchDocs } = await load();
  const result = await fetchDocs({
    accessToken: "synthetic",
    snapshot: true,
    fetcher: async () => Response.json(DOCS),
  });
  const { validateSnapshot } =
    await import("../../../scripts/upstream-contract.mjs");
  assert.equal(validateSnapshot(result), result);
  assert.equal(result.provenance.mode, "live");
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
    await fetchDocs({
      credentials: file,
      accessToken: "other",
      fetcher: async (_url, options) => {
        assert.equal(options.headers.Authorization, "Bearer from-file");
        return Response.json(DOCS);
      },
    });
  }
});
test("rejects missing credentials and invalid formats before network", async () => {
  const { fetchDocs } = await load();
  const fetcher = () => assert.fail("must not fetch");
  await assert.rejects(
    fetchDocs({ accessToken: " ", fetcher }),
    /Set IRACING_ACCESS_TOKEN/,
  );
  await assert.rejects(
    fetchDocs({ accessToken: "Bearer synthetic", fetcher }),
    /without a Bearer prefix/,
  );
  await assert.rejects(
    fetchDocs({ accessToken: "synthetic", format: "toml", fetcher }),
    /Unsupported output format/,
  );
  await assert.rejects(
    fetchDocs({ credentials: "/nonexistent/credentials.json", fetcher }),
    /Unable to read credentials/,
  );
});
test("fails safely on HTTP, network and invalid documentation", async () => {
  const { fetchDocs } = await load();
  await assert.rejects(
    fetchDocs({
      accessToken: "synthetic",
      fetcher: async () => new Response("secret", { status: 401 }),
    }),
    /HTTP 401.*Check token expiry/,
  );
  await assert.rejects(
    fetchDocs({
      accessToken: "synthetic",
      fetcher: async () => {
        throw new Error("synthetic secret");
      },
    }),
    /network, timeout, or redirect/,
  );
  await assert.rejects(
    fetchDocs({
      accessToken: "synthetic",
      fetcher: async () => Response.json({ access_token: "secret" }),
    }),
    /Data API service/,
  );
});
test("docs command file output is private and refuses replacement", async (t) => {
  const { createProgram } = await import("../dist/program.js");
  const dir = await mkdtemp(path.join(os.tmpdir(), "iracing-docs-output-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const savedFetch = global.fetch,
    savedToken = process.env.IRACING_ACCESS_TOKEN;
  t.after(() => {
    global.fetch = savedFetch;
    if (savedToken === undefined) delete process.env.IRACING_ACCESS_TOKEN;
    else process.env.IRACING_ACCESS_TOKEN = savedToken;
  });
  global.fetch = async () => Response.json(DOCS);
  process.env.IRACING_ACCESS_TOKEN = "synthetic";
  const output = path.join(dir, "docs.json");
  const diagnostics = { info() {}, warn() {}, error() {} };
  await createProgram(diagnostics).parseAsync(
    ["docs", `--output=${output}`, "--snapshot"],
    { from: "user" },
  );
  assert.deepEqual(JSON.parse(await readFile(output, "utf8")).content, DOCS);
  if (process.platform !== "win32")
    assert.equal((await stat(output)).mode & 0o777, 0o600);
  await assert.rejects(
    createProgram(diagnostics).parseAsync(["docs", "--output", output], {
      from: "user",
    }),
    /already exists/,
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
  await fetchDocs({
    readCredentials: async (file) => {
      assert.equal(file, defaultCredentialsPath);
      return '{"access_token":"default-file"}';
    },
    fetcher: async (_url, options) => {
      assert.equal(options.headers.Authorization, "Bearer default-file");
      return Response.json(DOCS);
    },
  });
});
