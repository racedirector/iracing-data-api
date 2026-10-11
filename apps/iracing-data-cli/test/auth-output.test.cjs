const assert = require("node:assert/strict");
const test = require("node:test");

const quietDiagnostics = { info() {}, warn() {}, error() {} };

async function run(args, options = {}) {
  const { createLoginCommand } =
    await import("../dist/commands/auth/login/index.js");
  let output;
  let writtenToken;
  let browserAuthOptions;
  let passwordAuthOptions;
  let browserCalls = 0;
  let passwordCalls = 0;
  let readCredentialsCalls = 0;
  const diagnostics = options.diagnostics ?? quietDiagnostics;
  const command = createLoginCommand({
    diagnostics,
    dependencies: {
      environment:
        options.environment ??
        {
          IRACING_AUTH_CLIENT: "client-id",
          IRACING_AUTH_SECRET: "client-secret",
          IRACING_AUTH_REDIRECT_URI: "http://127.0.0.1/callback",
        },
      authenticate: async (authOptions) => {
        browserCalls += 1;
        browserAuthOptions = authOptions;
        return (
          (await options.authenticate?.(authOptions)) ?? {
            access_token: "synthetic-browser",
            token_type: "Bearer",
            expires_in: 60,
          }
        );
      },
      authenticatePasswordLimited: async (authOptions) => {
        passwordCalls += 1;
        passwordAuthOptions = authOptions;
        if (options.authenticatePasswordLimited) {
          return await options.authenticatePasswordLimited(authOptions);
        }
        return {
          access_token: "synthetic-password-limited",
          refresh_token: "synthetic-refresh",
          token_type: "Bearer",
          expires_in: 60,
          scope: authOptions.scopes.join(" "),
        };
      },
      readPasswordLimitedCredentials: async () => {
        readCredentialsCalls += 1;
        if (options.readPasswordLimitedCredentials) {
          return await options.readPasswordLimitedCredentials();
        }
        return {
          username: "fixture+driver@example.com",
          password: "fixture-password",
        };
      },
      writeOutput: async (token, writeOptions) => {
        writtenToken = token;
        output = writeOptions;
        await options.writeOutput?.(token, writeOptions);
      },
    },
  });
  await command.parseAsync(args, { from: "user" });
  return {
    output,
    writtenToken,
    browserAuthOptions,
    passwordAuthOptions,
    browserCalls,
    passwordCalls,
    readCredentialsCalls,
  };
}

test("login module composes environment, browser authentication, and persistence behind its entry point", async () => {
  const result = await run(["--no-open", "--timeout-seconds", "30"]);
  assert.equal(result.browserAuthOptions.clientId, "client-id");
  assert.equal(result.browserAuthOptions.clientSecret, "client-secret");
  assert.equal(
    result.browserAuthOptions.redirectUri,
    "http://127.0.0.1/callback",
  );
  assert.equal(result.browserAuthOptions.openBrowser, false);
  assert.equal(result.browserAuthOptions.timeoutSeconds, 30);
  assert.equal(result.browserCalls, 1);
  assert.equal(result.passwordCalls, 0);
});

test("browser remains the default and explicit browser selection is equivalent", async () => {
  const implicit = await run(["--scope", "iracing.auth"]);
  const explicit = await run([
    "--method",
    "browser",
    "--scope",
    "iracing.auth",
  ]);

  assert.deepEqual(explicit.browserAuthOptions, implicit.browserAuthOptions);
  assert.deepEqual(explicit.output, implicit.output);
  assert.equal(explicit.browserCalls, 1);
  assert.equal(explicit.passwordCalls, 0);
});

test("login updates the stable ignored credential file with auth+profile by default", async () => {
  const { defaultCredentialsPath } = await import("../dist/credentials.js");
  const { output, browserAuthOptions } = await run([]);
  assert.equal(output.output, defaultCredentialsPath);
  assert.match(output.output, /\.iracing-data\/credentials\.json$/);
  assert.equal(output.force, true);
  assert.deepEqual(browserAuthOptions.scopes, [
    "iracing.auth",
    "iracing.profile",
  ]);
});

test("auth-only login targets the dedicated MCP credential document", async () => {
  const { defaultMcpCredentialsPath } = await import("../dist/credentials.js");
  const { output, browserAuthOptions } = await run([
    "--scope",
    "iracing.auth",
  ]);
  assert.equal(output.output, defaultMcpCredentialsPath);
  assert.match(
    output.output,
    /\.iracing-data\/iracing-data-mcp\/credentials\.json$/,
  );
  assert.equal(output.force, true);
  assert.deepEqual(browserAuthOptions.scopes, ["iracing.auth"]);
});

test("password-limited auth-only login acquires once and writes only the returned token", async () => {
  const { defaultMcpCredentialsPath } = await import("../dist/credentials.js");
  const username = "hostile+user@example.com";
  const password = "hostile-password-value";
  const result = await run(
    ["--method", "password-limited", "--scope", "iracing.auth"],
    {
      readPasswordLimitedCredentials: async () => ({ username, password }),
    },
  );

  assert.equal(result.browserCalls, 0);
  assert.equal(result.passwordCalls, 1);
  assert.equal(result.readCredentialsCalls, 1);
  assert.deepEqual(result.passwordAuthOptions, {
    clientId: "client-id",
    clientSecret: "client-secret",
    scopes: ["iracing.auth"],
    username,
    password,
  });
  assert.equal(result.output.output, defaultMcpCredentialsPath);
  assert.deepEqual(result.writtenToken, {
    access_token: "synthetic-password-limited",
    refresh_token: "synthetic-refresh",
    token_type: "Bearer",
    expires_in: 60,
    scope: "iracing.auth",
  });
  const persistedShape = JSON.stringify(result.writtenToken);
  assert.equal(persistedShape.includes(username), false);
  assert.equal(persistedShape.includes(password), false);
});

test("password-limited login rejects a missing client secret before credential input", async () => {
  let prompted = false;
  await assert.rejects(
    run(["--method", "password-limited"], {
      environment: { IRACING_AUTH_CLIENT: "client-id" },
      readPasswordLimitedCredentials: async () => {
        prompted = true;
        return { username: "fixture", password: "fixture" };
      },
    }),
    /requires IRACING_AUTH_SECRET/,
  );
  assert.equal(prompted, false);
});

test("password-limited login rejects missing username or password before the grant", async () => {
  let attempts = 0;
  const authenticatePasswordLimited = async () => {
    attempts += 1;
    throw new Error("grant should not run");
  };

  await assert.rejects(
    run(["--method", "password-limited"], {
      readPasswordLimitedCredentials: async () => ({
        username: "",
        password: "fixture",
      }),
      authenticatePasswordLimited,
    }),
    /Username is required/,
  );
  await assert.rejects(
    run(["--method", "password-limited"], {
      readPasswordLimitedCredentials: async () => ({
        username: "fixture",
        password: "",
      }),
      authenticatePasswordLimited,
    }),
    /Password is required/,
  );
  assert.equal(attempts, 0);
});

test("password-limited cancellation writes no credentials", async () => {
  let writes = 0;
  await assert.rejects(
    run(["--method", "password-limited"], {
      readPasswordLimitedCredentials: async () => {
        throw new Error("Authentication cancelled.");
      },
      writeOutput: async () => {
        writes += 1;
      },
    }),
    /Authentication cancelled/,
  );
  assert.equal(writes, 0);
});

test("password-limited OAuth rejection is redacted and never retried", async () => {
  const username = "leak-me@example.com";
  const password = "do-not-leak-this";
  let attempts = 0;
  let writes = 0;
  let rejection;

  try {
    await run(["--method", "password-limited"], {
      readPasswordLimitedCredentials: async () => ({ username, password }),
      authenticatePasswordLimited: async () => {
        attempts += 1;
        throw new Error(`upstream rejected ${username} ${password}`);
      },
      writeOutput: async () => {
        writes += 1;
      },
    });
  } catch (error) {
    rejection = error;
  }

  assert.equal(attempts, 1);
  assert.equal(writes, 0);
  assert.ok(rejection instanceof Error);
  assert.match(rejection.message, /Password-limited OAuth authentication failed/);
  assert.equal(rejection.message.includes(username), false);
  assert.equal(rejection.message.includes(password), false);
});

test("explicit auth+profile scope preserves the existing default destination", async () => {
  const { defaultCredentialsPath } = await import("../dist/credentials.js");
  const { output, browserAuthOptions } = await run([
    "--scope",
    "iracing.auth",
    "iracing.profile",
  ]);
  assert.equal(output.output, defaultCredentialsPath);
  assert.deepEqual(browserAuthOptions.scopes, [
    "iracing.auth",
    "iracing.profile",
  ]);
});

test("rejects unsupported authentication methods", async () => {
  await assert.rejects(
    run(["--method", "device-code"]),
    /--method must be either 'browser' or 'password-limited'/,
  );
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
