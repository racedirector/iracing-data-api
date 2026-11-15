// Isolated subprocess: real credential store, OAuth lifecycle, generated Fetch SDK,
// hosted MCP HTTP transport, and official client; only upstream wire calls are synthetic.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const oauth = require("@iracing-data/oauth-client");
const outputFields = require("./output-fields.json");
const expectedTools = require("./tool-list.json");

let checks = 0;
const routes = [];
const output = [];
const requests = [];
let mode = "normal";
const held = [];

const source = {
  member: { cust_id: 7, display_name: "Synthetic Driver", private: "SECRET" },
  recent: {
    cust_id: 7,
    races: [
      {
        subsession_id: 100,
        finish_position: 1,
        incidents: 2,
        private: "SECRET",
      },
    ],
  },
};

async function until(predicate) {
  for (let i = 0; i < 1000 && !predicate(); i++)
    await new Promise(setImmediate);
  assert.ok(predicate(), "event gate did not settle");
}

const dataFetch = async (target, init = {}) => {
  const url = new URL(target);
  requests.push({ url, init });
  if (mode === "rate") {
    return new Response("SECRET", {
      status: 429,
      headers: { "retry-after": "2" },
    });
  }
  if (mode === "hold") {
    await new Promise((resolve, reject) => {
      const onAbort = () => reject(new Error("aborted synthetic upstream"));
      held.push(() => {
        init.signal.removeEventListener("abort", onAbort);
        resolve();
      });
      init.signal.addEventListener("abort", onAbort, { once: true });
    });
  }
  const headers = new Headers(init.headers);
  if (url.hostname === "members-ng.iracing.com") {
    assert.match(headers.get("authorization"), /^Bearer /);
    routes.push(url.pathname);
    const key = {
      "/data/member/info": "member",
      "/data/stats/member_recent_races": "recent",
    }[url.pathname];
    assert.ok(key, "unexpected generated API route");
    return Response.json({
      link: `https://cache.example.test/${key}?signature=SECRET`,
      expires: new Date(Date.now() + 900000).toISOString(),
    });
  }
  assert.equal(url.hostname, "cache.example.test");
  assert.equal(headers.get("authorization"), null);
  assert.equal(headers.get("cookie"), null);
  assert.equal(init.redirect, "error");
  return Response.json(source[url.pathname.slice(1)]);
};

async function main() {
  global.fetch = dataFetch;
  const api = await import("../../dist/index.js");
  const { Client, StreamableHTTPClientTransport } =
    await import("@modelcontextprotocol/client");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-two-tools-"));
  await fs.chmod(dir, 0o700);
  const file = path.join(dir, "credentials.json");
  const jwt = `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.SECRET`;
  await oauth.writeOAuthTokenDocument(file, {
    access_token: jwt,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "REFRESH_SECRET",
    scope: "iracing.auth",
  });

  const options = {
    credentialFile: file,
    clientMetadata: {
      clientId: "fixture",
      redirectUri: "http://127.0.0.1:0/callback",
      scopes: ["iracing.auth"],
    },
  };
  const credentials = await api.createMcpCredentialOwner(options);
  const app = api.createMcpRuntime({
    config: api.parseRuntimeConfig({}),
    dependencies: api.createCliMcpDependencies(credentials),
  });
  await app.listen(0, "127.0.0.1");
  const port = app.server.address().port;
  const request = (method, body, headers = {}, route = "/mcp") =>
    new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port,
          path: route,
          method,
          headers: { Host: "127.0.0.1:3000", ...headers },
        },
        (res) => {
          let text = "";
          res.on("data", (chunk) => (text += chunk));
          res.on("end", () =>
            resolve(
              new Response(text || null, {
                status: res.statusCode,
                headers: res.headers,
              }),
            ),
          );
        },
      );
      req.on("error", reject);
      req.end(body);
    });
  const client = new Client(
    { name: "contract-fixture", version: "1" },
    { supportedProtocolVersions: ["2025-11-25"] },
  );
  try {
    await client.connect(
      new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3000/mcp"), {
        fetch: (_url, init) =>
          request(
            init.method,
            init.body,
            Object.fromEntries(new Headers(init.headers)),
          ),
      }),
    );
    const tools = (await client.listTools()).tools;
    assert.deepEqual(tools, expectedTools);
    checks++;
    assert.deepEqual(
      tools.map((t) => t.name),
      ["get_my_driver", "get_recent_races"],
    );
    checks++;
    for (const tool of tools) {
      assert.equal(tool.inputSchema.type, "object");
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.equal(tool.annotations.readOnlyHint, true);
      checks++;
    }

    const call = async (name, args = {}) => {
      const result = await client.callTool({ name, arguments: args });
      output.push(JSON.stringify(result));
      assert.ok(!result.isError, JSON.stringify(result));
      assert.deepEqual(
        JSON.parse(result.content[0].text),
        result.structuredContent,
      );
      assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 65536);
      return result.structuredContent;
    };
    const driver = await call("get_my_driver");
    assert.deepEqual(driver, { cust_id: 7, display_name: "Synthetic Driver" });
    checks++;
    const races = await call("get_recent_races");
    assert.equal(races.cust_id, 7);
    assert.equal(races.races.length, 1);
    assert.equal(races.races[0].subsession_id, 100);
    assert.equal(races.races[0].track_id, null);
    assert.deepEqual(
      Object.keys(driver).sort(),
      Object.keys(outputFields.driver).sort(),
    );
    assert.deepEqual(
      Object.keys(races.races[0]).sort(),
      Object.keys(outputFields.recent).sort(),
    );
    checks++;

    assert.deepEqual(routes, [
      "/data/member/info",
      "/data/stats/member_recent_races",
    ]);
    checks++;
    for (const tool of tools) {
      const invalid = await client.callTool({
        name: tool.name,
        arguments: { token: "SECRET" },
      });
      assert.equal(invalid.structuredContent.error.code, "INVALID_INPUT");
      output.push(JSON.stringify(invalid));
      checks++;
    }
    assert.equal(routes.length, 2);
    checks++;

    const headers = {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2025-11-25",
    };
    assert.equal(
      (await request("GET", undefined, {}, "/oauth/login")).status,
      404,
    );
    checks++;
    assert.equal(
      (await request("POST", "{}", { Host: "evil.invalid" })).status,
      403,
    );
    checks++;
    assert.equal(
      (
        await request("POST", "{}", {
          ...headers,
          Origin: "http://evil.invalid",
        })
      ).status,
      403,
    );
    checks++;

    mode = "rate";
    const denied = await client.callTool({
      name: "get_my_driver",
      arguments: {},
    });
    assert.equal(denied.structuredContent.error.code, "RATE_LIMITED");
    output.push(JSON.stringify(denied));
    checks++;
    mode = "normal";

    const missing = await api.createMcpCredentialOwner({
      ...options,
      credentialFile: path.join(dir, "missing.json"),
    });
    assert.equal(missing.authorizationState(), "authorization_required");
    await assert.rejects(missing.getAccessToken());
    checks++;

    mode = "hold";
    const cancel = new AbortController();
    const pending = client
      .callTool(
        { name: "get_my_driver", arguments: {} },
        { signal: cancel.signal },
      )
      .catch(() => undefined);
    await until(() => held.length === 1);
    cancel.abort();
    held.splice(0).forEach((release) => release());
    await pending;
    mode = "normal";
    checks++;

    assert.deepEqual(await call("get_my_driver"), driver);
    checks++;
    assert.doesNotMatch(
      output.join(""),
      /SECRET|Bearer|cache.example|credentials\.json|private/,
    );
  } finally {
    await client.close();
    await app.shutdown();
    await fs.rm(dir, { recursive: true, force: true });
  }
  process.send?.({ checks });
}

main().catch(() => {
  console.error("Independent two-tool composition contract failed");
  process.exitCode = 1;
});
