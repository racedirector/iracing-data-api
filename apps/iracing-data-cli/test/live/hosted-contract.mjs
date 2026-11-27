import * as schemas from "@iracing-data/api-schema";
import { document } from "@iracing-data/api-schema-to-openapi";
import { createDocsCommand } from "../../dist/commands/docs/command.js";
import { createDocsService } from "../../dist/commands/docs/service.js";
import { createProgram } from "../../dist/program.js";

const endpoint = "/data/results/search_hosted";

/** Resolve canonical acceptance from the maintained endpoint mapping, not a test table. */
function responseBinding() {
  const reference = document.paths[endpoint].get.responses[200].$ref;
  const response = document.components.responses[reference.split("/").at(-1)];
  const id = response.content["application/json"].schema.$ref.split("/").at(-1);
  const entry = Object.entries(schemas).find(
    ([name, schema]) => name.endsWith("Schema") && schema.meta?.()?.id === id,
  );
  if (!entry) throw new Error("Unmapped canonical response schema.");
  return entry;
}

/**
 * Run the reviewed hosted-search case through existing CLI commands.
 * Raw bodies remain private in memory; reports contain only sanitized outcomes.
 */
export async function runHostedContract({
  query,
  credentials,
  accessToken,
  fetch: transport = globalThis.fetch,
}) {
  const base = {
    endpoint,
    command: "results-search-hosted",
    decision: "modify",
  };
  const input = schemas.ResultsSearchHostedParametersSchema.safeParse(query);
  if (!input.success)
    return { ...base, status: "BLOCKED", reason: "Invalid operator query." };
  let binding;
  try {
    binding = responseBinding();
  } catch {
    return {
      ...base,
      status: "BLOCKED",
      reason: "Unmapped canonical response schema.",
    };
  }
  const [schemaSymbol, schema] = binding;
  const report = { ...base, schemaSymbol };
  let calls = 0;
  let observed;
  let failure;
  let docs;
  let expectedPath = "/data/doc";
  const fetch = async (url, init) => {
    if (++calls > 2 || new URL(String(url)).pathname !== expectedPath) {
      failure = "Request budget or route exceeded.";
      throw new Error("Blocked request.");
    }
    let response;
    try {
      response = await transport(url, {
        ...init,
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      failure = "Network failure or timeout.";
      throw new Error("Transport unavailable.");
    }
    if (!response.ok) {
      failure = `HTTP ${response.status}; operator action required before rerun.`;
      throw new Error("Service unavailable.");
    }
    if (
      !/^application\/json(?:;|$)/i.test(
        response.headers.get("content-type") ?? "",
      )
    ) {
      failure = "Non-JSON content type.";
      throw new Error("Unexpected content type.");
    }
    try {
      observed = await response.clone().json();
    } catch {
      failure = "Malformed JSON response.";
      throw new Error("Invalid JSON.");
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
          docs = value;
        },
      }),
    ),
  );
  program.exitOverride().configureOutput({ writeErr() {}, writeOut() {} });
  let credentialArgs = [];
  if (accessToken) credentialArgs = ["--access-token", accessToken];
  if (credentials) credentialArgs = ["--credentials", credentials];
  try {
    // Docs is the auth preflight; failure stops the batch without probing search.
    await program.parseAsync(["node", "live", ...credentialArgs, "docs"]);
    if (!docs?.results?.search_hosted) {
      return {
        ...report,
        status: "BLOCKED",
        reason: "Hosted search absent from current docs.",
      };
    }
    expectedPath = endpoint;
    observed = undefined;
    const flags = Object.entries(input.data).flatMap(([key, value]) =>
      value === undefined
        ? []
        : [
            `--${key.replaceAll("_", "-")}`,
            Array.isArray(value) ? value.join(",") : String(value),
          ],
    );
    await program.parseAsync([
      "node",
      "live",
      ...credentialArgs,
      "results-search-hosted",
      ...flags,
      "--response-only",
    ]);
  } catch {
    return {
      ...report,
      status: "BLOCKED",
      reason: failure ?? "CLI or credential preflight failed.",
    };
  }
  const result = schema.safeParse(observed);
  if (!result.success) {
    return {
      ...report,
      status: "CONTRACT_MISMATCH",
      reason: "Raw response rejected by canonical schema.",
      fields: result.error.issues.map((issue) => issue.path.join(".")),
    };
  }
  if (
    observed?.type !== "search_hosted_results" ||
    observed?.data?.success !== true
  ) {
    return {
      ...report,
      status: "CONTRACT_MISMATCH",
      reason: "Expected hosted-search success manifest.",
    };
  }
  return {
    ...report,
    status: "PASS",
    reason:
      "Raw manifest accepted; chunks not fetched; filter semantics not established.",
  };
}
