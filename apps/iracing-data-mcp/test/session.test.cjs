const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const oauth = require("@iracing-data/oauth-client");
const jwt = (exp) =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp, synthetic_secret: "CUSTOMER_SECRET" })).toString("base64url")}.SECRET`;
const token = (changes = {}) => ({
  access_token: jwt(Math.floor(Date.now() / 1000) + 3600),
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "REFRESH_SECRET",
  scope: "iracing.auth",
  ...changes,
});
async function fixture(t) {
  const api = await import("../dist/index.js");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-352-"));
  await fs.chmod(dir, 0o700);
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, "credentials.json");
  const logs = [];
  const options = {
    credentialFile: file,
    clientMetadata: {
      clientId: "fixture",
      redirectUri: "http://127.0.0.1:0/callback",
      scopes: ["iracing.auth"],
    },
    logger: api.createDiagnosticLogger((line) => logs.push(line)),
  };
  const original = global.fetch;
  global.fetch = () => {
    throw new Error("unexpected network SECRET");
  };
  t.after(() => (global.fetch = original));
  return {
    api,
    file,
    logs,
    options,
    write: (value) =>
      oauth.writeOAuthTokenDocument(file, value, { overwrite: true }),
    start: (overrides = {}) =>
      api.createMcpCredentialOwner({ ...options, ...overrides }),
  };
}
function failure(api, reason, retryable = false) {
  return (error) => {
    const envelope = api.errorEnvelope(error, api.createRequestContext()).error;
    assert.equal(envelope.reason, reason);
    assert.equal(envelope.retryable, retryable);
    assert.doesNotMatch(
      JSON.stringify(envelope),
      /SECRET|credentials.json|fixture|CUSTOMER/,
    );
    assert.doesNotMatch(error.message, /SECRET|credentials.json/);
    assert.equal(error.cause, undefined);
    return true;
  };
}
async function access(services) {
  return services.getAccessToken();
}

test("auth-only bare document loads without network, rotates once, and restarts with replacement", async (t) => {
  const f = await fixture(t);
  await f.write(token({ access_token: jwt(1) }));
  const services = await f.start();
  assert.equal(services.authorizationState(), "ready");
  let grants = 0;
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  global.fetch = async (_url, options) => {
    grants++;
    assert.equal(
      new URLSearchParams(options.body).get("refresh_token"),
      "REFRESH_SECRET",
    );
    await gate;
    return Response.json(token({ refresh_token: "REPLACEMENT_SECRET" }));
  };
  const pending = Array.from({ length: 12 }, () => access(services));
  release();
  const results = await Promise.all(pending);
  assert.equal(grants, 1);
  assert.ok(results.every((value) => value === results[0]));
  assert.equal(
    (await oauth.readOAuthTokenDocument(f.file)).refresh_token,
    "REPLACEMENT_SECRET",
  );
  await f.write(
    token({ access_token: jwt(1), refresh_token: "REPLACEMENT_SECRET" }),
  );
  const restarted = await f.start();
  global.fetch = async (_url, options) => {
    assert.equal(
      new URLSearchParams(options.body).get("refresh_token"),
      "REPLACEMENT_SECRET",
    );
    return Response.json(token({ refresh_token: "NEXT_SECRET" }));
  };
  await access(restarted);
  assert.equal(
    (await oauth.readOAuthTokenDocument(f.file)).refresh_token,
    "NEXT_SECRET",
  );
  assert.doesNotMatch(f.logs.join(""), /SECRET|CUSTOMER|credentials.json/);
});

for (const [name, value, reason] of [
  ["missing", undefined, "missing_session"],
  ["missing refresh", token({ refresh_token: undefined }), "invalid_session"],
  [
    "insufficient scope",
    token({ scope: "iracing.profile" }),
    "insufficient_scope",
  ],
  ["omitted scope", token({ scope: undefined }), "insufficient_scope"],
])
  test(`${name} fails closed without hot reload; stopped re-login recovers`, async (t) => {
    const f = await fixture(t);
    if (value) await f.write(value);
    const services = await f.start();
    assert.equal(services.authorizationState(), "authorization_required");
    await assert.rejects(access(services), failure(f.api, reason));
    const replacement = token();
    await f.write(replacement);
    await assert.rejects(access(services), failure(f.api, reason));
    const restarted = await f.start();
    assert.equal(await access(restarted), replacement.access_token);
    await fs.unlink(f.file);
    const loggedOut = await f.start();
    await assert.rejects(access(loggedOut), failure(f.api, "missing_session"));
  });

for (const mode of ["corrupt", "unreadable", "unsafe", "unsupported"])
  test(`${mode} document remains distinct from missing`, async (t) => {
    const f = await fixture(t);
    await f.write(token());
    if (mode === "corrupt") await fs.writeFile(f.file, "{SECRET");
    if (mode === "unsafe") await fs.chmod(f.file, 0o644);
    const failureSystems = {
      unreadable: {
        open: async () => {
          throw new Error("SECRET EACCES");
        },
      },
      unsupported: {
        lstat: async () => {
          throw new oauth.OAuthTokenDocumentError(
            "durability_unsupported",
            "SECRET",
          );
        },
      },
    };
    const fileSystem = failureSystems[mode];
    const services = await f.start({ fileSystem });
    await assert.rejects(access(services), failure(f.api, "invalid_session"));
    assert.doesNotMatch(f.logs.join(""), /SECRET|credentials.json/);
  });

for (const [name, response, reason, retryable] of [
  [
    "revoked",
    () =>
      Response.json(
        { error: "invalid_grant", error_description: "SECRET" },
        { status: 400 },
      ),
    "revoked_authorization",
    false,
  ],
  [
    "transient",
    () =>
      Response.json(
        { error: "temporarily_unavailable", error_description: "SECRET" },
        { status: 400 },
      ),
    "transient_refresh",
    true,
  ],
  [
    "server rejection",
    () => Response.json({ error: "server_error" }, { status: 400 }),
    "transient_refresh",
    true,
  ],
  [
    "network ambiguous",
    () => {
      throw new Error("SECRET");
    },
    "rotation_uncertain",
    false,
  ],
  [
    "malformed success",
    () => Response.json({ access_token: "SECRET" }),
    "rotation_uncertain",
    false,
  ],
  [
    "structured 503",
    () => Response.json({ error: "temporarily_unavailable" }, { status: 503 }),
    "rotation_uncertain",
    false,
  ],
  [
    "unstructured 503",
    () => new Response("SECRET", { status: 503 }),
    "rotation_uncertain",
    false,
  ],
])
  test(`${name}: only explicit nonconsumption permits subsequent grant`, async (t) => {
    const f = await fixture(t);
    await f.write(token({ access_token: jwt(1) }));
    const services = await f.start();
    let grants = 0;
    global.fetch = async () => {
      grants++;
      return response();
    };
    await assert.rejects(access(services), failure(f.api, reason, retryable));
    await assert.rejects(access(services), failure(f.api, reason, retryable));
    assert.equal(grants, retryable ? 2 : 1);
    if (retryable) {
      global.fetch = async () =>
        Response.json(token({ refresh_token: "NEW_SECRET" }));
      await access(services);
    } else {
      assert.equal(services.authorizationState(), "authorization_required");
      const restart = await f.start();
      await assert.rejects(access(restart), failure(f.api, "missing_session"));
    }
    assert.doesNotMatch(f.logs.join(""), /SECRET|credentials.json/);
  });

test("replacement persistence failure quarantines all callers and removes stale credential", async (t) => {
  const f = await fixture(t);
  await f.write(token({ access_token: jwt(1) }));
  const services = await f.start({
    fileSystem: {
      rename: async () => {
        throw new Error("SECRET");
      },
    },
  });
  let grants = 0;
  global.fetch = async () => {
    grants++;
    return Response.json(token({ refresh_token: "NEW_SECRET" }));
  };
  await Promise.all(
    Array.from({ length: 8 }, () =>
      assert.rejects(access(services), failure(f.api, "persistence_failed")),
    ),
  );
  await assert.rejects(access(services), failure(f.api, "persistence_failed"));
  assert.equal(grants, 1);
  assert.equal(await oauth.readOAuthTokenDocument(f.file), undefined);
  await f.write(token());
  assert.equal((await f.start()).authorizationState(), "ready");
});

test("replacement scope loss quarantines before publishing; omitted rotation preserves existing client contract", async (t) => {
  const f = await fixture(t);
  await f.write(token({ access_token: jwt(1) }));
  const services = await f.start();
  global.fetch = async () =>
    Response.json(
      token({ scope: "iracing.profile", refresh_token: "ISSUED_SECRET" }),
    );
  await assert.rejects(access(services), failure(f.api, "insufficient_scope"));
  await assert.rejects(access(services), failure(f.api, "insufficient_scope"));
  assert.equal(await oauth.readOAuthTokenDocument(f.file), undefined);
  await f.write(token({ access_token: jwt(1) }));
  const restarted = await f.start();
  global.fetch = async () =>
    Response.json(token({ refresh_token: undefined, scope: undefined }));
  await access(restarted);
  const persisted = await oauth.readOAuthTokenDocument(f.file);
  assert.equal(persisted.refresh_token, "REFRESH_SECRET");
  assert.equal(persisted.scope, "iracing.auth");
});

test("directory sync uncertainty after publication fails closed through persistence and cleanup failure", async (t) => {
  const f = await fixture(t);
  await f.write(token({ access_token: jwt(1) }));
  const services = await f.start({
    fileSystem: {
      open: async (target, ...args) => {
        if (target === path.dirname(f.file)) throw new Error("SYNC_SECRET");
        return fs.open(target, ...args);
      },
    },
  });
  let grants = 0;
  global.fetch = async () => {
    grants++;
    return Response.json(token({ refresh_token: "ISSUED_SECRET" }));
  };
  await assert.rejects(access(services), failure(f.api, "persistence_failed"));
  await assert.rejects(access(services), failure(f.api, "persistence_failed"));
  assert.equal(grants, 1);
  assert.equal(services.authorizationState(), "authorization_required");
  await f.write(token()); // stopped recovery after repairing the filesystem
  assert.equal((await f.start()).authorizationState(), "ready");
  assert.doesNotMatch(f.logs.join(""), /SECRET|credentials.json/);
});

function started() {
  let release;
  let entered;
  const gate = new Promise((resolve) => (release = resolve));
  const entry = new Promise((resolve) => (entered = resolve));
  return { gate, release, entry, entered };
}

test("shutdown quarantines a consumed held grant and prevents late persistence/readiness", async (t) => {
  const f = await fixture(t);
  await f.write(token({ access_token: jwt(1) }));
  const hold = await started();
  global.fetch = async () => {
    hold.entered();
    await hold.gate;
    return Response.json(token({ refresh_token: "LATE_SECRET" }));
  };
  const services = await f.start();
  const pending = access(services).catch((error) => error);
  await hold.entry;
  const first = services.shutdownAuthorizationOwner();
  assert.equal(first, services.shutdownAuthorizationOwner());
  await first;
  assert.equal(services.authorizationState(), "authorization_required");
  await assert.rejects(fs.stat(f.file), { code: "ENOENT" });
  hold.release();
  assert.equal(
    f.api.errorEnvelope(await pending, f.api.createRequestContext()).error
      .reason,
    "rotation_uncertain",
  );
  await assert.rejects(fs.stat(f.file), { code: "ENOENT" });
  await assert.rejects(access(services), failure(f.api, "rotation_uncertain"));
  assert.doesNotMatch(f.logs.join(""), /LATE_SECRET|REFRESH_SECRET/);
});

test("shutdown deletes a replacement published by a rename already in flight", async (t) => {
  const f = await fixture(t);
  await f.write(token({ access_token: jwt(1) }));
  const hold = await started();
  const services = await f.start({
    fileSystem: {
      rename: async (...args) => {
        hold.entered();
        await hold.gate;
        return fs.rename(...args);
      },
    },
  });
  global.fetch = async () =>
    Response.json(token({ refresh_token: "LATE_SECRET" }));
  const pending = access(services).catch((error) => error);
  await hold.entry;
  await services.shutdownAuthorizationOwner();
  await assert.rejects(fs.stat(f.file), { code: "ENOENT" });
  hold.release();
  assert.equal(
    f.api.errorEnvelope(await pending, f.api.createRequestContext()).error
      .reason,
    "rotation_uncertain",
  );
  await assert.rejects(fs.stat(f.file), { code: "ENOENT" });
  assert.equal(services.authorizationState(), "authorization_required");
});

test("known nonconsuming refresh rejection preserves credentials through stopped shutdown", async (t) => {
  const f = await fixture(t);
  await f.write(token({ access_token: jwt(1) }));
  const services = await f.start();
  global.fetch = async () =>
    Response.json({ error: "temporarily_unavailable" }, { status: 400 });
  await assert.rejects(
    access(services),
    failure(f.api, "transient_refresh", true),
  );
  await services.shutdownAuthorizationOwner();
  assert.equal(
    (await oauth.readOAuthTokenDocument(f.file)).refresh_token,
    "REFRESH_SECRET",
  );
});

test("failed uncertainty cleanup rejects shutdown and keeps the current owner terminal", async (t) => {
  const f = await fixture(t);
  await f.write(token({ access_token: jwt(1) }));
  const hold = await started();
  const services = await f.start({
    fileSystem: {
      unlink: async () => {
        throw new Error("SECRET EACCES");
      },
    },
  });
  global.fetch = async () => {
    hold.entered();
    await hold.gate;
    return Response.json(token({ refresh_token: "LATE_SECRET" }));
  };
  const pending = access(services).catch((error) => error);
  await hold.entry;
  await assert.rejects(
    services.shutdownAuthorizationOwner(),
    (error) =>
      f.api.errorEnvelope(error, f.api.createRequestContext()).error.code ===
      "CONFIGURATION_ERROR",
  );
  hold.release();
  assert.equal(
    f.api.errorEnvelope(await pending, f.api.createRequestContext()).error
      .reason,
    "rotation_uncertain",
  );
  assert.equal(services.authorizationState(), "authorization_required");
  // Deletion failure cannot promise durable quarantine for a fresh process: recovery is stopped login.
  assert.equal(
    (await oauth.readOAuthTokenDocument(f.file)).refresh_token,
    "REFRESH_SECRET",
  );
  assert.doesNotMatch(
    f.logs.join(""),
    /LATE_SECRET|REFRESH_SECRET|SECRET EACCES/,
  );
});
