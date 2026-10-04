import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import generator from "../dist/index.js";

const { document: exportedDocument } = generator;
const cli = fileURLToPath(new URL("../dist/cli.js", import.meta.url));

async function generate(t) {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "iracing-contract-"));
  t.after(() => fs.rmSync(outputDir, { recursive: true, force: true }));
  for (const file of ["contract.json", "contract.yaml", "contract.yml"]) {
    execFileSync(process.execPath, [cli, "-o", outputDir, "-f", file]);
  }
  const document = JSON.parse(
    fs.readFileSync(path.join(outputDir, "contract.json"), "utf8"),
  );
  assert.deepEqual(
    parse(fs.readFileSync(path.join(outputDir, "contract.yaml"), "utf8")),
    document,
  );
  assert.deepEqual(document, exportedDocument);
  assert.deepEqual(generator.default, exportedDocument);
  assert.deepEqual(
    parse(fs.readFileSync(path.join(outputDir, "contract.yml"), "utf8")),
    document,
  );
  execFileSync(process.execPath, [
    cli,
    "-o",
    outputDir,
    "-f",
    "contract.yaml",
    "--format",
    "json",
  ]);
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(outputDir, "contract.yaml"), "utf8")),
    document,
  );
  assert.equal(document.openapi, "3.1.1");
  return document;
}

function assertReferencesAndOperations(document) {
  const operationIds = new Set();
  for (const item of Object.values(document.paths)) {
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const operation = item[method];
      if (!operation) continue;
      assert.ok(operation.operationId);
      assert.ok(
        !operationIds.has(operation.operationId),
        `Duplicate operationId: ${operation.operationId}`,
      );
      operationIds.add(operation.operationId);
    }
  }
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (value.$ref) {
      assert.ok(value.$ref.startsWith("#/"));
      const resolved = value.$ref
        .slice(2)
        .split("/")
        .reduce(
          (node, key) =>
            node?.[key.replaceAll("~1", "/").replaceAll("~0", "~")],
          document,
        );
      assert.notEqual(
        resolved,
        undefined,
        `Unresolved reference: ${value.$ref}`,
      );
    }
    for (const child of Object.values(value)) visit(child);
  }
  visit(document);
}

function dereference(document, schema) {
  return schema.$ref
    ? schema.$ref
        .slice(2)
        .split("/")
        .reduce((node, key) => node[key], document)
    : schema;
}

test("OAuth JSON/YAML preserve token grants, profile security, and revocation encoding", async (t) => {
  const document = await generate(t);
  assertReferencesAndOperations(document);
  assert.equal(document.servers[0].url, "https://oauth.iracing.com/oauth2");
  const exchange = document.paths["/token"].post;
  assert.equal(exchange.operationId, "exchangeToken");
  const request = dereference(
    document,
    exchange.requestBody.content["application/x-www-form-urlencoded"].schema,
  );
  assert.equal(request.oneOf.length, 3);
  const grants = request.oneOf.map((branch) => dereference(document, branch));
  assert.deepEqual(
    grants.map((grant) => grant.properties.grant_type.const).sort(),
    ["authorization_code", "password_limited", "refresh_token"],
  );
  const refresh = grants.find(
    (grant) => grant.properties.grant_type.const === "refresh_token",
  );
  assert.ok(refresh.required.includes("refresh_token"));
  const response = dereference(
    document,
    exchange.responses[200].content["application/json"].schema,
  );
  assert.equal(response.properties.token_type.const, "Bearer");
  assert.ok(response.required.includes("access_token"));
  assert.ok(!response.required.includes("refresh_token"));
  const error = dereference(
    document,
    exchange.responses[400].content["application/json"].schema,
  );
  assert.ok(error.required.includes("error"));
  assert.deepEqual(document.paths["/iracing/profile"].get.security, [
    { bearerAuth: [] },
  ]);
  assert.equal(document.paths["/authorize"].get.operationId, "authorize");
  const state = document.paths["/authorize"].get.parameters.find(
    (parameter) => parameter.name === "state",
  );
  assert.equal(state.in, "query");
  const encoding =
    document.paths["/revoke/sessions"].post.requestBody.content[
      "application/x-www-form-urlencoded"
    ].encoding.session_ids;
  assert.deepEqual(encoding, { style: "form", explode: false });
});
