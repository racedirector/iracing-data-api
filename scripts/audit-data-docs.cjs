const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const pointer = (parts) =>
  "/" +
  parts
    .map((p) => String(p).replaceAll("~", "~0").replaceAll("/", "~1"))
    .join("/");
function resolve(document, schema, seen = new Set()) {
  if (!schema?.$ref) return schema || {};
  if (!schema.$ref.startsWith("#/components/schemas/") || seen.has(schema.$ref))
    throw new Error("Unsupported or cyclic reference");
  seen.add(schema.$ref);
  const target =
    document.components?.schemas?.[
      schema.$ref.slice("#/components/schemas/".length)
    ];
  if (!target) throw new Error("Missing reference");
  return resolve(document, target, seen);
}
function types(document, schema) {
  const value = resolve(document, schema);
  if (value.anyOf || value.oneOf)
    return [
      ...new Set(
        (value.anyOf || value.oneOf).flatMap((s) => types(document, s)),
      ),
    ];
  return Array.isArray(value.type) ? value.type : [value.type];
}
function routeFor(document, pathname) {
  if (document.paths[pathname]?.get) return pathname;
  return Object.keys(document.paths).find((candidate) => {
    const segments = candidate.split("/");
    const actual = pathname.split("/");
    if (segments.length !== actual.length || !document.paths[candidate].get)
      return false;
    return segments.every((part, i) => {
      if (!/^\{[^}]+\}$/.test(part)) return part === actual[i];
      const parameter = document.paths[candidate].get.parameters?.find(
        (p) => p.in === "path" && p.name === part.slice(1, -1),
      );
      const schema = resolve(document, parameter?.schema);
      const choices =
        schema.enum || (schema.anyOf || schema.oneOf)?.map((s) => s.const);
      return parameter && (!choices || choices.includes(actual[i]));
    });
  });
}
function audit(content, document, docsSchema) {
  const parsed = docsSchema.safeParse(content);
  const findings = [],
    rows = [],
    matched = new Set();
  let parameterCount = 0;
  for (const [service, methods] of Object.entries(content))
    for (const [method, docs] of Object.entries(methods)) {
      const endpoint = new URL(docs.link).pathname;
      const evidence = pointer([service, method]);
      const route = routeFor(document, endpoint);
      const row = { endpoint, evidence, route: route || null, parameters: [] };
      rows.push(row);
      parameterCount += Object.keys(docs.parameters || {}).length;
      if (!route) {
        findings.push({ kind: "missing-endpoint", endpoint, evidence });
        continue;
      }
      matched.add(route);
      const parameters = (document.paths[route].get.parameters || []).filter(
        (p) => p.in === "query",
      );
      for (const [name, upstream] of Object.entries(docs.parameters || {})) {
        const local = parameters.find((p) => p.name === name);
        const field = {
          name,
          upstream,
          local: local || null,
          evidence: pointer([service, method, "parameters", name]),
        };
        row.parameters.push(field);
        const add = (kind) => findings.push({ kind, endpoint, ...field });
        if (!local) {
          add("missing-parameter");
          continue;
        }
        if (Boolean(upstream.required) !== Boolean(local.required))
          add("requiredness");
        const localTypes = types(document, local.schema);
        if (upstream.type === "numbers") {
          // CSV strings are intentional wire representations; array serialization
          // needs semantic review against the actual generated runtime.
          if (localTypes.includes("array")) add("array-serialization-review");
          else if (!localTypes.includes("string")) add("type-review");
        } else if (
          !localTypes.includes(upstream.type) &&
          !(upstream.type === "number" && localTypes.includes("integer"))
        )
          add("type-review");
      }
      for (const local of parameters)
        if (!(local.name in (docs.parameters || {})))
          findings.push({
            kind: "undocumented-local-parameter",
            endpoint,
            name: local.name,
            evidence,
          });
    }
  return {
    coverage: {
      endpoints: rows.length,
      parameters: parameterCount,
      matchedEndpoints: rows.filter((r) => r.route).length,
    },
    docsSchema: {
      success: parsed.success,
      issues: parsed.success
        ? []
        : parsed.error.issues.map(({ code, path }) => ({
            code,
            evidence: pointer(path),
          })),
    },
    findings,
    localOnlyPaths: Object.keys(document.paths).filter(
      (p) =>
        p.startsWith("/data/") && !p.startsWith("/data/doc") && !matched.has(p),
    ),
    rows,
    limits:
      "Structural comparison only. Review ranges/enums, conditional requirements, notes, coercion, stripped fields and runtime serialization separately. /data/doc does not establish endpoint response payloads or live endpoint success.",
  };
}
module.exports = { audit, routeFor, resolve };
if (require.main === module) {
  (async () => {
    if (process.argv.length !== 3)
      throw new Error("Expected one snapshot path");
    const { validateSnapshot } = await import(
      path.join(root, "scripts/upstream-contract.mjs")
    );
    const snapshot = validateSnapshot(
      JSON.parse(fs.readFileSync(process.argv[2], "utf8")),
    );
    if (snapshot.kind !== "data") throw new Error("Expected Data API snapshot");
    const { ServicesDocsResponseSchema } = require(
      path.join(root, "packages/api/schema/src"),
    );
    const { document } = require(
      path.join(root, "packages/helpers/api-schema-to-openapi/src"),
    );
    const report = audit(
      snapshot.content,
      document,
      ServicesDocsResponseSchema,
    );
    console.log(
      JSON.stringify(
        {
          provenance: snapshot.provenance,
          contentHash: snapshot.contentHash,
          ...report,
        },
        null,
        2,
      ),
    );
    process.exitCode =
      !report.docsSchema.success ||
      report.findings.length ||
      report.localOnlyPaths.length
        ? 2
        : 0;
  })().catch(() => {
    console.error(
      "Audit failed. Check snapshot validity and build current schema/generator dependencies. No input or raw error logged.",
    );
    process.exitCode = 1;
  });
}
