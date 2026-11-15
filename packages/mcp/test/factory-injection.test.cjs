const assert = require("node:assert/strict");
const test = require("node:test");

test("factory creates independent listener-free servers and permits caller registration", async (t) => {
  const { createIracingMcpServer } = await import("../dist/index.js");
  const { InMemoryTransport } = await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");
  let selected = 0;
  let value = {
    cust_id: 42,
    display_name: "Synthetic Driver",
    secret: "SECRET",
  };
  const services = {
    getDriverQueries(context) {
      selected++;
      assert.ok(context.signal instanceof AbortSignal);
      return {
        getCurrent: async ({ signal }) => {
          assert.ok(signal instanceof AbortSignal);
          return value;
        },
      };
    },
  };
  const signals = ["SIGINT", "SIGTERM"];
  const before = signals.map((signal) => process.listenerCount(signal));
  const settings = {
    serverInfo: { name: "factory-test", version: "1" },
    services,
  };
  const first = createIracingMcpServer(settings);
  const second = createIracingMcpServer(settings);
  assert.notEqual(first, second);
  assert.deepEqual(
    signals.map((signal) => process.listenerCount(signal)),
    before,
  );
  assert.equal(selected, 0);
  first.registerTool("extra", {}, async () => ({
    content: [{ type: "text", text: "extra" }],
  }));

  const client = new Client({ name: "factory-client", version: "1" });
  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();
  await first.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await first.close();
    await second.close();
  });

  const tools = (await client.listTools()).tools;
  assert.deepEqual(
    tools.map((item) => item.name),
    ["get_my_driver", "get_recent_races", "extra"],
  );
  const rejected = await client.callTool({
    name: "get_my_driver",
    arguments: { access_token: "SECRET" },
  });
  assert.equal(rejected.structuredContent.error.code, "INVALID_INPUT");
  assert.equal(selected, 0);

  const result = await client.callTool({
    name: "get_my_driver",
    arguments: {},
  });
  assert.deepEqual(result.structuredContent, {
    cust_id: 42,
    display_name: "Synthetic Driver",
  });
  assert.equal(
    result.content[0].text,
    JSON.stringify(result.structuredContent),
  );
  assert.equal(selected, 1);
  assert.doesNotMatch(JSON.stringify(result), /SECRET|access_token/);

  value = { cust_id: "SECRET", display_name: "Synthetic Driver" };
  const invalid = await client.callTool({
    name: "get_my_driver",
    arguments: {},
  });
  assert.equal(invalid.structuredContent.error.code, "DATA_RESOLUTION_FAILED");
  assert.doesNotMatch(JSON.stringify(invalid), /SECRET|stack|cause/);
  assert.equal(
    (await client.callTool({ name: "extra", arguments: {} })).content[0].text,
    "extra",
  );
});
