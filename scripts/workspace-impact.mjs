/**
 * Read-only change and release planning over the current workspace graph.
 *
 * Compare the supplied base's merge-base with HEAD against the working tree,
 * including non-ignored untracked files. Missing history is an error, not an empty
 * report. Load identities/classifications from workspace policy, dependencies and
 * versions from manifests, and managed publication membership from dist config.
 * The longest matching workspace path owns a direct change.
 *
 * Explicit generation edges supplement manifest dependencies: Data API schema or
 * mappings affect both OpenAPI formats and all Data API SDKs; OAuth contract edits
 * affect OAuth OpenAPI and its generated Fetch client without a Data API SDK edge.
 * Generator/presentation inputs affect the relevant branch; shared inputs affect
 * every generated client. Global npm/toolchain/CI changes affect all
 * workspaces; Cargo configuration affects Cargo members. Propagate every internal
 * manifest dependency category to a fixed point, then order selected public,
 * managed candidates dependency-first (including the schema-to-SDK release edge).
 * Cycles fail instead of suggesting an unsafe order.
 *
 * A candidate is a review input, not a version bump, validation result or release
 * authorization. Commands are suggestions; this module neither generates nor
 * publishes. Update workspace-impact.test.mjs when adding a generation edge.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseToml } from "smol-toml";

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const publicKinds = new Set([
  "public-release-target",
  "generated-public-client",
]);
const sorted = (values) => [...new Set(values)].sort();

export function loadWorkspaces(directory) {
  const read = (file) => fs.readFileSync(path.join(directory, file), "utf8");
  const policy = JSON.parse(read("workspace-policy.json")).workspaces;
  const managed = new Set(
    parseToml(read("dist-workspace.toml")).workspace.members.map((member) => {
      const [ecosystem, location] = member.split(":");
      return `${ecosystem}:${path.posix.normalize(location).replace(/\/$/, "")}`;
    }),
  );
  return policy.map((entry) => {
    const manifest =
      entry.ecosystem === "npm"
        ? JSON.parse(read(`${entry.path}/package.json`))
        : parseToml(read(`${entry.path}/Cargo.toml`));
    const dependencies =
      entry.ecosystem === "npm"
        ? sorted(
            [
              "dependencies",
              "devDependencies",
              "peerDependencies",
              "optionalDependencies",
            ]
              .flatMap((group) => Object.keys(manifest[group] ?? {}))
              .filter((name) =>
                policy.some(
                  (candidate) =>
                    candidate.name === name && candidate.ecosystem === "npm",
                ),
              ),
          )
        : sorted(
            ["dependencies", "dev-dependencies", "build-dependencies"]
              .flatMap((group) =>
                Object.entries(manifest[group] ?? {}).map(([name, value]) =>
                  typeof value === "object" ? (value.package ?? name) : name,
                ),
              )
              .filter((name) =>
                policy.some(
                  (candidate) =>
                    candidate.name === name && candidate.ecosystem === "cargo",
                ),
              ),
          );
    return {
      ...entry,
      version: (manifest.package ?? manifest).version,
      dependencies,
      managed: managed.has(`${entry.ecosystem}:${entry.path}`),
    };
  });
}

export function releaseOrder(entries) {
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const visited = new Set();
  const active = new Set();
  const result = [];
  function visit(name) {
    if (active.has(name)) throw new Error(`Internal dependency cycle: ${name}`);
    if (visited.has(name)) return;
    active.add(name);
    for (const dependency of sorted(byName.get(name).dependencies)) {
      if (byName.has(dependency)) visit(dependency);
    }
    active.delete(name);
    visited.add(name);
    result.push(name);
  }
  for (const name of sorted(byName.keys())) visit(name);
  return result;
}

export function analyzeImpact(
  files,
  workspaces,
  { includeGlobal = true, precisePresentation = false } = {},
) {
  const changedFiles = sorted(files);
  const direct = new Set();
  const affected = new Set();
  const generated = new Set();
  const commands = new Set(["pnpm verify:repo"]);
  const derived = new Set();
  const add = (entry) => {
    if (entry) affected.add(entry.name);
  };
  const generatedClients = workspaces.filter(
    (entry) => entry.kind === "generated-public-client",
  );
  const oauthClients = generatedClients.filter(
    (entry) => entry.path === "packages/oauth/client/generated",
  );
  const apiClients = generatedClients.filter(
    (entry) => !oauthClients.includes(entry),
  );
  const markGenerated = (entries) => {
    for (const entry of entries) {
      add(entry);
      generated.add(entry.name);
    }
  };
  let api = false;
  let oauth = false;
  const global = changedFiles.some((file) =>
    /^(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|workspace-policy\.json|dist-workspace\.toml|tsconfig.*\.json|eslint\.config\..*|\.nvmrc|\.prettier.*|\.github\/workflows\/.*)$/.test(
      file,
    ),
  );
  for (const file of changedFiles) {
    const owner = workspaces
      .filter(
        (entry) =>
          entry.path !== "." &&
          (file === entry.path || file.startsWith(`${entry.path}/`)),
      )
      .sort((a, b) => b.path.length - a.path.length)[0];
    if (owner) {
      direct.add(owner.name);
      add(owner);
    }
    api ||=
      /^(packages\/api\/schema\/|packages\/helpers\/api-schema-to-openapi\/|openapi\/iracing\.)/.test(
        file,
      );
    oauth ||=
      /^(packages\/oauth\/schema\/|packages\/helpers\/oauth-schema-to-openapi\/|openapi\/oauth\.)/.test(
        file,
      );

    if (
      file === "openapitools.json" ||
      /^scripts\/(normalize-client-presentation|generated\.|check-generated)/.test(
        file,
      )
    ) {
      markGenerated(generatedClients);
      commands.add("pnpm codegen");
    } else if (
      /^scripts\/(openapi-generator-oauth-fetch|oauth-client-presentation\/)/.test(
        file,
      )
    ) {
      markGenerated(oauthClients);
      commands.add("pnpm codegen:client:oauth:fetch");
    } else if (
      /^scripts\/(openapi-generator-(axios|fetch|rust)|client-presentation\/)/.test(
        file,
      )
    ) {
      const template =
        /^scripts\/client-presentation\/([^/.]+)\.(md|json)$/.exec(file);
      const templateOwners =
        precisePresentation && template
          ? apiClients.filter((entry) =>
              entry.ecosystem === "cargo"
                ? template[1] === "rust"
                : path.posix.basename(entry.path) === template[1],
            )
          : [];
      markGenerated(templateOwners.length ? templateOwners : apiClients);
      commands.add("pnpm codegen:client:api");
    }
  }
  // Release presentation omits global-only maintenance; normal planning remains
  // conservative and includes every workspace affected by toolchain/CI changes.
  if (global && includeGlobal) for (const entry of workspaces) add(entry);
  if (
    changedFiles.some((file) => /^(Cargo\.(toml|lock)|\.cargo\/)/.test(file))
  ) {
    for (const entry of workspaces.filter(
      (entry) => entry.ecosystem === "cargo",
    ))
      add(entry);
  }
  if (api) {
    derived.add("openapi/iracing.json");
    derived.add("openapi/iracing.yaml");
    markGenerated(apiClients);
    commands.add("pnpm codegen");
  }
  if (oauth) {
    derived.add("openapi/oauth.json");
    derived.add("openapi/oauth.yaml");
    markGenerated(oauthClients);
    commands.add(
      "pnpm --filter '@iracing-data/oauth-schema-to-openapi...' build",
    );
    commands.add("pnpm codegen:openapi:oauth");
    commands.add("pnpm codegen:openapi:oauth:yaml");
    commands.add("pnpm codegen:client:oauth:fetch");
  }
  for (const entry of generatedClients)
    if (direct.has(entry.name)) generated.add(entry.name);
  let previous;
  do {
    previous = affected.size;
    for (const entry of workspaces)
      if (
        entry.path !== "." &&
        entry.dependencies.some((name) => affected.has(name))
      )
        add(entry);
  } while (affected.size !== previous);
  const impacted = workspaces.filter((entry) => affected.has(entry.name));
  if (global) commands.add("pnpm verify");
  else {
    if (
      impacted.some(
        (entry) =>
          entry.ecosystem === "npm" &&
          ["public-release-target", "internal-tool"].includes(entry.kind),
      )
    )
      commands.add("pnpm verify:js");
    if (impacted.some((entry) => entry.kind === "example"))
      commands.add("pnpm verify:examples");
    if (generated.size || derived.size) commands.add("pnpm verify:generated");
    if (impacted.some((entry) => entry.ecosystem === "cargo"))
      commands.add("pnpm verify:rust");
  }
  const releasable = impacted.filter(
    (entry) => entry.managed && publicKinds.has(entry.kind),
  );
  const apiClientNames = new Set(apiClients.map((entry) => entry.name));
  return {
    changedFiles,
    globalToolingImpact: global,
    directlyChanged: sorted(direct),
    authoredPackages: sorted(
      impacted
        .filter(
          (entry) =>
            entry.kind !== "generated-public-client" && entry.path !== ".",
        )
        .map((entry) => entry.name),
    ),
    internalDependents: sorted(
      [...affected].filter((name) => !direct.has(name)),
    ),
    generatedClients: sorted(generated),
    derivedArtifacts: sorted(derived),
    managedReleaseCandidates: releasable
      .map(({ name, version, ecosystem, path: location }) => ({
        name,
        version,
        ecosystem,
        path: location,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    releaseOrder: releaseOrder(
      releasable.map((entry) => ({
        ...entry,
        dependencies:
          api && apiClientNames.has(entry.name)
            ? [...entry.dependencies, "@iracing-data/api-schema"]
            : entry.dependencies,
      })),
    ),
    generationCommands: sorted(
      [...commands].filter((command) => !command.startsWith("pnpm verify")),
    ),
    verificationCommands: sorted(
      [...commands].filter((command) => command.startsWith("pnpm verify")),
    ),
    readiness: {
      status: "requires-maintainer-review",
      checks: [
        "Choose release packages and versions; affected candidates are not automatic releases.",
        "Run reported generation and verification commands; this report does not execute them.",
        "Review generated diffs and package presentation.",
        "Confirm mainline CI, unpublished versions, immutable tags, and registry trusted publishing before release.",
      ],
    },
  };
}

export function changedPaths(directory, base) {
  const git = (...args) =>
    execFileSync("git", args, { cwd: directory, encoding: "utf8" });
  const commit = git(
    "rev-parse",
    "--verify",
    "--end-of-options",
    `${base}^{commit}`,
  ).trim();
  const mergeBase = git("merge-base", commit, "HEAD").trim();
  // Working tree comparison includes committed, staged, unstaged, deleted and
  // both sides of renames. NUL delimiters preserve unusual filenames.
  return sorted(
    [
      ...git(
        "diff",
        "--name-only",
        "--no-renames",
        "-z",
        mergeBase,
        "--",
      ).split("\0"),
      ...git("ls-files", "--others", "--exclude-standard", "-z").split("\0"),
    ].filter(Boolean),
  );
}

export function parseArgs(args) {
  let base;
  let json = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--base" && args[i + 1] && !args[i + 1].startsWith("--"))
      base = args[++i];
    else if (args[i] === "--json") json = true;
    else throw new Error("Usage: pnpm impact --base <ref> [--json]");
  }
  if (!base) throw new Error("Usage: pnpm impact --base <ref> [--json]");
  return { base, json };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const { base, json } = parseArgs(process.argv.slice(2));
    const report = {
      base,
      ...analyzeImpact(changedPaths(root, base), loadWorkspaces(root)),
    };
    if (json) console.info(JSON.stringify(report, null, 2));
    else {
      console.info(
        `Impact since merge-base with ${base} (including local changes)`,
      );
      for (const [key, value] of Object.entries(report))
        console.info(
          `${key}: ${typeof value === "object" ? JSON.stringify(value, null, 2) : value}`,
        );
    }
  } catch (error) {
    console.error(`Impact analysis failed: ${error.message}`);
    process.exitCode = 1;
  }
}
