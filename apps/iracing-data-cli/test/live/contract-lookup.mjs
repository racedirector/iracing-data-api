import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schemas from "@iracing-data/api-schema";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Generated OpenAPI contract consumed by the SDK generators. */
export const contract = JSON.parse(
  readFileSync(path.resolve(here, "../../../../openapi/iracing.json"), "utf8"),
);

const schemaById = new Map();
for (const [name, schema] of Object.entries(schemas)) {
  if (!name.endsWith("Schema") || typeof schema?.meta !== "function") continue;
  const id = schema.meta()?.id;
  if (id && !schemaById.has(id)) schemaById.set(id, { name, schema });
}

function responseFor(route) {
  const response = contract.paths[route]?.get?.responses?.["200"];
  if (!response) return undefined;
  if (!response.$ref) return response;
  return contract.components.responses[response.$ref.split("/").at(-1)];
}

/** Runtime GET routes, excluding the documentation map. */
export function runtimeRoutes() {
  return Object.entries(contract.paths)
    .filter(
      ([route, item]) =>
        item.get &&
        route.startsWith("/data/") &&
        !route.startsWith("/data/doc"),
    )
    .map(([route]) => route);
}

/** Canonical Zod schema generated for a route's 200 response. */
export function responseSchemaFor(route) {
  const reference =
    responseFor(route)?.content?.["application/json"]?.schema?.$ref;
  if (!reference) return undefined;
  return schemaById.get(reference.split("/").at(-1));
}

/** Required request parameters declared by the contract. */
export function requiredParameters(route) {
  return (contract.paths[route]?.get?.parameters ?? []).filter(
    (parameter) => parameter.required,
  );
}

/** Substitute path parameters with reviewed inputs. */
export function concretePath(route, inputs) {
  return route.replaceAll(/\{([^}]+)\}/g, (_, name) => String(inputs[name]));
}

// Keep the established CLI names while deriving ordinary group/leaf names.
const aliases = {
  "/data/carclass/get": ["metadata", "car-class"],
  "/data/car/get": ["metadata", "car"],
  "/data/track/get": ["metadata", "track"],
  "/data/results/get": ["results"],
  "/data/league/get_points_systems": ["league", "points-systems"],
  "/data/league/season_sessions": ["league", "sessions"],
  "/data/league/season_standings": ["league", "standings"],
  "/data/league/cust_league_sessions": ["league", "customer-sessions"],
  "/data/session/reg_drivers_list": ["session", "registered-drivers"],
  "/data/driver_stats_by_category/{category}": ["driver-stats-by-category"],
};

/** CLI command path for a runtime route. */
export function commandFor(route) {
  if (aliases[route]) return aliases[route];
  const [, , group, leaf] = route.split("/");
  if (leaf === "assets" && group !== "series") return ["assets", group];
  if (group === "results") return [`results-${leaf.replaceAll("_", "-")}`];
  return [group.replaceAll("_", "-"), leaf.replaceAll("_", "-")];
}

/** Format reviewed inputs as CLI flags for the route's declared parameters. */
export function flagArgs(route, inputs) {
  const flags = [];
  for (const parameter of contract.paths[route]?.get?.parameters ?? []) {
    const value = inputs[parameter.name];
    if (value === undefined || value === null) continue;
    flags.push(
      `--${parameter.name.replaceAll("_", "-")}`,
      Array.isArray(value) ? value.join(",") : String(value),
    );
  }
  return flags;
}

/**
 * Collapse the current documentation map into comparable runtime routes.
 * Driver-stat category variants share one maintained path template.
 */
export function documentedRoutes(docs) {
  const routes = new Set();
  for (const [service, methods] of Object.entries(docs ?? {})) {
    for (const method of Object.keys(methods)) {
      routes.add(
        service === "driver_stats_by_category"
          ? "/data/driver_stats_by_category/{category}"
          : `/data/${service}/${method}`,
      );
    }
  }
  return [...routes].sort();
}

/**
 * Documented invariants that identify a successful document.
 * @returns {string | undefined} Failure reason, if any.
 */
export function semanticFailure(schemaId, body) {
  if (
    [
      "resultsSearchSeriesResponse",
      "resultsSearchHostedResponse",
      "statsWorldRecordsResponse",
      "leagueRosterResponse",
      "memberAwardsResponse",
      "memberAwardInstancesResponse",
    ].includes(schemaId) &&
    body?.data?.success !== true
  ) {
    return "Response reports an unsuccessful document.";
  }
  return undefined;
}

/** Sanitized Zod issues: field paths and codes only, never received values. */
export function issueFields(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "(root)",
    code: issue.code,
  }));
}
