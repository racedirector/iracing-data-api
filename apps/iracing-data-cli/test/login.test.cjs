const assert = require("node:assert/strict");
const test = require("node:test");

const token = {
  access_token: "fixture-token",
  token_type: "Bearer",
  expires_in: 600,
};

test("login command parses inputs and calls only the injected capability", async () => {
  const { createLoginCommand } =
    await import("../dist/commands/auth/login/command.js");
  const calls = [];
  const command = createLoginCommand({
    async login(options) {
      calls.push(options);
      return "tokens.json";
    },
    present(destination) {
      calls.push(destination);
    },
  });
  await command.parseAsync(
    [
      "--scope",
      "iracing.auth",
      "--no-open",
      "--timeout-seconds",
      "15",
      "--output",
      "tokens.json",
      "--force",
    ],
    { from: "user" },
  );
  assert.equal(calls.length, 2);
  assert.equal(calls[0].timeoutSeconds, 15);
  assert.equal(calls[0].open, false);
  assert.equal(calls[0].force, true);
  assert.deepEqual(calls[0].scopes, ["iracing.auth"]);
  assert.equal(calls[1], "tokens.json");
});

test("invalid login flags never reach the injected service", async () => {
  const { createLoginCommand } =
    await import("../dist/commands/auth/login/command.js");
  for (const flags of [
    ["--method", "invalid"],
    ["--scope", "unregistered"],
    ["--timeout-seconds", "0"],
    ["--format", "toml"],
  ]) {
    let called = false;
    const command = createLoginCommand({
      async login() {
        called = true;
        return "tokens.json";
      },
      present() {
        called = true;
      },
    });
    await assert.rejects(command.parseAsync(flags, { from: "user" }));
    assert.equal(called, false);
  }
});

async function fixture(overrides = {}) {
  const { createLoginService } =
    await import("../dist/commands/auth/login/service.js");
  const { resolveOptions } =
    await import("../dist/commands/auth/login/schema.js");
  const events = [];
  const runtime = {
    async authenticate(options) {
      events.push(["browser", options]);
      return token;
    },
    async authenticatePasswordLimited(options) {
      events.push(["password", options]);
      return token;
    },
    async writeOutput(value, options) {
      events.push(["write", value, options]);
    },
    diagnostics: {
      info(message) {
        events.push(["present", message]);
      },
    },
    ...overrides,
  };
  return {
    service: createLoginService(runtime),
    options: resolveOptions.parse({
      method: "browser",
      open: true,
      timeoutSeconds: "300",
      clientId: "fixture-client",
    }),
    events,
  };
}

test("login authenticates, saves, and presents in order without exposing tokens", async () => {
  const { createExecute } =
    await import("../dist/commands/auth/login/command.js");
  const { defaultCredentialsPath } = await import("../dist/credentials.js");
  const { service, options, events } = await fixture();
  await createExecute(service)(options);
  assert.deepEqual(
    events.map(([event]) => event),
    ["browser", "write", "present"],
  );
  assert.deepEqual(events[0][1], {
    clientId: "fixture-client",
    clientSecret: undefined,
    redirectUri: undefined,
    scopes: ["iracing.auth", "iracing.profile"],
    open: true,
    timeoutSeconds: 300,
  });
  assert.deepEqual(events[1], [
    "write",
    token,
    {
      output: defaultCredentialsPath,
      format: "json",
      force: false,
    },
  ]);
  assert.ok(events[2][1].includes(defaultCredentialsPath));
  assert.ok(!events[2][1].includes(token.access_token));
});

test("login preserves scope-specific defaults and explicit destinations", async () => {
  const { defaultMcpCredentialsPath } = await import("../dist/credentials.js");
  for (const [override, expected] of [
    [{ scopes: ["iracing.auth"] }, defaultMcpCredentialsPath],
    [
      { output: "alternate.yaml", format: "yaml", force: true },
      "alternate.yaml",
    ],
    [{ credentials: "credentials.json" }, "credentials.json"],
  ]) {
    const { service, options, events } = await fixture();
    assert.equal(await service.login({ ...options, ...override }), expected);
    assert.deepEqual(events[1][2], {
      output: expected,
      format: override.format ?? "json",
      force: override.force ?? false,
    });
  }
});

test("login rejects invalid destinations before authentication", async () => {
  for (const override of [{ format: "yaml" }, { format: "toml" }]) {
    const { service, options, events } = await fixture();
    await assert.rejects(service.login({ ...options, ...override }));
    assert.deepEqual(events, []);
  }
});

test("password-limited login trims usernames but preserves passwords and scopes", async () => {
  const { service, options, events } = await fixture();
  await service.login({
    ...options,
    method: "password-limited",
    clientSecret: "secret",
    username: "  driver  ",
    password: " password ",
    scopes: ["iracing.auth"],
  });
  assert.deepEqual(events[0], [
    "password",
    {
      clientId: "fixture-client",
      clientSecret: "secret",
      username: "driver",
      password: " password ",
      scopes: ["iracing.auth"],
    },
  ]);
  assert.equal(events[1][0], "write");
});

test("password-limited login validates inputs before any grant or write", async () => {
  for (const override of [
    { clientId: "" },
    { clientSecret: "" },
    { username: " " },
    { password: "" },
  ]) {
    const { service, options, events } = await fixture();
    await assert.rejects(
      service.login({
        ...options,
        method: "password-limited",
        clientSecret: "secret",
        username: "driver",
        password: "password",
        ...override,
      }),
    );
    assert.deepEqual(events, []);
  }
});

test("password-limited grant failures are sanitized and never persist or present", async () => {
  const { createExecute } =
    await import("../dist/commands/auth/login/command.js");
  const { service, options, events } = await fixture({
    async authenticatePasswordLimited() {
      throw new Error("secret-password");
    },
  });
  await assert.rejects(
    createExecute(service)({
      ...options,
      method: "password-limited",
      clientSecret: "secret",
      username: "driver",
      password: "password",
    }),
    {
      message:
        "Password-limited OAuth authentication failed. Verify client eligibility, registered user access, credentials, and requested scope before trying again.",
    },
  );
  assert.deepEqual(events, []);
});

test("browser failures do not persist and writer failures do not present success", async () => {
  const { createExecute } =
    await import("../dist/commands/auth/login/command.js");
  const failure = new Error("fixture failure");
  for (const method of ["authenticate", "writeOutput"]) {
    const { service, options, events } = await fixture({
      async [method]() {
        throw failure;
      },
    });
    await assert.rejects(
      createExecute(service)(options),
      (error) => error === failure,
    );
    assert.deepEqual(
      events.map(([event]) => event),
      method === "authenticate" ? [] : ["browser"],
    );
  }
});
