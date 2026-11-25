const assert = require("node:assert/strict");
const test = require("node:test");
const { z } = require("zod");

const services = {
  getDriverQueries: () => ({
    getCurrent: async () => ({ cust_id: 1, display_name: "Fixture" }),
  }),
  getRecentRaceQueries: () => ({
    getRecent: async () => ({ cust_id: 1, races: [] }),
  }),
};

async function fixture(t, overrides = {}, selectors = services) {
  const { registerApplicationTool } = await import("../dist/execution.js");
  const { McpServer, InMemoryTransport } =
    await import("@modelcontextprotocol/server");
  const { Client } = await import("@modelcontextprotocol/client");
  const server = new McpServer({ name: "execution-fixture", version: "1" });
  const definition = {
    name: "fixture",
    description: "Synthetic execution boundary",
    annotations: { readOnlyHint: true },
    inputSchema: z.strictObject({}),
    outputSchema: z.object({ value: z.number() }),
    execute: async () => ({ ok: true, data: { value: 1 } }),
    ...overrides,
  };

  // Keep a direct callback seam to test cancellation without a wire response.
  let callback;
  registerApplicationTool(
    {
      registerTool(name, config, handler) {
        callback = handler;
        return server.registerTool(name, config, handler);
      },
    },
    selectors,
    definition,
  );
  const [serverTransport, clientTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "execution-client", version: "1" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });
  return {
    client,
    call: (input = {}, options) =>
      client.callTool({ name: definition.name, arguments: input }, options),
    invoke: (input = {}, signal = new AbortController().signal, authInfo) =>
      callback(input, { mcpReq: { signal }, http: { authInfo } }),
  };
}

test("parsed defaults, refinements and transforms run before execution exactly once", async (t) => {
  let transforms = 0;
  let refinements = 0;
  let executed = 0;
  const f = await fixture(t, {
    inputSchema: z
      .strictObject({
        value: z.string().transform((value) => {
          transforms++;
          return Number(value);
        }),
        limit: z.int().default(10),
      })
      .superRefine(async (input, context) => {
        refinements++;
        if (input.value < 0) {
          context.addIssue({ code: "custom", message: "SECRET_REFINEMENT" });
        }
      }),
    execute: async (input) => {
      executed++;
      assert.deepEqual(input, { value: 2, limit: 10 });
      return { ok: true, data: { value: input.value + input.limit } };
    },
  });
  const result = await f.call({ value: "2" });
  assert.deepEqual(result.structuredContent, { value: 12 });
  assert.equal(
    result.content[0].text,
    JSON.stringify(result.structuredContent),
  );
  assert.equal(transforms, 1);
  assert.equal(refinements, 1);
  assert.equal(executed, 1);

  const invalid = await f.call({ value: "-1" });
  assert.equal(invalid.isError, true);
  assert.equal(invalid.structuredContent.error.code, "INVALID_INPUT");
  assert.doesNotMatch(JSON.stringify(invalid), /SECRET_REFINEMENT/);
  assert.equal(executed, 1);
});

test("input diagnostics project only allowlisted schema paths and reasons", async (t) => {
  const f = await fixture(t, {
    inputSchema: z
      .strictObject({ field: z.string() })
      .superRefine((_input, context) => {
        context.addIssue({
          code: "custom",
          path: ["field"],
          message: "SECRET_SCHEMA_MESSAGE",
          params: { reason: "invalid_value" },
        });
        context.addIssue({
          code: "custom",
          path: ["field"],
          message: "SECRET_SCHEMA_MESSAGE",
          params: { reason: "SECRET_REASON" },
        });
        context.addIssue({
          code: "custom",
          path: ["Bad Segment"],
          message: "SECRET_SCHEMA_MESSAGE",
          params: { reason: "invalid_value" },
        });
        context.addIssue({
          code: "custom",
          path: ["Bad Segment", "nested"],
          message: "SECRET_SCHEMA_MESSAGE",
          params: { reason: "invalid_format" },
        });
        context.addIssue({
          code: "custom",
          path: ["list", 0, "name"],
          message: "SECRET_SCHEMA_MESSAGE",
          params: { reason: "invalid_value" },
        });
        context.addIssue({
          code: "custom",
          message: "SECRET_SCHEMA_MESSAGE",
          params: { reason: "invalid_value" },
        });
      }),
  });
  const result = await f.call({ field: "LEAK_CANARY" });

  assert.equal(result.structuredContent.error.code, "INVALID_INPUT");
  // A mixed valid/invalid segment path is rejected as a whole rather than
  // retargeted to the surviving segment; array indices collapse.
  assert.deepEqual(result.structuredContent.error.details, [
    { field: "field", reason: "invalid_value" },
    { field: "list.name", reason: "invalid_value" },
  ]);
  assert.doesNotMatch(
    JSON.stringify(result),
    /SECRET_SCHEMA_MESSAGE|SECRET_REASON|LEAK_CANARY/,
  );
});

test("canonical output projects both representations and supplies output defaults", async (t) => {
  const f = await fixture(t, {
    outputSchema: z.object({
      value: z.number(),
      label: z.string().default("default"),
    }),
    execute: async () => ({
      ok: true,
      data: { value: 42, token: "SECRET" },
    }),
  });
  const result = await f.call();
  assert.deepEqual(result.structuredContent, { value: 42, label: "default" });
  assert.deepEqual(
    JSON.parse(result.content[0].text),
    result.structuredContent,
  );
  assert.doesNotMatch(JSON.stringify(result), /token|SECRET/);
});

test("expected descriptors and branded thrown failures retain safe metadata", async (t) => {
  const { ApplicationFailure } = await import("../dist/index.js");
  for (const execute of [
    async () => ({
      ok: false,
      error: {
        code: "TOKEN_REFRESH_FAILED",
        reason: "transient_refresh",
        retry_after_seconds: 2.1,
        message: "SECRET",
      },
    }),
    async () => {
      throw new ApplicationFailure("TOKEN_REFRESH_FAILED", {
        reason: "transient_refresh",
        retry_after_seconds: 2.1,
      });
    },
  ]) {
    const f = await fixture(t, { execute });
    const result = await f.call();
    const error = result.structuredContent.error;
    assert.equal(result.isError, true);
    assert.equal(error.code, "TOKEN_REFRESH_FAILED");
    assert.equal(error.reason, "transient_refresh");
    assert.equal(error.retryable, true);
    assert.equal(error.retry_after_seconds, 3);
    assert.equal(
      result.content[0].text,
      JSON.stringify(result.structuredContent),
    );
    assert.doesNotMatch(JSON.stringify(result), /SECRET|stack|cause/);
  }
});

test("unexpected exceptions, lookalikes, transform exceptions and invalid outputs are sanitized", async (t) => {
  const cases = [
    {
      execute: async () => {
        throw new Error("SECRET");
      },
    },
    {
      execute: async () => {
        throw { code: "AUTHORIZATION_REQUIRED", message: "SECRET" };
      },
    },
    {
      inputSchema: z.strictObject({}).transform(() => {
        throw new Error("SECRET");
      }),
    },
    {
      execute: async () => ({
        ok: false,
        error: { code: "SECRET", reason: "SECRET" },
      }),
    },
    {
      execute: async () => ({ ok: true, data: { value: "SECRET" } }),
      expected: "DATA_RESOLUTION_FAILED",
    },
  ];
  for (const { expected = "INTERNAL_ERROR", ...definition } of cases) {
    const f = await fixture(t, definition);
    const result = await f.call();
    assert.equal(result.structuredContent.error.code, expected);
    assert.doesNotMatch(JSON.stringify(result), /SECRET|stack|cause/);
  }
});

test("request correlation and verified auth are isolated per invocation", async (t) => {
  const { requestId } = await import("../dist/index.js");
  const contexts = [];
  const f = await fixture(t, {
    execute: async (_input, context) => {
      contexts.push(context);
      return {
        ok: false,
        error: { code: "AUTHORIZATION_REQUIRED", reason: "missing_session" },
      };
    },
  });
  const authA = { clientId: "alice", token: "SECRET_A", scopes: [] };
  const authB = { clientId: "bob", token: "SECRET_B", scopes: [] };
  const controlA = new AbortController();
  const controlB = new AbortController();
  const [a, b] = await Promise.all([
    f.invoke({}, controlA.signal, authA),
    f.invoke({}, controlB.signal, authB),
  ]);
  assert.equal(contexts[0].authInfo, authA);
  assert.equal(contexts[1].authInfo, authB);
  assert.equal(contexts[0].signal, controlA.signal);
  assert.equal(contexts[1].signal, controlB.signal);
  assert.notEqual(contexts[0].request, contexts[1].request);
  assert.equal(
    a.structuredContent.error.request_id,
    requestId(contexts[0].request),
  );
  assert.equal(
    b.structuredContent.error.request_id,
    requestId(contexts[1].request),
  );
  assert.doesNotMatch(JSON.stringify([a, b]), /SECRET/);
});

test("schema conversion rejects incompatible contracts before registration", async () => {
  const { registerApplicationTool } = await import("../dist/execution.js");
  let registered = 0;
  for (const schemas of [
    { inputSchema: z.string(), outputSchema: z.object({ value: z.number() }) },
    { inputSchema: z.strictObject({}), outputSchema: z.array(z.number()) },
    {
      inputSchema: z.strictObject({}),
      outputSchema: z.object({ value: z.number().transform(String) }),
    },
  ]) {
    assert.throws(() =>
      registerApplicationTool(
        {
          registerTool() {
            registered++;
          },
        },
        services,
        {
          name: "invalid-schema",
          description: "Synthetic invalid contract",
          annotations: {},
          ...schemas,
          execute: async () => ({ ok: true, data: { value: 1 } }),
        },
      ),
    );
  }
  assert.equal(registered, 0);
});

test("cancellation before parsing, during parsing and after execution is never an outage", async (t) => {
  let effects = 0;
  const control = new AbortController();
  const f = await fixture(t, {
    execute: async () => {
      effects++;
      return { ok: true, data: { value: 1 } };
    },
  });
  control.abort("SECRET_ABORT");
  await assert.rejects(f.invoke({}, control.signal), {
    name: "AbortError",
    message: "Request cancelled.",
  });
  assert.equal(effects, 0);

  for (const phase of ["input", "output", "execute"]) {
    const controller = new AbortController();
    const definition = {};
    if (phase === "execute") {
      definition.execute = async () => {
        controller.abort("SECRET_ABORT");
        throw new Error("SECRET_CAUSE");
      };
    } else {
      definition[phase === "input" ? "inputSchema" : "outputSchema"] = z
        .object(phase === "input" ? {} : { value: z.number() })
        .superRefine(async () => {
          controller.abort("SECRET_ABORT");
        });
    }
    const cancelled = await fixture(t, definition);
    await assert.rejects(cancelled.invoke({}, controller.signal), {
      name: "AbortError",
      message: "Request cancelled.",
    });
  }
});

test(
  "SDK cancellation reaches execution before held work is released",
  { timeout: 3000 },
  async (t) => {
    const entered = Promise.withResolvers();
    const aborted = Promise.withResolvers();
    const release = Promise.withResolvers();
    t.after(() => release.resolve());
    const f = await fixture(t, {
      execute: async (_input, context) => {
        context.signal.addEventListener("abort", () => aborted.resolve(), {
          once: true,
        });
        entered.resolve();
        await release.promise;
        return { ok: true, data: { value: 1 } };
      },
    });
    const control = new AbortController();
    const pending = assert.rejects(f.call({}, { signal: control.signal }));
    await entered.promise;
    control.abort();
    await aborted.promise;
    release.resolve();
    await pending;
  },
);

test("UTF-8 budget counts both structured and text copies", async (t) => {
  for (const [value, code] of [
    ["a".repeat(32000), undefined],
    ["é".repeat(32000), "RESPONSE_LIMIT_EXCEEDED"],
  ]) {
    const f = await fixture(t, {
      outputSchema: z.object({ value: z.string() }),
      execute: async () => ({ ok: true, data: { value } }),
    });
    const result = await f.call();
    assert.equal(result.structuredContent.error?.code, code);
    assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 64 * 1024);
  }
});
