const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const root = path.resolve(__dirname, "..");

function run(mode) {
  return spawnSync(
    process.execPath,
    [
      "--require",
      path.join(__dirname, "fetch-fixture.cjs"),
      path.join(root, "dist/index.js"),
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        IRACING_ACCESS_TOKEN: mode === "missing" ? "" : "synthetic-token",
        FIXTURE_MODE: mode,
      },
    },
  );
}

test("documented source and runnable source agree", () => {
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const snippet = readme.match(/```typescript\r?\n([\s\S]*?)\r?\n```/)[1];
  const source = fs.readFileSync(path.join(root, "src/index.ts"), "utf8");
  assert.equal(
    snippet.replaceAll("\r\n", "\n").trim(),
    source.replaceAll("\r\n", "\n").trim(),
  );
});
test("first call prints the whole documentation from a single authenticated request", () => {
  const result = run("success");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    car: {
      get: {
        link: "https://members-ng.iracing.com/data/car/get",
        parameters: {},
      },
      assets: {
        link: "https://members-ng.iracing.com/data/car/assets",
        parameters: {},
      },
    },
    track: {
      get: {
        link: "https://members-ng.iracing.com/data/track/get",
        parameters: {},
      },
    },
  });
});
for (const [mode, message] of [
  ["missing", "Set IRACING_ACCESS_TOKEN"],
  ["unauthorized", "HTTP 401"],
  ["forbidden", "HTTP 403"],
  ["server-error", "HTTP 503"],
]) {
  test(`${mode} fails with an actionable message`, () => {
    const result = run(mode);
    assert.equal(result.status, 1, result.stderr);
    assert.ok(result.stderr.includes(message), result.stderr);
    assert.ok(!result.stderr.includes("synthetic-token"));
  });
}

for (const scenario of [
  "env-file",
  "environment-override",
  "no-file",
  "empty-file",
]) {
  test(`local start script handles ${scenario}`, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "first-call-env-"));
    try {
      const template = fs.readFileSync(path.join(root, ".env.example"), "utf8");
      if (scenario !== "no-file") {
        fs.writeFileSync(
          path.join(directory, ".env"),
          template.replace(
            "IRACING_ACCESS_TOKEN=",
            `IRACING_ACCESS_TOKEN=${scenario === "empty-file" ? "" : scenario === "environment-override" ? "file-token" : "synthetic-token"}`,
          ),
        );
      }
      const env = {
        ...process.env,
        FIXTURE_MODE: scenario === "empty-file" ? "missing" : "success",
      };
      delete env.IRACING_ACCESS_TOKEN;
      if (scenario === "environment-override" || scenario === "no-file")
        env.IRACING_ACCESS_TOKEN = "synthetic-token";
      const { scripts } = JSON.parse(
        fs.readFileSync(path.join(root, "package.json"), "utf8"),
      );
      const [command, ...args] = scripts.start.split(" ");
      assert.equal(command, "node");
      args[args.length - 1] = path.join(root, args.at(-1));
      const result = spawnSync(
        process.execPath,
        ["--require", path.join(__dirname, "fetch-fixture.cjs"), ...args],
        {
          cwd: directory,
          encoding: "utf8",
          env,
        },
      );
      assert.equal(
        result.status,
        scenario === "empty-file" ? 1 : 0,
        result.stderr,
      );
      if (scenario === "empty-file")
        assert.ok(
          result.stderr.includes("in .env or your environment"),
          result.stderr,
        );
      else assert.ok(JSON.parse(result.stdout).car);
      assert.ok(!result.stderr.includes("synthetic-token"));
      assert.ok(!result.stderr.includes("file-token"));
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
}
