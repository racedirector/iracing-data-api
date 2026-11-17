const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

test("Inspector modes launch from the repository root without overriding credential selection", () => {
  const packageDirectory = path.resolve(__dirname, "..");
  const root = path.resolve(packageDirectory, "../..");
  const launcher = pathToFileURL(
    path.join(packageDirectory, "scripts/inspect.mjs"),
  ).href;
  for (const mode of ["stdio", "http"]) {
    const result = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
        import childProcess from "node:child_process";
        import { syncBuiltinESMExports } from "node:module";
        import { fileURLToPath } from "node:url";
        childProcess.spawnSync = (binary, args, options) => {
          console.log(JSON.stringify({
            binary, args, cwd: fileURLToPath(options.cwd),
            credentials: process.env.IRACING_CREDENTIALS
          }));
          return { status: 0 };
        };
        syncBuiltinESMExports();
        process.argv[2] = ${JSON.stringify(mode)};
        await import(${JSON.stringify(launcher)});
        `,
      ],
      {
        cwd: packageDirectory,
        env: { ...process.env, IRACING_CREDENTIALS: "custom/account.json" },
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const launch = JSON.parse(result.stdout);
    assert.equal(path.resolve(launch.cwd), root);
    assert.equal(launch.credentials, "custom/account.json");
    assert.ok(!launch.args.join(" ").includes("--credentials"));
    assert.match(
      launch.args.join(" "),
      /apps\/iracing-data-mcp\/dist\/main.js serve/,
    );
    assert.match(
      launch.binary,
      mode === "stdio" ? /mcp-inspector$/ : /concurrently$/,
    );
  }
});
