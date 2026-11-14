const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

function run(script, environment = {}) {
  const env = { ...process.env };
  for (const key of [
    "IRACING_ACCESS_TOKEN",
    "IRACING_CREDENTIALS",
    "IRACING_AUTH_CLIENT",
    "IRACING_AUTH_SECRET",
    "IRACING_AUTH_REDIRECT_URI",
    "IRACING_AUTH_USERNAME",
    "IRACING_AUTH_PASSWORD",
  ]) {
    delete env[key];
  }
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", script],
    {
      cwd: path.resolve(__dirname, ".."),
      env: { ...env, ...environment },
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 0, result.stderr);
}

test("a nested command can override shared defaults without repeating environment bindings", () => {
  run(
    `
    import assert from "node:assert/strict";
    import { Command } from "@commander-js/extra-typings";
    import { createRootCommand } from "./test/root-command.cjs";
    import { readCredentialOptions } from "./dist/schema.js";
    let selected;
    const leaf = new Command("leaf")
      .option("--access-token <token>")
      .option("--credentials <path>")
      .action((_options, command) => { selected = readCredentialOptions(command); });
    const root = (await createRootCommand()).addCommand(new Command("group").addCommand(leaf));
    await root.parseAsync([
      "--access-token", "root-token", "--credentials", "root.json",
      "group", "leaf", "--access-token", "local-token", "--credentials", "local.json"
    ], { from: "user" });
    assert.deepEqual(selected, { accessToken: "local-token", credentials: "local.json" });
  `,
    { IRACING_ACCESS_TOKEN: "env-token", IRACING_CREDENTIALS: "env.json" },
  );
});

test("league history binds hidden token and credential env options with explicit flag precedence", () => {
  run(
    `
    import assert from "node:assert/strict";
    import { createLeagueHistoryCommand } from "./dist/commands/league-history/command.js";
    import { createRootCommand } from "./test/root-command.cjs";
    const seen = [];
    const service = {
      capture: async (options) => { seen.push(options); return { directory: "out", leagueId: 6529, seasons: 0, results: 0 }; },
      present() {},
    };
    const command = (await createRootCommand()).addCommand(createLeagueHistoryCommand(service));
    assert.ok(!command.helpInformation().includes("--access-token"));
    await command.parseAsync(["league-history", "--league-id", "6529"], { from: "user" });
    assert.equal(seen[0].accessToken, "env-token");
    assert.equal(seen[0].credentials, "env.json");
    await (await createRootCommand()).addCommand(createLeagueHistoryCommand(service)).parseAsync([
      "league-history", "--league-id", "6529", "--access-token", "flag-token", "--credentials", "flag.json"
    ], { from: "user" });
    assert.equal(seen[1].accessToken, "flag-token");
    assert.equal(seen[1].credentials, "flag.json");
  `,
    { IRACING_ACCESS_TOKEN: "env-token", IRACING_CREDENTIALS: "env.json" },
  );
});

test("login parses hidden registration and account env options before creating its scope", () => {
  run(
    `
    import assert from "node:assert/strict";
    import { createLoginCommand } from "./dist/commands/auth/login/command.js";
    import { createRootCommand } from "./test/root-command.cjs";
    const seen = [];
    const dependencies = {
      createScope: async (options) => {
        seen.push(options);
        return {
          authentication: { authenticate: async () => ({}) },
          credentials: { destination: "tokens.json", write: async () => {} },
          diagnostics: { info() {} },
        };
      },
    };
    const command = (await createRootCommand()).addCommand(createLoginCommand(dependencies));
    for (const name of ["--client-id", "--client-secret", "--redirect-uri", "--username", "--password"]) {
      assert.ok(!command.helpInformation().includes(name));
    }
    await command.parseAsync(["login"], { from: "user" });
    assert.equal(seen[0].clientId, "env-client");
    assert.equal(seen[0].clientSecret, "env-secret");
    assert.equal(seen[0].redirectUri, "http://127.0.0.1/callback");
    assert.equal(seen[0].username, "env-user");
    assert.equal(seen[0].password, "env-password");
    assert.equal(seen[0].credentials, "env.json");
    await (await createRootCommand()).addCommand(createLoginCommand(dependencies)).parseAsync([
      "login", "--client-id", "flag-client", "--client-secret", "flag-secret",
      "--username", "flag-user", "--password", "flag-password",
      "--credentials", "flag.json", "--redirect-uri", "http://127.0.0.1/flag"
    ], { from: "user" });
    assert.equal(seen[1].clientId, "flag-client");
    assert.equal(seen[1].clientSecret, "flag-secret");
    assert.equal(seen[1].username, "flag-user");
    assert.equal(seen[1].password, "flag-password");
    assert.equal(seen[1].credentials, "flag.json");
    assert.equal(seen[1].redirectUri, "http://127.0.0.1/flag");
  `,
    {
      IRACING_AUTH_CLIENT: "env-client",
      IRACING_AUTH_SECRET: "env-secret",
      IRACING_AUTH_REDIRECT_URI: "http://127.0.0.1/callback",
      IRACING_AUTH_USERNAME: "env-user",
      IRACING_AUTH_PASSWORD: "env-password",
      IRACING_CREDENTIALS: "env.json",
    },
  );
});
