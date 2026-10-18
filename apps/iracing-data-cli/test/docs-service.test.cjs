const assert = require("node:assert/strict");
const test = require("node:test");

const input = {
  credentials: "selected.yaml",
  output: "documentation.json",
  format: "json",
  force: true,
};

test("shared document executor defers effects and orders credential, fetch, write, diagnostics", async () => {
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const calls = [];
  const document = { links: ["retained generated response"] };
  const service = makeDocumentRequestService({
    diagnostics: {
      info(message) {
        calls.push(["diagnostics", message]);
      },
    },
    async resolveAccessToken(options) {
      calls.push(["resolve", options]);
      return "fake-token";
    },
    async writeDocumentOutput(value, options) {
      calls.push(["write", value, options]);
    },
  });

  const request = {
    input,
    async fetch(token) {
      calls.push(["fetch", token]);
      return document;
    },
    operation: "documentation",
    requiredScope: "iracing.auth",
    outputLabel: "Documentation",
    successMessage: "Data API documentation fetched.",
  };

  assert.deepEqual(calls, []);
  await service.execute(request);
  assert.deepEqual(calls, [
    ["resolve", input],
    ["fetch", "fake-token"],
    ["write", document, { ...input, outputLabel: "Documentation" }],
    ["diagnostics", "Data API documentation fetched."],
  ]);
});

test("shared document executor stops on credential resolution errors without fetching", async () => {
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const failure = new Error("invalid credential");
  const executor = makeDocumentRequestService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => {
      throw failure;
    },
    writeDocumentOutput: async () => assert.fail("unexpected output"),
  });

  await assert.rejects(
    executor.execute({
      input,
      fetch: async () => assert.fail("unexpected fetch"),
      operation: "documentation",
      outputLabel: "Documentation",
      successMessage: "done",
    }),
    (error) => error === failure,
  );
});

test("shared executor maps only request failures and preserves the original cause", async () => {
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const { DataApiRequestError } = await import("../dist/errors.js");
  const failure = new Error("secret content");
  failure.name = "ResponseError";
  failure.response = { status: 403 };
  const executor = makeDocumentRequestService({
    diagnostics: { info: () => assert.fail("unexpected success") },
    resolveAccessToken: async () => "fake-token",
    writeDocumentOutput: async () => assert.fail("unexpected output"),
  });

  await assert.rejects(
    executor.execute({
      input,
      fetch: async () => {
        throw failure;
      },
      operation: "documentation",
      requiredScope: "iracing.auth",
      outputLabel: "Documentation",
      successMessage: "done",
    }),
    (error) => {
      assert.ok(error instanceof DataApiRequestError);
      assert.equal(error.status, 403);
      assert.equal(error.cause, failure);
      assert.match(error.message, /HTTP 403.*iracing\.auth scope/);
      assert.doesNotMatch(error.message, /secret content/);
      return true;
    },
  );
});

test("shared executor does not map document write errors or announce success", async () => {
  const { makeDocumentRequestService } =
    await import("../dist/services/request.js");
  const outputFailure = new Error("cannot write destination");
  let success = false;
  const executor = makeDocumentRequestService({
    diagnostics: {
      info: () => {
        success = true;
      },
    },
    resolveAccessToken: async () => "token",
    writeDocumentOutput: async () => {
      throw outputFailure;
    },
  });
  await assert.rejects(
    executor.execute({
      input,
      fetch: async () => ({ correct: true }),
      operation: "documentation",
      outputLabel: "Documentation",
      successMessage: "done",
    }),
    (error) => error === outputFailure,
  );
  assert.equal(success, false);
});

test("docs handler owns its generated request and selects shared execution", async (t) => {
  const { makeDocsService } = await import("../dist/services/docs.js");
  const { DocApi } = await import("@iracing-data/api-client-fetch");
  const calls = [];
  const document = { a: "from generated client" };
  const getDocs = t.mock.method(DocApi.prototype, "getDocs", async () => {
    calls.push("getDocs");
    return document;
  });
  const service = makeDocsService({
    async execute(request) {
      calls.push("execute");
      assert.deepEqual(request.input, input);
      assert.equal(request.operation, "documentation");
      assert.equal(request.outputLabel, "Documentation");
      assert.equal(request.requiredScope, "iracing.auth");
      assert.equal(request.successMessage, "Data API documentation fetched.");
      assert.equal(await request.fetch("fake-token"), document);
    },
  });

  assert.deepEqual(calls, []);
  await service.execute(input);
  assert.deepEqual(calls, ["execute", "getDocs"]);
  assert.equal(getDocs.mock.callCount(), 1);
});
