const { test } = require("node:test");
const assert = require("node:assert/strict");
const { audit, routeFor, resolve } = require("./audit-data-docs.cjs");
const docsSchema = { safeParse: () => ({ success: true }) };
const content = {
  service: {
    get: {
      link: "https://members-ng.iracing.com/data/service/get",
      parameters: {
        id: { type: "number", required: true },
        ids: { type: "numbers" },
      },
    },
  },
};
const document = {
  paths: {
    "/data/service/get": {
      get: {
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: { $ref: "#/components/schemas/id" },
          },
          { name: "ids", in: "query", schema: { type: "string" } },
        ],
      },
    },
  },
  components: { schemas: { id: { type: "number" } } },
};
test("resolves numeric refs and recognizes CSV wire strings", () => {
  const result = audit(content, document, docsSchema);
  assert.deepEqual(result.coverage, {
    endpoints: 1,
    parameters: 2,
    matchedEndpoints: 1,
  });
  assert.deepEqual(result.findings, []);
});
test("reports schema rejection, requiredness and array review", () => {
  const local = structuredClone(document);
  local.paths["/data/service/get"].get.parameters[0].required = false;
  local.paths["/data/service/get"].get.parameters[1].schema = { type: "array" };
  const result = audit(content, local, {
    safeParse: () => ({
      success: false,
      error: {
        issues: [
          { code: "invalid_type", path: ["service", "get", "parameters"] },
        ],
      },
    }),
  });
  assert.equal(result.docsSchema.success, false);
  assert.deepEqual(
    result.findings.map((f) => f.kind),
    ["requiredness", "array-serialization-review"],
  );
});
test("matches template paths and checks allowed categories", () => {
  const local = {
    paths: {
      "/data/category/{category}": {
        get: {
          parameters: [
            {
              in: "path",
              name: "category",
              schema: { anyOf: [{ type: "string", const: "oval" }] },
            },
          ],
        },
      },
    },
  };
  assert.equal(
    routeFor(local, "/data/category/oval"),
    "/data/category/{category}",
  );
  assert.equal(routeFor(local, "/data/category/unknown"), undefined);
});
test("reports missing and local-only endpoints", () => {
  const result = audit(
    content,
    { paths: { "/data/local": { get: {} } } },
    docsSchema,
  );
  assert.equal(result.findings[0].kind, "missing-endpoint");
  assert.deepEqual(result.localOnlyPaths, ["/data/local"]);
});
test("reports incompatible, missing and extra parameters", () => {
  const local = structuredClone(document);
  local.paths["/data/service/get"].get.parameters = [
    { name: "id", in: "query", required: true, schema: { type: "boolean" } },
    { name: "extra", in: "query", schema: { type: "string" } },
  ];
  assert.deepEqual(
    audit(content, local, docsSchema).findings.map((f) => f.kind),
    ["type-review", "missing-parameter", "undocumented-local-parameter"],
  );
});
test("rejects missing and cyclic refs", () => {
  assert.throws(() =>
    resolve(document, { $ref: "#/components/schemas/missing" }),
  );
  assert.throws(() =>
    resolve(
      { components: { schemas: { a: { $ref: "#/components/schemas/a" } } } },
      { $ref: "#/components/schemas/a" },
    ),
  );
});
