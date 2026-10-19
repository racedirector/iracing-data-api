const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const { syncBuiltinESMExports } = require("node:module");
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

function setToken(t, value) {
  const saved = process.env.IRACING_ACCESS_TOKEN;
  if (value === undefined) delete process.env.IRACING_ACCESS_TOKEN;
  else process.env.IRACING_ACCESS_TOKEN = value;
  t.after(() => {
    if (saved === undefined) delete process.env.IRACING_ACCESS_TOKEN;
    else process.env.IRACING_ACCESS_TOKEN = saved;
  });
}

test.beforeEach((t) => setToken(t, "synthetic"));

function mockCredentialRead(t, read) {
  const mocked = t.mock.method(fs, "readFile", read);
  syncBuiltinESMExports();
  t.after(() => {
    mocked.mock.restore();
    syncBuiltinESMExports();
  });
  return mocked.mock;
}

function mockHttp(t, status = 200) {
  return t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(
        JSON.stringify(status === 200 ? DOCS : { secret: "upstream secret" }),
        {
          status,
          headers: { "content-type": "application/json" },
        },
      ),
  ).mock;
}

// Capture actual command output while leaving credentials, SDK and writer behavior intact.
async function run(t, args) {
  const { createProgram } = await import("../dist/program.js");
  const { createDiagnostics } = await import("../dist/diagnostics.js");
  const stdout = [];
  const stderr = [];
  const output = t.mock.method(process.stdout, "write", (text) => {
    stdout.push(text);
    return true;
  });
  let error;
  try {
    const docsCommand = createProgram(
      createDiagnostics((message) => stderr.push(`${message}\n`)),
    ).commands.find((command) => command.name() === "docs");
    assert.ok(docsCommand);
    await docsCommand
      .configureOutput({
        writeOut: (text) => stdout.push(text),
        writeErr: (text) => stderr.push(text),
      })
      .exitOverride()
      .parseAsync(args, { from: "user" });
  } catch (caught) {
    error = caught;
  } finally {
    output.mock.restore();
  }
  return { stdout: stdout.join(""), stderr: stderr.join(""), error };
}

test("program registration and docs help perform no credential, HTTP or document I/O", async (t) => {
  setToken(t, undefined);
  const reads = mockCredentialRead(t, async () => {
    throw new Error("unexpected credential read");
  });
  const http = mockHttp(t);
  const { createProgram } = await import("../dist/program.js");
  const diagnostics = {
    info() {
      assert.fail("unexpected diagnostic");
    },
    warn() {},
    error() {},
  };
  const stdout = t.mock.method(process.stdout, "write", () => true);
  createProgram(diagnostics);
  stdout.mock.restore();
  assert.equal(stdout.mock.callCount(), 0);
  const result = await run(t, ["--help"]);
  assert.equal(result.error.code, "commander.helpDisplayed");
  assert.match(result.stdout, /--credentials/);
  assert.match(result.stdout, /--format/);
  assert.match(result.stdout, /--force/);
  assert.equal(reads.callCount(), 0);
  assert.equal(http.callCount(), 0);
});

test("invalid format and Commander input fail before credentials or HTTP", async (t) => {
  setToken(t, undefined);
  const reads = mockCredentialRead(t, async () => {
    throw new Error("unexpected read");
  });
  const http = mockHttp(t);
  for (const args of [
    ["--format", "toml"],
    ["--credentials"],
    ["--snapshot"],
  ]) {
    const result = await run(t, args);
    assert.match(
      result.error.message,
      args[0] === "--format" ? /Unsupported output format/ : /option/,
    );
    assert.equal(result.stdout, "");
    assert.doesNotMatch(result.stderr, /documentation fetched/);
  }
  assert.equal(reads.callCount(), 0);
  assert.equal(http.callCount(), 0);
});

test("docs invokes the generated operation once at the canonical URL and preserves JSON", async (t) => {
  const { DocApi } = await import("@iracing-data/api-client-fetch");
  const operation = t.mock.method(DocApi.prototype, "getDocs");
  const http = mockHttp(t);
  const reads = mockCredentialRead(t, async () => {
    throw new Error("unexpected read");
  });
  const result = await run(t, []);
  assert.equal(result.error, undefined);
  assert.equal(result.stdout, JSON.stringify(DOCS, null, 2) + "\n");
  assert.equal(result.stderr, "Data API documentation fetched.\n");
  assert.equal(operation.mock.callCount(), 1);
  assert.equal(http.callCount(), 1);
  const [url, init] = http.calls[0].arguments;
  assert.equal(url, "https://members-ng.iracing.com/data/doc");
  assert.equal(init.method, "GET");
  assert.equal(
    new Headers(init.headers).get("authorization"),
    "Bearer synthetic",
  );
  assert.equal(reads.callCount(), 0);
});

test("format selection preserves explicit YAML/JSON, extension inference and JSON defaults", async (t) => {
  const { parse } = await import("yaml");
  mockHttp(t);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "iracing-docs-formats-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  for (const [name, args, yaml] of [
    ["explicit-yaml", ["--format", "yaml"], true],
    ["explicit-json", ["--format", "json"], false],
    ["default", [], false],
    ["inferred.yaml", [], true],
    ["inferred.yml", [], true],
    ["override.yaml", ["--format", "json"], false],
  ]) {
    const output = name.includes(".") ? path.join(dir, name) : undefined;
    const result = await run(t, output ? [...args, "--output", output] : args);
    assert.equal(result.error, undefined);
    const text = output ? await fs.readFile(output, "utf8") : result.stdout;
    assert.deepEqual(yaml ? parse(text) : JSON.parse(text), DOCS);
    if (yaml) assert.match(text, /^car:/);
    else assert.equal(text, JSON.stringify(DOCS, null, 2) + "\n");
    if (output) assert.equal(result.stdout, "");
  }
});

test("private file output refuses overwrite and supports force; write failures suppress success", async (t) => {
  mockHttp(t);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "iracing-docs-output-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "docs.json");
  const first = await run(t, ["--output", output]);
  assert.equal(first.error, undefined);
  assert.equal(first.stdout, "");
  if (process.platform !== "win32")
    assert.equal((await fs.stat(output)).mode & 0o777, 0o600);
  await fs.writeFile(output, "previous");
  const refused = await run(t, ["--output", output]);
  assert.match(refused.error.message, /already exists/);
  assert.doesNotMatch(refused.error.message, /documentation request failed/);
  assert.equal(refused.stdout, "");
  assert.equal(refused.stderr, "");
  assert.equal(await fs.readFile(output, "utf8"), "previous");
  const forced = await run(t, ["--output", output, "--force"]);
  assert.equal(forced.error, undefined);
  assert.equal(forced.stdout, "");
  assert.deepEqual(JSON.parse(await fs.readFile(output, "utf8")), DOCS);
  assert.match(forced.stderr, /documentation fetched/);
});

test("default credentials are read exactly once when no environment token exists", async (t) => {
  setToken(t, undefined);
  const { defaultCredentialsPath } = await import("../dist/credentials.js");
  const reads = mockCredentialRead(
    t,
    async () => '{"access_token":"default-file"}',
  );
  const http = mockHttp(t);
  const result = await run(t, []);
  assert.equal(result.error, undefined);
  assert.equal(reads.callCount(), 1);
  assert.equal(reads.calls[0].arguments[0], defaultCredentialsPath);
  assert.equal(
    new Headers(http.calls[0].arguments[1].headers).get("authorization"),
    "Bearer default-file",
  );
});

test("explicit JSON/YAML credentials override the environment and are read once", async (t) => {
  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), "iracing-docs-credentials-"),
  );
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const http = mockHttp(t);
  for (const [name, contents] of [
    ["token.json", '{"access_token":"from-file"}'],
    ["token.yaml", "access_token: from-file\n"],
  ]) {
    const file = path.join(dir, name);
    await fs.writeFile(file, contents, { mode: 0o600 });
    const reads = mockCredentialRead(t, fs.readFile);
    const result = await run(t, ["--credentials", file]);
    assert.equal(result.error, undefined);
    assert.equal(reads.callCount(), 1);
    assert.equal(reads.calls[0].arguments[0], file);
    reads.restore();
    syncBuiltinESMExports();
    assert.equal(
      new Headers(http.calls.at(-1).arguments[1].headers).get("authorization"),
      "Bearer from-file",
    );
  }
});

test("invalid selected credential files fail closed without a request", async (t) => {
  const http = mockHttp(t);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "iracing-docs-invalid-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  for (const [name, contents] of [
    ["malformed.json", "invalid-json"],
    ["empty.yaml", "access_token: ''"],
    ["unreadable.json", undefined],
  ]) {
    const file = path.join(dir, name);
    if (contents !== undefined) await fs.writeFile(file, contents);
    const result = await run(t, ["--credentials", file]);
    assert.match(
      result.error.message,
      /Unable to read credentials|without a Bearer prefix/,
    );
    assert.doesNotMatch(result.error.message, /documentation request failed/);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
  }
  assert.equal(http.callCount(), 0);
});

test("invalid bearer values prevent requests", async (t) => {
  const http = mockHttp(t);
  for (const token of [" ", "bad\r\ntoken", "Bearer synthetic"]) {
    setToken(t, token);
    const result = await run(t, []);
    assert.match(result.error.message, /without a Bearer prefix/);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
  }
  assert.equal(http.callCount(), 0);
});

test("credential utility preserves programmatic precedence without adding command injection", async () => {
  const { resolveAccessToken } = await import("../dist/credentials.js");
  assert.equal(
    await resolveAccessToken({ accessToken: "injected" }),
    "injected",
  );
  for (const file of ["selected.json", "selected.yaml"]) {
    let reads = 0;
    const token = await resolveAccessToken({
      credentials: file,
      accessToken: "injected",
      readCredentials: async () => {
        reads++;
        return file.endsWith("yaml")
          ? "access_token: selected"
          : '{"access_token":"selected"}';
      },
    });
    assert.equal(token, "selected");
    assert.equal(reads, 1);
  }
});

test("HTTP and network errors retain internal causes but expose only safe advice", async (t) => {
  for (const [status, expected] of [
    [401, /HTTP 401.*Check token expiry/],
    [403, /HTTP 403.*Check token expiry/],
    [500, /HTTP 500.*service availability/],
  ]) {
    const http = mockHttp(t, status);
    const result = await run(t, []);
    assert.match(result.error.message, expected);
    assert.doesNotMatch(result.error.message, /secret|synthetic/);
    assert.equal(result.error.cause.name, "ResponseError");
    assert.equal(result.error.cause.response.status, status);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
    assert.equal(http.callCount(), 1);
    http.restore();
  }
  const failure = new Error("upstream secret synthetic");
  t.mock.method(globalThis, "fetch", async () => {
    throw failure;
  });
  const result = await run(t, []);
  assert.match(result.error.message, /network connectivity/);
  assert.doesNotMatch(result.error.message, /secret|synthetic/);
  assert.equal(result.error.cause.cause, failure);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("CLI entry point separates data/diagnostics and redacts upstream errors", () => {
  const entry = path.resolve(__dirname, "../dist/index.js");
  const fixture = path.resolve(__dirname, "fixtures/docs-fetch.mjs");

  for (const status of [200, 401]) {
    const payload = status === 200 ? DOCS : { secret: "upstream secret" };
    const result = spawnSync(
      process.execPath,
      ["--import", fixture, entry, "docs"],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          IRACING_ACCESS_TOKEN: "synthetic",
          IRACING_TEST_HTTP_STATUS: String(status),
          IRACING_TEST_HTTP_BODY: JSON.stringify(payload),
        },
      },
    );
    assert.equal(result.status, status === 200 ? 0 : 1, result.stderr);
    if (status === 200) {
      assert.equal(result.stdout, JSON.stringify(DOCS, null, 2) + "\n");
      assert.equal(result.stderr, "Data API documentation fetched.\n");
    } else {
      assert.equal(result.stdout, "");
      assert.match(result.stderr, /HTTP 401/);
      assert.doesNotMatch(result.stderr, /secret|synthetic|ResponseError/);
    }
  }
});
