const assert = require("node:assert/strict");
const test = require("node:test");
const diagnostics = { info() {}, warn() {}, error() {} };
async function run(args) {
  const { createAuthLoginCommand } =
    await import("../dist/commands/auth-login.js");
  let output;
  const command = createAuthLoginCommand(diagnostics, {
    authenticate: async () => ({
      access_token: "synthetic",
      token_type: "Bearer",
      expires_in: 60,
    }),
    writeOutput: async (_token, options) => {
      output = options;
    },
  });
  await command.parseAsync(args, { from: "user" });
  return output;
}
test("login updates the stable ignored credential file by default", async () => {
  const { defaultCredentialsPath } = await import("../dist/credentials.js");
  const options = await run([]);
  assert.equal(options.output, defaultCredentialsPath);
  assert.match(options.output, /\.iracing-data\/credentials\.json$/);
  assert.equal(options.force, true);
});
test("credential override updates that file and output override remains protected", async () => {
  assert.deepEqual(await run(["--credentials", "alternate.json"]), {
    output: "alternate.json",
    format: undefined,
    force: true,
  });
  assert.equal((await run(["--output", "alternate.json"])).force, false);
  assert.equal(
    (await run(["--output", "alternate.json", "--force"])).force,
    true,
  );
  await assert.rejects(
    run(["--output", "a.json", "--credentials", "b.json"]),
    /Use either/,
  );
});
test("rejects a format that would make the default credential file unreadable", async () => {
  await assert.rejects(
    run(["--format", "yaml"]),
    /shared credential file uses JSON/,
  );
  await assert.rejects(run(["--format", "toml"]), /Unsupported output format/);
});
