const assert = require("node:assert/strict");
const {
  mkdtemp,
  readFile,
  readdir,
  stat,
  writeFile,
} = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const TOKEN = {
  access_token: "synthetic-access",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "synthetic-refresh",
  refresh_token_expires_in: 7200,
  scope: "iracing.auth",
};

async function moduleUnderTest() {
  return import("../dist/token-output.js");
}

function hasTempFile(names) {
  return names.some((name) => name.endsWith(".tmp"));
}

test("selects formats deterministically", async () => {
  const { resolveTokenFormat } = await moduleUnderTest();
  assert.equal(resolveTokenFormat(undefined, undefined), "json");
  assert.equal(resolveTokenFormat("credentials.json", undefined), "json");
  assert.equal(resolveTokenFormat("credentials.txt", undefined), "json");
  assert.equal(resolveTokenFormat("credentials.yaml", undefined), "yaml");
  assert.equal(resolveTokenFormat("credentials.yml", undefined), "yaml");
  assert.equal(resolveTokenFormat("credentials.yaml", "json"), "json");
  assert.throws(
    () => resolveTokenFormat(undefined, "toml"),
    /Unsupported output format: toml/,
  );
});

test("serializes complete wire fields and round-trips JSON and YAML", async () => {
  const { serializeToken } = await moduleUnderTest();
  const json = serializeToken(TOKEN, "json");
  assert.equal(json.endsWith("\n"), true);
  assert.deepEqual(JSON.parse(json), TOKEN);

  const { parse } = await import("yaml");
  const yaml = serializeToken(TOKEN, "yaml");
  assert.equal(yaml.endsWith("\n"), true);
  assert.deepEqual(parse(yaml), TOKEN);
});

test("omits optional fields when absent", async () => {
  const { serializeToken } = await moduleUnderTest();
  const minimal = {
    access_token: "synthetic-access",
    token_type: "Bearer",
    expires_in: 3600,
  };
  const parsed = JSON.parse(serializeToken(minimal, "json"));
  assert.equal("refresh_token" in parsed, false);
  assert.equal("refresh_token_expires_in" in parsed, false);
  assert.equal("scope" in parsed, false);
});

test("stdout is exactly one serialized token document when output is omitted", async () => {
  const { writeTokenOutput } = await moduleUnderTest();
  let stdout = "";
  await writeTokenOutput(TOKEN, {
    writeStdout: (value) => {
      stdout += value;
    },
  });
  assert.equal(stdout, `${JSON.stringify(TOKEN, null, 2)}\n`);
});

test("file output leaves stdout empty, resolves from cwd, and creates parents", async () => {
  const { writeTokenOutput } = await moduleUnderTest();
  const cwd = await mkdtemp(path.join(os.tmpdir(), "iracing-data-cli-"));
  const destination = path.join(cwd, "nested", "credentials.yaml");
  let stdout = "";

  await writeTokenOutput(TOKEN, {
    output: "nested/credentials.yaml",
    cwd,
    writeStdout: (value) => {
      stdout += value;
    },
  });

  assert.equal(stdout, "");
  const { parse } = await import("yaml");
  assert.deepEqual(parse(await readFile(destination, "utf8")), TOKEN);
  if (process.platform !== "win32") {
    assert.equal((await stat(destination)).mode & 0o777, 0o600);
  }
});

test("protects existing credentials by default and replaces only with force", async () => {
  const { writeTokenOutput } = await moduleUnderTest();
  const cwd = await mkdtemp(path.join(os.tmpdir(), "iracing-data-cli-force-"));
  const destination = path.join(cwd, "credentials.json");
  await writeFile(destination, "original", { mode: 0o600 });

  await assert.rejects(
    writeTokenOutput(TOKEN, { output: "credentials.json", cwd }),
    /Credential file already exists: .*Pass --force/,
  );
  assert.equal(await readFile(destination, "utf8"), "original");

  await writeTokenOutput(TOKEN, {
    output: "credentials.json",
    cwd,
    force: true,
  });
  assert.deepEqual(JSON.parse(await readFile(destination, "utf8")), TOKEN);
  assert.equal(hasTempFile(await readdir(cwd)), false);
});

test("rejects directory destinations", async () => {
  const { writeTokenOutput } = await moduleUnderTest();
  const cwd = await mkdtemp(path.join(os.tmpdir(), "iracing-data-cli-dir-"));
  await assert.rejects(
    writeTokenOutput(TOKEN, { output: ".", cwd }),
    /Credential destination is a directory/,
  );
});

test("parent creation failures are actionable and never expose tokens", async () => {
  const {
    tokenOutputFileSystem,
    writeTokenOutput,
  } = await moduleUnderTest();
  const cwd = await mkdtemp(path.join(os.tmpdir(), "iracing-data-cli-parent-"));
  const fileSystem = {
    ...tokenOutputFileSystem,
    mkdir: async () => {
      throw new Error("synthetic mkdir failure");
    },
  };

  await assert.rejects(
    writeTokenOutput(TOKEN, {
      output: "missing/credentials.json",
      cwd,
      fileSystem,
    }),
    /Unable to create credential parent directory/,
  );
});

test("temporary-file creation failures do not alter an existing target", async () => {
  const {
    tokenOutputFileSystem,
    writeTokenOutput,
  } = await moduleUnderTest();
  const cwd = await mkdtemp(path.join(os.tmpdir(), "iracing-data-cli-open-"));
  const destination = path.join(cwd, "credentials.json");
  await writeFile(destination, "original", { mode: 0o600 });
  const fileSystem = {
    ...tokenOutputFileSystem,
    open: async () => {
      throw new Error("synthetic open failure");
    },
  };

  await assert.rejects(
    writeTokenOutput(TOKEN, {
      output: "credentials.json",
      cwd,
      force: true,
      fileSystem,
    }),
    /Unable to create temporary credential file/,
  );
  assert.equal(await readFile(destination, "utf8"), "original");
  assert.equal(hasTempFile(await readdir(cwd)), false);
});

test("replacement failures preserve the prior file and clean sibling temps", async () => {
  const {
    tokenOutputFileSystem,
    writeTokenOutput,
  } = await moduleUnderTest();
  const cwd = await mkdtemp(path.join(os.tmpdir(), "iracing-data-cli-rename-"));
  const destination = path.join(cwd, "credentials.json");
  await writeFile(destination, "original", { mode: 0o600 });
  const fileSystem = {
    ...tokenOutputFileSystem,
    rename: async () => {
      throw new Error("synthetic rename failure");
    },
  };

  await assert.rejects(
    writeTokenOutput(TOKEN, {
      output: "credentials.json",
      cwd,
      force: true,
      fileSystem,
    }),
    /Unable to replace credential destination/,
  );
  assert.equal(await readFile(destination, "utf8"), "original");
  assert.equal(hasTempFile(await readdir(cwd)), false);
});
