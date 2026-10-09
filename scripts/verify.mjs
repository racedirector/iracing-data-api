/**
 * Canonical fail-fast local/CI verification plan; focused entrypoints select the
 * same subsystem plans rather than implementing weaker parallel contracts.
 *
 * Workspace policy selects builds by classification and pnpm builds dependency
 * closures. Tests run only where declared; examples compile without live grants.
 * Repository checks establish topology, tooling regressions and authored style.
 * Generated checks regenerate temporarily, compare freshness, then build SDKs
 * before offline wire tests. Rust uses pinned, locked all-feature workspace
 * checks; clippy reports the configured warning policy without inventing a stricter
 * generator policy. Frozen pnpm installation remains the caller's prerequisite.
 *
 * Plans execute in order and preserve a failing command's exit status. Missing
 * tools fail; no subsystem silently skips. Credentials, accounts and running
 * services are unnecessary. Synthetic protocol fixtures demonstrate local
 * behavior, not current upstream compatibility or JWT signature validity.
 * Docker recovery is a separate explicit service-dependent contract in CI;
 * its harness owns image/persistence coverage, not this service-free runner.
 * verify.test.mjs guards plan composition and schema/wire-test separation.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const subsystems = ["repo", "js", "examples", "generated", "rust"];

export function verificationPlan(subsystem, policy) {
  const pnpm = (label, ...args) => ({ label, command: "pnpm", args });
  const build = (kind) => {
    const packages = policy.workspaces.filter(
      (entry) => entry.ecosystem === "npm" && kind.includes(entry.kind),
    );
    if (!packages.length) throw new Error(`No ${subsystem} workspaces found`);
    return pnpm(
      `${subsystem}: build workspaces and dependencies`,
      ...packages.flatMap((entry) => ["--filter", `${entry.name}...`]),
      "--fail-if-no-match",
      "build",
    );
  };
  switch (subsystem) {
    case "repo":
      return [
        pnpm("repo: topology", "check:topology"),
        pnpm("repo: topology tests", "test:topology"),
        pnpm("repo: verification tests", "test:verification"),
        pnpm("repo: upstream contract tests", "test:upstream"),
        pnpm("repo: impact tests", "test:impact"),
        pnpm("repo: dependency automation tests", "test:dependencies"),
        pnpm("repo: agent regression fixtures", "check:agent-regressions"),
        pnpm(
          "repo: agent regression validator tests",
          "test:agent-regressions",
        ),
        pnpm("repo: lint authored code", "lint"),
        pnpm("repo: format authored files", "style"),
      ];
    case "js":
      return [
        build(["public-release-target", "internal-tool"]),
        pnpm("js: declared package tests", "test"),
      ];
    case "examples":
      return [build(["example"])];
    case "generated":
      return [
        pnpm("generated: normalization and drift tests", "test:codegen"),
        pnpm("generated: regenerate and compare", "check:generated"),
        build(["generated-public-client"]),
        pnpm("generated: Data API wire contract tests", "test:data-contract"),
      ];
    case "rust":
      return [
        {
          label: "rust: format",
          command: "cargo",
          args: ["fmt", "--all", "--", "--check"],
        },
        {
          label: "rust: check",
          command: "cargo",
          args: [
            "check",
            "--workspace",
            "--all-targets",
            "--all-features",
            "--locked",
          ],
        },
        {
          label: "rust: clippy",
          command: "cargo",
          args: [
            "clippy",
            "--workspace",
            "--all-targets",
            "--all-features",
            "--locked",
          ],
        },
        {
          label: "rust: tests",
          command: "cargo",
          args: ["test", "--workspace", "--all-features", "--locked"],
        },
      ];
    default:
      throw new Error(`Unknown verification subsystem: ${subsystem}`);
  }
}

export function runPlan(plan, run = spawnSync) {
  for (const step of plan) {
    console.info(`\n[verify] ${step.label}`);
    const executable =
      step.command === "pnpm"
        ? process.env.npm_execpath || "pnpm"
        : step.command;
    const result = run(executable, step.args, {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (result.error || result.status !== 0) {
      console.error(
        `[verify] FAILED: ${step.label}${result.error ? ` (${result.error.message})` : ""}`,
      );
      return result.status || 1;
    }
  }
  return 0;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const selected = process.argv.slice(2);
    const policy = JSON.parse(
      fs.readFileSync(path.join(root, "workspace-policy.json"), "utf8"),
    );
    const plan = (selected.length ? selected : subsystems).flatMap((name) =>
      verificationPlan(name, policy),
    );
    process.exitCode = runPlan(plan);
  } catch (error) {
    console.error(`[verify] ${error.message}`);
    process.exitCode = 1;
  }
}
