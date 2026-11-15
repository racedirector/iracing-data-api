const assert = require("node:assert/strict");
const { test } = require("node:test");

const resourceUrl = "https://mcp.example/mcp";
const issuer = "https://issuer.example/";

function body(method, params) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method,
    ...(params === undefined ? {} : { params }),
  });
}

async function fixture(t) {
  const api = await import("../dist/index.js");
  const observed = [];

  const runtime = api.createMcpRuntime({
    config: api.parseRuntimeConfig({}),
    authorization: {
      resourceUrl,
      issuer,
      requiredScopes: ["mcp:use"],
      verifier: {
        async verifyAccessToken(token) {
          if (token === "invalid") {
            throw new Error("invalid token");
          }

          return {
            token,
            clientId: token,
            scopes: token === "no-scope" ? [] : ["mcp:use"],
            expiresAt: Math.floor(Date.now() / 1000) + 300,
            resource: new URL(resourceUrl),
          };
        },
      },
    },
    dependencies: {
      resolveActor(context) {
        observed.push(context.authInfo?.clientId);

        return context.authInfo
          ? { id: context.authInfo.clientId, provider: "remote" }
          : null;
      },
      resolveDependencies(actor) {
        return {
          driverQueries: {
            getCurrent: async () => ({
              cust_id: actor.id === "alice" ? 1 : 2,
              display_name: actor.id,
            }),
          },
          recentRaceQueries: {
            getRecent: async () => ({ cust_id: 1, races: [] }),
          },
        };
      },
    },
  });

  t.after(() => runtime.shutdown());

  const request = (method, options = {}) => runtime.app.request(
    `http://127.0.0.1:3000${options.path ?? "/mcp"}`,
    {
      method: options.method ?? "POST",
      headers: {
        Host: "127.0.0.1:3000",
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ?? body(method, options.params),
    },
  );

  return { request, observed };
}

test("remote MCP rejects missing bearer and insufficient scopes", async (t) => {
  const { request, observed } = await fixture(t);
  assert.equal((await request("tools/list")).status, 401);
  assert.equal((await request("tools/list", { token: "no-scope" })).status, 403);
  assert.deepEqual(observed, []);
});

test("Hono supplies verified request-local actors without shared credential context", async (t) => {
  const { request, observed } = await fixture(t);

  for (const [token, expectedId] of [["alice", 1], ["bob", 2]]) {
    const response = await request("tools/call", {
      token,
      params: { name: "get_my_driver", arguments: {} },
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.result.structuredContent.cust_id, expectedId);
  }

  assert.deepEqual(observed, ["alice", "bob"]);
});

test("protected-resource metadata is served outside bearer auth", async (t) => {
  const { request } = await fixture(t);
  const response = await request("ignored", {
    method: "GET",
    path: "/.well-known/oauth-protected-resource/mcp",
    body: undefined,
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    resource: resourceUrl,
    authorization_servers: [issuer],
    scopes_supported: ["mcp:use"],
  });
});
