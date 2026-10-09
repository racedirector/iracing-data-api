const assert = require("node:assert/strict");
const test = require("node:test");

const diagnostics = { info() {}, warn() {}, error() {} };

async function run(args) {
  const { createLoginCommand } =
    await import("../dist/commands/auth/login/index.js");
  let output;
  let authOptions;
  const command = createLoginCommand({
    diagnostics,
    dependencies: {
      environment: {
        IRACING_AUTH_CLIENT: "client-id",
        IRACING_AUTH_SECRET: "client-secret",
        IRACING_AUTH_REDIRECT_URI: "http://127.0.0.1/callback",
      },
      authenticate: async (options) => {
        authOptions = options;
        return {
          access_token: "synthetic",
          token_type: "Bearer",
          expires_in: 60,
        };
      },
      writeOutput: async (_token, options) => {
        output = options;
      },
    },
  });
  await command.parseAsync(args, { from: "user" });
  return { output, authOptions };
}

test("login module composes environment, authentication, and persistence behind its entry point", async () => {
  const { authOptions } = await run(["--no-open", "--timeout-seconds", "30"]);
  assert.equal(authOptions.clientId, "client-id");
  assert.equal(authOptions.clientSecret, "client-secret");
  assert.equal(authOptions.redirectUri, "http://127.0.0.1/callback");
  assert.equal(authOptions.openBrowser, false);
  assert.equal(authOptions.timeoutSeconds, 30);
});

test("login updates the stable ignored credential file with auth+profile by default", async () => {
  const { defaultCredentialsPath } = await import("../dist/credentials.js");
  const { output, authOptions } = await run([]);
  assert.equal(output.output, defaultCredentialsPath);
  assert.match(output.output, /\.iracing-data\/credentials\.json$/);
  assert.equal(output.force, true);
  assert.deepEqual(authOptions.scopes, ["iracing.auth", "iracing.profile"]);
});

test("auth-only login targets the dedicated MCP credential document", async () => {
  const { defaultMcpCredentialsPath } = await import("../dist/credentials.js");
  const { output, authOptions } = await run(["--scope", "iracing.auth"]);
  assert.equal(output.output, defaultMcpCredentialsPath);
  assert.match(
    output.output,
    /\.iracing-data\/iracing-data-mcp\/credentials\.json$/,
  );
  assert.equal(output.force, true);
  assert.deepEqual(authOptions.scopes, ["iracing.auth"]);
});

test("explicit auth+profile scope preserves the existing default destination", async () => {
  const { defaultCredentialsPath } = await import("../dist/credentials.js");
  const { output, authOptions } = await run([
    "--scope",
    "iracing.auth",
    "iracing.profile",
  ]);
  assert.equal(output.output, defaultCredentialsPath);
  assert.deepEqual(authOptions.scopes, ["iracing.auth", "iracing.profile"]);
});

test("rejects unsupported scope choices before composing infrastructure", async () => {
  for (const args of [
    ["--scope", "iracing.profile"],
    ["--scope", "openid"],
    ["--scope", "iracing.auth", "openid"],
    ["--scope", "iracing.profile", "iracing.auth"],
  ]) {
    await assert.rejects(run(args), /--scope must be either/);
  }
});

test("credential override updates that file and output override remains protected", async () => {
  assert.deepEqual((await run(["--credentials", "alternate.json"])).output, {
    output: "alternate.json",
    format: undefined,
    force: true,
  });
  assert.deepEqual(
    (
      await run([
        "--scope",
        "iracing.auth",
        "--credentials",
        "mcp-alternate.json",
      ])
    ).output,
    {
      output: "mcp-alternate.json",
      format: undefined,
      force: true,
    },
  );
  assert.equal((await run(["--output", "alternate.json"])).output.force, false);
  assert.equal(
    (await run(["--output", "alternate.json", "--force"])).output.force,
    true,
  );
  await assert.rejects(
    run(["--output", "a.json", "--credentials", "b.json"]),
    /Use either/,
  );
});

test("rejects a format that would make a default credential file unreadable", async () => {
  await assert.rejects(
    run(["--format", "yaml"]),
    /shared credential file uses JSON/,
  );
  await assert.rejects(
    run(["--scope", "iracing.auth", "--format", "yaml"]),
    /shared credential file uses JSON/,
  );
  await assert.rejects(run(["--format", "toml"]), /Unsupported output format/);
});
