import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const nonempty = (value) =>
  typeof value === "string" && value.trim().length > 0;

// Validate references against the current checkout, not a second package inventory.
export function validateSuite(suite, directory = root) {
  if (
    suite?.version !== 1 ||
    !Array.isArray(suite.scenarios) ||
    !suite.scenarios.length
  )
    throw new Error("Expected version 1 and nonempty scenarios");
  const ids = new Set();
  const validatePaths = (values, label) => {
    if (!Array.isArray(values) || !values.length)
      throw new Error(`${label}: expected paths`);
    for (const value of values) {
      if (
        !nonempty(value) ||
        value.includes("\\") ||
        path.posix.isAbsolute(value) ||
        value.split("/").includes("..")
      )
        throw new Error(`${label}: unsafe path`);
      const absolute = path.join(directory, value);
      let resolved;
      try {
        resolved = fs.realpathSync(absolute);
      } catch (error) {
        if (error.code === "ENOENT")
          throw new Error(`${label}: missing file ${value}`);
        throw error;
      }
      const relative = path.relative(fs.realpathSync(directory), resolved);
      if (
        relative.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relative) ||
        !fs.statSync(absolute).isFile()
      )
        throw new Error(`${label}: expected repository file`);
    }
  };
  for (const scenario of suite.scenarios) {
    if (!/^[a-z][a-z0-9-]+$/.test(scenario?.id ?? "") || ids.has(scenario.id))
      throw new Error("Invalid or duplicate scenario id");
    ids.add(scenario.id);
    if (!nonempty(scenario.prompt))
      throw new Error(`${scenario.id}: missing prompt`);
    validatePaths(scenario.inputs, `${scenario.id} inputs`);
    validatePaths(scenario.references, `${scenario.id} references`);
    for (const canonical of [
      "AGENTS.md",
      "workspace-policy.json",
      "docs/VERIFICATION.md",
      "docs/CHANGE-IMPACT.md",
    ])
      if (!scenario.references.includes(canonical))
        throw new Error(
          `${scenario.id}: missing canonical reference ${canonical}`,
        );
    for (const category of ["required", "forbidden"]) {
      const criteria = scenario.rubric?.[category];
      if (
        !Array.isArray(criteria) ||
        !criteria.length ||
        !criteria.every(nonempty) ||
        new Set(criteria).size !== criteria.length
      )
        throw new Error(`${scenario.id}: invalid ${category} rubric`);
    }
  }
  return suite.scenarios;
}

export function renderPrompt(scenario) {
  return `${scenario.prompt}\n\nInspect these starting inputs in the current checkout:\n${scenario.inputs.map((file) => `- ${file}`).join("\n")}\n\nRead root and applicable scoped guidance. Discover current policy, manifests, and tooling. Report evidence, proposed actions, checks, and limitations. This is a read-only planning exercise.\n`;
}

export function run(args, suite, directory = root) {
  const scenarios = validateSuite(suite, directory);
  if (!args.length)
    return `Validated ${scenarios.length} agent regression scenarios (structure/references only; no model evaluation).`;
  if (args.length === 1 && args[0] === "--list")
    return scenarios.map(({ id }) => id).join("\n");
  if (args.length === 2 && args[0] === "--show") {
    const scenario = scenarios.find(({ id }) => id === args[1]);
    if (!scenario) throw new Error(`Unknown scenario: ${args[1]}`);
    return renderPrompt(scenario);
  }
  throw new Error("Usage: pnpm check:agent-regressions [--list | --show <id>]");
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const suite = JSON.parse(
      fs.readFileSync(
        path.join(root, "agent-regressions/scenarios.json"),
        "utf8",
      ),
    );
    console.info(run(process.argv.slice(2), suite));
  } catch (error) {
    console.error(`Agent regression validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
