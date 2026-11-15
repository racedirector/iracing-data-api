/**
 * Authored OpenAPI document and CLI serialization contract. JSON, .yaml and .yml
 * output must parse to the same in-memory document; explicit --format overrides
 * the filename. The library exposes that document/default export without owning
 * filesystem output. Execute the built CLI into disposable temporary destinations
 * and clean them after each test, never replacing checked-in contracts.
 * Unique operation IDs, resolvable local references and representative protocol
 * mappings guard repository consistency, not live upstream compatibility. The
 * assertions own the surviving format guarantees.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import generator, { document as exportedDocument } from "../dist/index.js";

const cli = fileURLToPath(new URL("../dist/cli.js", import.meta.url));

test("hosted-search maps to its direct manifest (modify results-search-hosted)", () => {
  assert.equal(
    exportedDocument.paths["/data/results/search_hosted"].get.responses[200]
      .$ref,
    "#/components/responses/ResultsSearchHosted",
  );
  assert.equal(
    exportedDocument.components.responses.ResultsSearchHosted.content[
      "application/json"
    ].schema.$ref,
    "#/components/schemas/resultsSearchHostedResponse",
  );
});

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

test("numeric query adapters preserve named event and division contracts", () => {
  const document = exportedDocument;
  for (const [component, values, endpoints, parameterName] of [
    [
      "iracingEventType",
      [2, 3, 4, 5],
      ["/data/results/season_results"],
      "event_type",
    ],
    [
      "iracingDivision",
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [
        "/data/stats/season_driver_standings",
        "/data/stats/season_supersession_standings",
        "/data/stats/season_tt_standings",
        "/data/stats/season_tt_results",
        "/data/stats/season_qualify_results",
      ],
      "division",
    ],
  ]) {
    assert.deepEqual(
      document.components.schemas[component]?.anyOf.map((entry) => entry.const),
      values,
      component,
    );
    for (const endpoint of endpoints) {
      const parameter = document.paths[endpoint].get.parameters.find(
        (entry) => entry.name === parameterName,
      );
      assert.equal(
        parameter.schema.$ref,
        `#/components/schemas/${component}`,
        endpoint,
      );
      assert.equal(parameter.schema.type, undefined, endpoint);
      assert.equal(parameter.required, undefined, endpoint);
    }
  }

  // These two adapters historically projected the numeric wire input, rather
  // than the enum output. Naming them now would also change the public contract.
  for (const name of ["category_id", "chart_type"]) {
    const parameter = document.paths[
      "/data/member/chart_data"
    ].get.parameters.find((entry) => entry.name === name);
    assert.equal(parameter.schema.type, "number");
    assert.equal(parameter.schema.$ref, undefined);
    assert.equal(parameter.required, true);
  }
});

test("the public document matches reviewed compatibility maintenance", () => {
  // Reviewed against HEAD and current authenticated docs during the 2026-11-14
  // CLI maintenance pass: preserve the existing roster repair; add current-season
  // and registered-driver routes/docs, repeated lookup selectors, member-award
  // metadata, the world-record manifest, and driver-stat CSV documentation.
  // Member-division coercion retains requiredness and the numeric 4/5 domain.
  // 2026-11-15 UTC: DATA-001 adds only the hosted manifest component/response
  // and changes its 200 binding. Removing exactly those changes reproduces the
  // prior reviewed fingerprint. See docs/DATA-API-RECONCILIATION.md.
  // Ignore object key order, but preserve array order and every contract field.
  // Intentional contract changes require reviewing the delta before updating this
  // fingerprint; never derive the expected value from the current generated file.
  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, canonical(value[key])]),
      );
    return value;
  }
  assert.equal(
    createHash("sha256")
      .update(JSON.stringify(canonical(exportedDocument)))
      .digest("hex"),
    "4df75430470d7cb202ca7e420025d2eba20162443b1278b944a959d4ffb88e3f",
    "Public OpenAPI differs from the reviewed contract; audit the full delta before updating the fingerprint",
  );
});

test("CLI compatibility repairs preserve modeled response variants and parameter requiredness", () => {
  for (const route of [
    "/data/lookup/current_season",
    "/data/session/reg_drivers_list",
  ]) {
    assert.ok(exportedDocument.paths[route].get);
  }
  for (const [route, model] of [
    ["/data/member/awards", "memberAwardsResponse"],
    ["/data/member/award_instances", "memberAwardInstancesResponse"],
    ["/data/stats/world_records", "statsWorldRecordsResponse"],
  ]) {
    assert.equal(
      exportedDocument.paths[route].get.responses[200].content[
        "application/json"
      ].schema.$ref,
      `#/components/schemas/${model}`,
    );
  }
  const event = exportedDocument.paths[
    "/data/stats/member_division"
  ].get.parameters.find((parameter) => parameter.name === "event_type");
  assert.equal(event.required, true);
  assert.deepEqual(
    event.schema.anyOf.map((value) => value.const),
    [4, 5],
  );
  const selectors = exportedDocument.paths["/data/lookup/get"].get.parameters;
  assert.deepEqual(
    selectors.map((parameter) => parameter.name),
    ["weather", "licenselevels"],
  );
  for (const selector of selectors) {
    assert.equal(selector.schema.type, "array");
    assert.equal(selector.required, undefined);
    assert.notEqual(selector.explode, false);
  }
});

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

test("search_series retains its manifest while other non-search results use cache envelopes", async (t) => {
  const document = await generate(t);
  const operation = document.paths["/data/results/search_series"].get;
  assert.equal(operation.operationId, "getResultsSearchSeries");
  assert.equal(
    operation.responses[200].$ref,
    "#/components/responses/ResultsSearchSeries",
  );
  const response = document.components.responses.ResultsSearchSeries;
  assert.deepEqual(
    response.headers,
    document.components.responses.Success.headers,
  );
  assert.deepEqual(response.content["application/json"].schema, {
    $ref: "#/components/schemas/resultsSearchSeriesResponse",
  });
  const manifest = dereference(
    document,
    response.content["application/json"].schema,
  );
  assert.deepEqual(manifest.required, ["type", "data"]);
  assert.equal(manifest.properties.type.const, "search_series_results");
  assert.equal(manifest.properties.link, undefined);
  assert.equal(manifest.properties.expires, undefined);
  const data = dereference(document, manifest.properties.data);
  assert.deepEqual(data.required, ["success", "chunk_info", "params"]);
  const chunks = dereference(document, data.properties.chunk_info);
  assert.deepEqual(chunks.required, [
    "chunk_size",
    "num_chunks",
    "rows",
    "base_download_url",
    "chunk_file_names",
  ]);
  assert.equal(chunks.properties.chunk_file_names.type, "array");
  assert.equal(chunks.properties.chunk_file_names.items.type, "string");
  for (const [path, item] of Object.entries(document.paths)) {
    if (
      path.startsWith("/data/results/") &&
      !["/data/results/search_series", "/data/results/search_hosted"].includes(
        path,
      )
    )
      assert.equal(
        item.get.responses[200].$ref,
        "#/components/responses/Success",
        path,
      );
  }
  for (const status of [401, 429, 503])
    assert.deepEqual(
      operation.responses[status],
      document.paths["/data/results/search_hosted"].get.responses[status],
    );
});
