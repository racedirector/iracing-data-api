const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const jwt = (exp) =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.fixture`;

test("local credentials refresh once and persist rotated tokens before API use", async (t) => {
  const { createCliCapabilities } = await import("../dist/credentials.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-refresh-"));
  await fs.chmod(directory, 0o700);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "credentials.json");
  await fs.writeFile(
    file,
    JSON.stringify({
      access_token: jwt(1),
      refresh_token: "original-refresh",
      token_type: "Bearer",
      expires_in: 3600,
    }),
    { mode: 0o600 },
  );
  const issued = {
    access_token: jwt(Math.floor(Date.now() / 1000) + 3600),
    refresh_token: "rotated-refresh",
    token_type: "Bearer",
    expires_in: 3600,
  };
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  let refreshes = 0;
  globalThis.fetch = async (input, init) => {
    const url = new URL(input);
    if (url.hostname === "oauth.iracing.com") {
      refreshes++;
      const body = new URLSearchParams(init.body);
      assert.equal(body.get("grant_type"), "refresh_token");
      assert.equal(body.get("refresh_token"), "original-refresh");
      assert.equal(body.get("client_id"), "fixture-client");
      return Response.json(issued);
    }
    if (url.hostname === "members-ng.iracing.com") {
      assert.equal(
        new Headers(init.headers).get("authorization"),
        `Bearer ${issued.access_token}`,
      );
      assert.deepEqual(JSON.parse(await fs.readFile(file, "utf8")), issued);
      return Response.json({
        link: "https://cache.example.test/member",
        expires: new Date(Date.now() + 60000).toISOString(),
      });
    }
    return Response.json({ cust_id: 42, display_name: "Fixture Driver" });
  };
  const capabilities = createCliCapabilities(file, {
    clientId: "fixture-client",
    scopes: [],
  });
  const query = () =>
    capabilities.driverQueries.getCurrent({
      signal: new AbortController().signal,
    });
  await Promise.all([query(), query()]);
  await query();
  assert.equal(refreshes, 1);
});
