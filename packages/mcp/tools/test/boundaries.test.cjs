const assert = require("node:assert/strict");
const test = require("node:test");
const { Configuration } = require("@iracing-data/api-client-fetch");
const names = [
  "get_my_driver",
  "find_drivers",
  "get_recent_races",
  "lookup_content",
  "list_series_seasons",
  "get_series_schedule",
  "get_race_result",
  "search_driver_races",
];
async function fixture(t, options = {}) {
  const api = await import("../dist/index.js");
  const { McpServer, InMemoryTransport } =
    await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");
  const requests = [];
  let scope = {};
  const configuration = new Configuration({
    accessToken: async () => {
      await Promise.resolve();
      return "BEARER_SECRET";
    },
    fetchApi: async (url, init) => {
      requests.push({ url: new URL(url), init });
      if (options.fetchApi) return options.fetchApi(url, init);
      if (new URL(url).hostname === "members-ng.iracing.com")
        return Response.json({
          link: "https://cache.example.test/payload?signature=SECRET",
          expires: new Date(Date.now() + 900000).toISOString(),
        });
      return Response.json(
        options.payload ??
          (new URL(requests[requests.length - 2].url).pathname.includes(
            "lookup",
          )
            ? [
                { cust_id: 1, display_name: "One" },
                { cust_id: 2, display_name: "Two" },
              ]
            : { cust_id: 1, display_name: "One", secret: "SECRET" }),
      );
    },
  });
  const services = {
    getDataApiAccess: (context) => {
      options.context?.(context);
      return { configuration, continuationScope: scope };
    },
  };
  const server = new McpServer({ name: "consumer-service", version: "1.0.0" });
  server.registerTool("before", {}, async () => ({
    content: [{ type: "text", text: "before" }],
  }));
  api.registerIracingTools(server, services);
  server.registerTool("after", {}, async () => ({
    content: [{ type: "text", text: "after" }],
  }));
  const client = new Client({ name: "contract-test", version: "1" });
  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });
  return {
    api,
    server,
    client,
    requests,
    configuration,
    services,
    changeScope: () => {
      scope = {};
    },
    call: (name, args = {}) => client.callTool({ name, arguments: args }),
  };
}
test("caller-owned server registers native input/output contracts and independent tools", async (t) => {
  const f = await fixture(t);
  const tools = (await f.client.listTools()).tools;
  assert.deepEqual(
    tools.map((x) => x.name),
    ["before", ...names, "after"],
  );
  for (const tool of tools.filter((x) => names.includes(x.name))) {
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(tool.outputSchema.type, "object");
  }
  assert.equal((await f.call("before")).content[0].text, "before");
  assert.equal((await f.call("after")).content[0].text, "after");
  assert.ok(!("createMcpServer" in f.api));
  assert.ok(!("DataApiGateway" in f.api));
});
test("generated configuration owns async bearer injection; linked requests get no bearer or middleware headers", async (t) => {
  let context;
  const f = await fixture(t, {
    context: (x) => {
      context = x;
    },
  });
  const result = await f.call("get_my_driver");
  assert.deepEqual(result.structuredContent, {
    cust_id: 1,
    display_name: "One",
  });
  assert.equal(
    new Headers(f.requests[0].init.headers).get("authorization"),
    "Bearer BEARER_SECRET",
  );
  assert.equal(
    new Headers(f.requests[1].init.headers).has("authorization"),
    false,
  );
  assert.equal(f.requests[1].init.redirect, "error");
  assert.ok(context.signal instanceof AbortSignal);
  assert.doesNotMatch(JSON.stringify(result), /SECRET|signature/);
});
test("linked payloads and invalid inputs are sanitized; generated HTTP failures map safely", async (t) => {
  const f = await fixture(t, {
    payload: { cust_id: "SECRET", display_name: "One" },
  });
  const bad = await f.call("get_my_driver");
  assert.equal(bad.structuredContent.error.code, "DATA_RESOLUTION_FAILED");
  assert.doesNotMatch(JSON.stringify(bad), /SECRET|stack|cause/);
  const input = await f.call("get_my_driver", { token: "SECRET" });
  assert.equal(input.structuredContent.error.code, "INVALID_INPUT");
  assert.equal(f.requests.length, 2);
  const denied = await fixture(t, {
    fetchApi: async () => new Response("SECRET", { status: 401 }),
  });
  assert.equal(
    (await denied.call("get_my_driver")).structuredContent.error.code,
    "UPSTREAM_UNAUTHORIZED",
  );
});
test("continuations replay deterministically and cannot cross opaque scopes", async (t) => {
  const f = await fixture(t);
  const first = (await f.call("find_drivers", { query: "On", limit: 1 }))
    .structuredContent;
  const page = await f.call("find_drivers", { cursor: first.next_cursor });
  assert.equal(page.structuredContent.items[0].cust_id, 2);
  assert.deepEqual(
    await f.call("find_drivers", { cursor: first.next_cursor }),
    page,
  );
  assert.equal(f.requests.length, 2);
  f.changeScope();
  assert.equal(
    (await f.call("find_drivers", { cursor: first.next_cursor }))
      .structuredContent.error.code,
    "CURSOR_EXPIRED",
  );
});
test("cancellation reaches the generated request signal", async (t) => {
  let signal;
  let started;
  const ready = new Promise((resolve) => {
    started = resolve;
  });
  const f = await fixture(t, {
    fetchApi: async (_url, init) => {
      signal = init.signal;
      started();
      return new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        }),
      );
    },
  });
  const cancel = new AbortController();
  const pending = f.client
    .callTool(
      { name: "get_my_driver", arguments: {} },
      { signal: cancel.signal },
    )
    .catch(() => undefined);
  await ready;
  cancel.abort();
  await pending;
  for (let i = 0; i < 50 && !signal.aborted; i++)
    await new Promise(setImmediate);
  assert.equal(signal.aborted, true);
});
test("native SDK output validation rejects an invalid structured result", async (t) => {
  const { z } = await import("zod");
  const f = await fixture(t);
  f.server.registerTool(
    "invalid_output",
    {
      inputSchema: z.object({}),
      outputSchema: z.object({ required: z.number() }),
    },
    async () => ({ content: [], structuredContent: { required: "invalid" } }),
  );
  const result = await f.call("invalid_output");
  assert.equal(result.isError, true);
});
test("linked URLs require HTTPS and reject embedded credentials", async (t) => {
  for (const link of [
    "http://cache.example.test/",
    "https://user:secret@cache.example.test/",
  ]) {
    const f = await fixture(t, {
      fetchApi: async () =>
        Response.json({
          link,
          expires: new Date(Date.now() + 900000).toISOString(),
        }),
    });
    assert.equal(
      (await f.call("get_my_driver")).structuredContent.error.code,
      "DATA_RESOLUTION_FAILED",
    );
    assert.equal(f.requests.length, 1);
  }
});
