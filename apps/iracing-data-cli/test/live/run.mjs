import { runHostedContract } from "./hosted-contract.mjs";

function report(result) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (!process.argv.includes("--run")) {
  report({
    status: "NOT_RUN",
    reason: "Explicit --run opt-in required.",
  });
  process.exitCode = 1;
} else {
  let query;
  try {
    query = JSON.parse(process.env.IRACING_LIVE_HOSTED_QUERY ?? "");
  } catch {
    report({
      status: "BLOCKED",
      reason: "Set IRACING_LIVE_HOSTED_QUERY to reviewed query JSON.",
    });
    process.exitCode = 1;
  }
  if (process.exitCode !== 1) {
    const result = await runHostedContract({
      query,
      credentials: process.env.IRACING_CREDENTIALS,
    });
    report(result);
    process.exitCode = result.status === "PASS" ? 0 : 1;
  }
}
