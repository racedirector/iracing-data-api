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

test("Data API JSON/YAML preserve query mapping, authentication, and response envelopes", async (t) => {
  const document = await generate(t);
  assertReferencesAndOperations(document);
  assert.equal(document.servers[0].url, "https://members-ng.iracing.com/");
  assert.deepEqual(document.security, [{ bearerAuth: [] }]);
  assert.equal(document.components.securitySchemes.bearerAuth.scheme, "bearer");
  const member = document.paths["/data/member/get"].get;
  assert.equal(member.operationId, "getMember");
  const customer = member.parameters.find(
    (parameter) => parameter.name === "cust_ids",
  );
  assert.equal(customer.in, "query");
  assert.equal(customer.required, true);
  const results = document.paths["/data/results/get"].get;
  assert.equal(results.operationId, "getResults");
  const subsession = results.parameters.find(
    (parameter) => parameter.name === "subsession_id",
  );
  assert.equal(subsession.in, "query");
  assert.equal(subsession.required, true);
  assert.equal(subsession.schema.type, "number");
  for (const operation of [member, results]) {
    for (const [status, name] of [
      [200, "Success"],
      [401, "Unauthorized"],
      [429, "RateLimited"],
      [503, "Maintenance"],
    ]) {
      assert.equal(
        operation.responses[status].$ref,
        `#/components/responses/${name}`,
      );
    }
  }
  const success = dereference(
    document,
    document.components.responses.Success.content["application/json"].schema,
  );
  assert.ok(success.properties.link);
  assert.ok(success.properties.expires);
  assert.ok(document.components.responses.Success.headers["x-ratelimit-limit"]);
  assert.ok(
    document.components.responses.Success.headers["x-ratelimit-remaining"],
  );
  assert.ok(document.components.responses.Success.headers["x-ratelimit-reset"]);
});

test("current docs optionality and corrected wire paths are represented", () => {
  const document = exportedDocument;
  const docs = document.components.schemas.iracingServiceMethodDocs;
  assert.equal(docs.required.includes("parameters"), false);
  assert.ok(docs.properties.note);
  for (const [path, operationId] of [
    ["/data/stats/season_tt_results", "getStatsSeasonTimeTrialResults"],
    ["/data/stats/season_tt_standings", "getStatsSeasonTimeTrialStandings"],
  ]) {
    assert.equal(document.paths[path].get.operationId, operationId);
  }
  assert.equal(
    document.paths["/data/stats/season_time_trial_results"],
    undefined,
  );
  assert.deepEqual(
    document.components.schemas.iracingServiceMethodDocs.properties.note.oneOf,
    [{ type: "string" }, { type: "array", items: { type: "string" } }],
  );
  const recapYear = document.paths[
    "/data/stats/member_recap"
  ].get.parameters.find((p) => p.name === "year");
  assert.equal(recapYear.schema.type, "number");
  assert.equal(recapYear.schema.anyOf, undefined);
  for (const endpoint of [
    "spectator_subsessionids",
    "spectator_subsessionids_detail",
  ]) {
    const operation = document.paths[`/data/season/${endpoint}`].get;
    for (const parameter of operation.parameters) {
      assert.equal(parameter.schema.type, "array");
      assert.equal(parameter.style, "form");
      assert.equal(parameter.explode, false);
      assert.ok(parameter.schema.items);
    }
  }
  const boolean = document.paths["/data/league/directory"].get.parameters.find(
    (p) => p.name === "restrict_to_member",
  );
  assert.equal(boolean.schema.type, "boolean");
  for (const endpoint of ["categories", "divisions", "event_types"])
    assert.equal(
      document.paths[`/data/constants/${endpoint}`].get.responses[200].$ref,
      "#/components/responses/Constants",
    );
  const constants = dereference(
    document,
    document.components.responses.Constants.content["application/json"].schema,
  );
  assert.equal(constants.type, "array");
  assert.equal(constants.items.type, "object");
});
