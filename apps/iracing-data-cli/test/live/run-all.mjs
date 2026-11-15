import { existsSync, readFileSync } from "node:fs";
import { runContractShapes } from "./all-endpoints-contract.mjs";

function report(result) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

function readInputs(value) {
  if (!value) return { inputs: {}, routeInputs: {} };
  const text =
    existsSync(value) && !value.trimStart().startsWith("{")
      ? readFileSync(value, "utf8")
      : value;
  const parsed = JSON.parse(text);
  const inputs = parsed.inputs ?? parsed;
  const routeInputs = parsed.routes ?? parsed.routeInputs ?? {};
  return { inputs, routeInputs };
}

if (!process.argv.includes("--run")) {
  report({
    status: "NOT_RUN",
    reason: "Explicit --run opt-in required.",
  });
  process.exitCode = 1;
} else {
  let reviewed;
  try {
    reviewed = readInputs(process.env.IRACING_LIVE_INPUTS);
  } catch {
    report({
      status: "BLOCKED",
      reason: "Set IRACING_LIVE_INPUTS to reviewed input JSON or a path to it.",
    });
    process.exitCode = 1;
  }

  if (!process.exitCode) {
    const result = await runContractShapes({
      ...reviewed,
      credentials: process.env.IRACING_CREDENTIALS,
      delayMs: Number(process.env.IRACING_LIVE_DELAY_MS ?? 1000),
    });
    report(result);
    process.exitCode = result.status === "Compatible" ? 0 : 1;
  }
}
