import { createDocsCommand } from "../../dist/commands/docs/command.js";
import { createDocsService } from "../../dist/commands/docs/service.js";
import { createProgram } from "../../dist/program.js";
import {
  commandFor,
  concretePath,
  documentedRoutes,
  flagArgs,
  issueFields,
  requiredParameters,
  responseSchemaFor,
  runtimeRoutes,
  semanticFailure,
} from "./contract-lookup.mjs";

/**
 * Validate the immediate modeled response for every runtime route.
 *
 * Drives the existing CLI through an injected transport, records the raw wire
 * response before decoder normalization, and never follows returned `link` or
 * `data_url` payloads. Cache URLs are stubbed so only the contract envelope is
 * under examination.
 *
 * @param {object} options - Reviewed static inputs and transport.
 * @param {Record<string, unknown>} [options.inputs] - Shared request inputs.
 * @param {Record<string, Record<string, unknown>>} [options.routeInputs] - Per-route overrides.
 * @param {string} [options.credentials] - Explicit CLI credential file.
 * @param {string} [options.accessToken] - Explicit bearer token.
 * @param {typeof fetch} [options.transport] - HTTP transport.
 * @param {Record<string, unknown> | null} [options.docs] - Pre-fetched docs; null skips preflight.
 * @param {string[]} [options.routes] - Route subset for focused runs.
 * @param {number} [options.delayMs] - Serial request spacing.
 * @param {number} [options.timeoutMs] - Per-request timeout.
 * @returns {Promise<object>} Sanitized coverage and per-route results.
 */
export async function runContractShapes({
  inputs = {},
  routeInputs = {},
  credentials,
  accessToken,
  transport = globalThis.fetch,
  docs,
  routes,
  delayMs = 1000,
  timeoutMs = 30_000,
}) {
  const expected = runtimeRoutes();
  const declared = routes ?? expected;
  const results = [];
  const base = { requests: 0, matches: 0 };

  let expectedPath = "/data/doc";
  let captured;
  let failure;
  let cacheDownloads = 0;
  let currentDocs = docs;

  const fetch = async (input, init) => {
    const url = new URL(String(input));
    base.requests++;
    if (url.hostname !== "members-ng.iracing.com") {
      cacheDownloads++;
      return url.pathname.includes("driver_stats_by_category")
        ? new Response("name,value\r\nExample,1\r\n", {
            headers: { "content-type": "text/csv" },
          })
        : Response.json({});
    }
    if (url.pathname !== expectedPath) {
      failure = "Unexpected modeled route.";
      throw new Error("Blocked modeled request.");
    }
    let response;
    try {
      response = await transport(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      failure = "Network failure or timeout.";
      throw new Error("Transport unavailable.");
    }
    if (!response.ok) {
      failure = `HTTP ${response.status}; operator action required before rerun.`;
      return response;
    }
    if (
      !/^application\/json(?:;|$)/i.test(
        response.headers.get("content-type") ?? "",
      )
    ) {
      failure = "Non-JSON content type.";
      return response;
    }
    try {
      captured = await response.clone().json();
    } catch {
      failure = "Malformed JSON response.";
    }
    return response;
  };

  const diagnostics = { info() {}, warn() {}, error() {} };
  const program = createProgram({
    fetch,
    diagnostics,
    display: { display() {} },
  });
  program.commands.splice(
    program.commands.findIndex((command) => command.name() === "docs"),
    1,
  );
  program.addCommand(
    createDocsCommand(
      createDocsService({
        fetch,
        diagnostics,
        async writeDocumentOutput(value) {
          currentDocs ??= value;
        },
      }),
    ),
  );
  program.exitOverride().configureOutput({ writeErr() {}, writeOut() {} });
  for (const command of program.commands) {
    command.exitOverride().configureOutput({ writeErr() {}, writeOut() {} });
    for (const leaf of command.commands) {
      leaf.exitOverride().configureOutput({ writeErr() {}, writeOut() {} });
    }
  }

  const credentialArgs = [];
  if (accessToken) credentialArgs.push("--access-token", accessToken);
  else if (credentials) credentialArgs.push("--credentials", credentials);

  if (docs === undefined) {
    try {
      await program.parseAsync(["node", "live", ...credentialArgs, "docs"]);
      if (!currentDocs) failure ??= "Documentation preflight returned no map.";
    } catch {
      failure ??= "CLI or credential preflight failed.";
    }
    if (failure || !currentDocs) {
      return {
        ...base,
        status: "Unable to verify part of the contract",
        reason: `Documentation preflight failed: ${failure ?? "empty response"}.`,
        matches: 0,
        coverage: {
          documented: 0,
          expected: expected.length,
          missing: expected,
          unexpected: [],
          ok: false,
        },
        summary: summary(results),
        results,
      };
    }
  }

  const coverage = coverageFor(expected, currentDocs);

  for (const route of declared) {
    const values = { ...inputs, ...routeInputs[route] };
    const missingInputs = requiredParameters(route)
      .filter((parameter) => values[parameter.name] === undefined)
      .map((parameter) => parameter.name);
    const binding = responseSchemaFor(route);

    if (missingInputs.length) {
      results.push({
        route,
        schema: binding?.name,
        status: "NOT_RUN",
        reason: `Missing reviewed inputs: ${missingInputs.join(", ")}.`,
      });
      continue;
    }
    if (!binding) {
      results.push({
        route,
        status: "NOT_RUN",
        reason: "Unmapped canonical response schema in the generated contract.",
      });
      continue;
    }

    captured = undefined;
    failure = undefined;
    expectedPath = concretePath(route, values);
    const leaf = findCommand(program, commandFor(route));
    const flags = flagArgs(route, values);
    if (leaf?.options.some((option) => option.long === "--response-only")) {
      flags.push("--response-only");
    }

    try {
      await program.parseAsync([
        "node",
        "live",
        ...credentialArgs,
        ...commandFor(route),
        ...flags,
      ]);
    } catch {
      failure ??= "CLI invocation failed.";
    }

    if (captured === undefined) {
      results.push({
        route,
        schema: binding.name,
        status: "BLOCKED",
        reason: failure ?? "No modeled response observed.",
      });
      if (/HTTP 401|HTTP 403/.test(failure ?? "")) break;
      if (/HTTP 429/.test(failure ?? "")) break;
      continue;
    }

    const parsed = binding.schema.safeParse(captured);
    if (!parsed.success) {
      results.push({
        route,
        schema: binding.name,
        status: "CONTRACT_MISMATCH",
        reason: "Raw response rejected by the canonical schema.",
        fields: issueFields(parsed.error),
      });
    } else {
      const semantic = semanticFailure(binding.schema.meta?.()?.id, captured);
      results.push({
        route,
        schema: binding.name,
        status: semantic ? "CONTRACT_MISMATCH" : "PASS",
        ...(semantic ? { reason: semantic } : {}),
      });
    }

    if (delayMs > 0 && route !== declared.at(-1)) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    ...base,
    matches: results.filter((result) => result.status === "PASS").length,
    status: overallStatus(results, coverage),
    coverage,
    cacheDownloads,
    summary: summary(results),
    results,
  };
}

function findCommand(program, path) {
  let current = program;
  for (const name of path) {
    current = current?.commands.find((command) => command.name() === name);
    if (!current) return undefined;
  }
  return current;
}

function coverageFor(expected, docs) {
  if (!docs) return undefined;
  const documented = documentedRoutes(docs);
  const documentedSet = new Set(documented);
  const expectedSet = new Set(expected);
  const missing = expected.filter((route) => !documentedSet.has(route));
  const unexpected = documented.filter((route) => !expectedSet.has(route));
  return {
    documented: documented.length,
    expected: expected.length,
    missing,
    unexpected,
    ok: missing.length === 0 && unexpected.length === 0,
  };
}

function summary(results) {
  const count = (status) => results.filter((r) => r.status === status).length;
  return {
    total: results.length,
    pass: count("PASS"),
    mismatch: count("CONTRACT_MISMATCH"),
    blocked: count("BLOCKED"),
    notRun: count("NOT_RUN"),
  };
}

function overallStatus(results, coverage) {
  if (results.some((result) => result.status === "CONTRACT_MISMATCH"))
    return "Compatibility issues found";
  if (
    !coverage?.ok ||
    results.some((result) => ["BLOCKED", "NOT_RUN"].includes(result.status))
  )
    return "Unable to verify part of the contract";
  return "Compatible";
}
