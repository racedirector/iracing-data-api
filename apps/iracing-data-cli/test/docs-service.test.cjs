const assert = require("node:assert/strict");
const test = require("node:test");

test("docs service defers all effects and executes injected dependencies in order", async () => {
  const { makeDocsService } = await import("../dist/services/docs.js");
  const calls = [];
  const document = { links: ["retained generated response"] };
  const input = {
    credentials: "selected.yaml",
    output: "documentation.json",
    format: "json",
    force: true,
  };
  const service = makeDocsService({
    diagnostics: {
      info(message) {
        calls.push(["diagnostics", message]);
      },
    },
    async resolveAccessToken(options) {
      calls.push(["resolve", options]);
      return "fake-token";
    },
    createApi(token) {
      calls.push(["api", token]);
      return {
        doc: {
          async getDocs() {
            calls.push(["getDocs"]);
            return document;
          },
        },
      };
    },
    async writeDocumentOutput(value, options) {
      calls.push(["write", value, options]);
    },
  });

  assert.deepEqual(calls, []);
  await service.execute(input);
  assert.deepEqual(calls, [
    ["resolve", input],
    ["api", "fake-token"],
    ["getDocs"],
    ["write", document, { ...input, outputLabel: "Documentation" }],
    ["diagnostics", "Data API documentation fetched."],
  ]);
});

test("docs service stops when credential resolution rejects", async () => {
  const { makeDocsService } = await import("../dist/services/docs.js");
  const failure = new Error("selected credential file is invalid");
  const service = makeDocsService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => { throw failure; },
    createApi: () => assert.fail("unexpected API construction"),
    writeDocumentOutput: async () => assert.fail("unexpected output"),
  });
  await assert.rejects(
    service.execute({ format: "json" }),
    (error) => error === failure,
  );
});

test("docs service maps only generated request failures and retains their cause", async () => {
  const { makeDocsService } = await import("../dist/services/docs.js");
  const upstreamFailure = new Error("response contains secret");
  upstreamFailure.name = "ResponseError";
  upstreamFailure.response = { status: 403 };

  const service = makeDocsService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => "token",
    createApi: () => ({
      doc: {
        getDocs: async () => { throw upstreamFailure; },
      },
    }),
    writeDocumentOutput: async () => assert.fail("unexpected output"),
  });
  await assert.rejects(service.execute({ format: "json" }), (error) => {
    assert.match(error.message, /HTTP 403/);
    assert.doesNotMatch(error.message, /secret/);
    assert.equal(error.cause, upstreamFailure);
    return true;
  });
});

test("docs service propagates publication failures without relabeling them", async () => {
  const { makeDocsService } = await import("../dist/services/docs.js");
  const outputFailure = new Error("cannot write destination");
  let success = false;
  const service = makeDocsService({
    diagnostics: { info: () => { success = true; } },
    resolveAccessToken: async () => "token",
    createApi: () => ({
      doc: { getDocs: async () => ({ correct: true }) },
    }),
    writeDocumentOutput: async () => { throw outputFailure; },
  });
  await assert.rejects(
    service.execute({ format: "yaml" }),
    (error) => error === outputFailure,
  );
  assert.equal(success, false);
});
