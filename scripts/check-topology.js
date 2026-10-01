import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseToml } from "smol-toml";
import ts from "typescript";
import { parse as parseYaml } from "yaml";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export function checkTopology(root = repositoryRoot, releaseName) {
  const errors = [];
  const check = (condition, message) => {
    if (!condition) errors.push(message);
  };
  const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
  const json = (file) => JSON.parse(read(file));
  const normalize = (value) => path.posix.normalize(value).replace(/\/$/, "");
  const sameSet = (actual, expected, label) => {
    check(
      new Set(actual).size === actual.length,
      `${label}: duplicate entries`,
    );
    for (const value of actual) {
      check(expected.includes(value), `${label}: unexpected ${value}`);
    }
    for (const value of expected) {
      check(actual.includes(value), `${label}: missing ${value}`);
    }
  };
  // Discover manifests independently of the configured globs so new or omitted
  // workspaces cannot silently escape publication policy.
  const files = [];
  const ignored = new Set([".git", "node_modules", "dist", "bin", "target"]);
  function walk(directory = ".") {
    for (const entry of fs.readdirSync(path.join(root, directory), {
      withFileTypes: true,
    })) {
      const file = path.posix.join(directory, entry.name);
      if (entry.isDirectory() && !ignored.has(entry.name)) walk(file);
      else if (entry.isFile()) files.push(file);
    }
  }
  walk();
  const npmPaths = files
    .filter((file) => path.basename(file) === "package.json")
    .map((file) => path.posix.dirname(file));
  const cargoPaths = files
    .filter(
      (file) => path.basename(file) === "Cargo.toml" && file !== "Cargo.toml",
    )
    .map((file) => path.posix.dirname(file));
  const policy = json("workspace-policy.json").workspaces;
  const kinds = new Set([
    "repository-root",
    "public-release-target",
    "generated-public-client",
    "internal-tool",
    "example",
  ]);
  sameSet(
    policy.map((entry) => entry.path),
    [...npmPaths, ...cargoPaths],
    "workspace policy",
  );
  for (const [ecosystem, paths] of [
    ["npm", npmPaths],
    ["cargo", cargoPaths],
  ]) {
    const entries = policy.filter((entry) => entry.ecosystem === ecosystem);
    sameSet(
      entries.map((entry) => entry.path),
      paths,
      `${ecosystem} policy coverage`,
    );
    check(
      new Set(entries.map((entry) => entry.name)).size === entries.length,
      `${ecosystem} policy: duplicate package names`,
    );
  }
  const publicEntries = policy.filter((entry) =>
    ["public-release-target", "generated-public-client"].includes(entry.kind),
  );
  sameSet(
    policy
      .filter((entry) => entry.kind === "repository-root")
      .map((e) => e.path),
    ["."],
    "repository root classification",
  );
  for (const entry of policy) {
    check(kinds.has(entry.kind), `${entry.path}: invalid classification`);
    check(
      typeof entry.owner === "string" && entry.owner.trim().length > 0,
      `${entry.path}: missing ownership area`,
    );
    check(
      entry.path === normalize(entry.path) && !entry.path.startsWith(".."),
      `${entry.path}: path must be repository-relative and normalized`,
    );
    check(
      ["npm", "cargo"].includes(entry.ecosystem),
      `${entry.path}: invalid ecosystem`,
    );
    const isPublic = publicEntries.includes(entry);
    if (entry.ecosystem === "npm" && npmPaths.includes(entry.path)) {
      const manifest = json(path.posix.join(entry.path, "package.json"));
      check(manifest.name === entry.name, `${entry.path}: package name drift`);
      check(
        isPublic ? manifest.private !== true : manifest.private === true,
        `${entry.path}: private flag disagrees with ${entry.kind}`,
      );
      if (isPublic || entry.path === ".") {
        check(manifest.license === "MIT", `${entry.path}: license must be MIT`);
      }
      for (const group of [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
      ]) {
        for (const [name, version] of Object.entries(manifest[group] ?? {})) {
          if (!version.startsWith("workspace:")) continue;
          const dependency = policy.find(
            (e) => e.ecosystem === "npm" && e.name === name,
          );
          check(
            Boolean(dependency),
            `${entry.path}: unknown workspace dependency ${name}`,
          );
          if (isPublic && group !== "devDependencies") {
            check(
              publicEntries.includes(dependency),
              `${entry.path}: public package depends on internal ${name}`,
            );
          }
        }
      }
    } else if (entry.ecosystem === "cargo" && cargoPaths.includes(entry.path)) {
      const manifest = parseToml(read(`${entry.path}/Cargo.toml`));
      check(
        manifest.package.name === entry.name,
        `${entry.path}: crate name drift`,
      );
      check(
        isPublic
          ? manifest.package.publish !== false
          : manifest.package.publish === false,
        `${entry.path}: Cargo publish flag disagrees with ${entry.kind}`,
      );
    }
  }
  if (releaseName !== undefined) {
    check(
      publicEntries.some(
        (entry) => entry.ecosystem === "npm" && entry.name === releaseName,
      ),
      `release target is not a public npm workspace: ${releaseName}`,
    );
  }
  const rootManifest = json("package.json");
  check(
    !("workspaces" in rootManifest),
    "package.json: use pnpm-workspace.yaml as the sole npm workspace list",
  );
  const patterns = parseYaml(read("pnpm-workspace.yaml")).packages;
  const matched = new Set();
  for (const pattern of patterns) {
    check(
      typeof pattern === "string" &&
        !pattern.startsWith("!") &&
        !pattern.includes("..") &&
        !path.isAbsolute(pattern),
      `workspace pattern must be a positive repository-relative glob: ${pattern}`,
    );
    const matches = fs
      .globSync(`${pattern}/package.json`, { cwd: root })
      .map((file) => normalize(path.posix.dirname(file.replaceAll("\\", "/"))));
    check(matches.length > 0, `stale workspace pattern: ${pattern}`);
    for (const match of matches) matched.add(match);
  }
  sameSet(
    [...matched],
    npmPaths.filter((p) => p !== "."),
    "pnpm workspaces",
  );
  sameSet(
    parseToml(read("Cargo.toml")).workspace.members.map(normalize),
    cargoPaths,
    "Cargo workspaces",
  );
  sameSet(
    parseToml(read("dist-workspace.toml")).workspace.members.map((member) => {
      const [ecosystem, directory] = member.split(":");
      return `${ecosystem}:${normalize(directory)}`;
    }),
    publicEntries.map((entry) => `${entry.ecosystem}:${entry.path}`),
    "managed release set",
  );
  const configs = new Map();
  for (const file of files.filter((f) =>
    /^tsconfig(?:\..+)?\.json$/.test(path.basename(f)),
  )) {
    const parsed = ts.parseConfigFileTextToJson(file, read(file));
    check(!parsed.error, `${file}: invalid TypeScript configuration`);
    if (parsed.error) continue;
    configs.set(file, parsed.config);
    for (const reference of parsed.config.references ?? []) {
      const target = normalize(
        path.posix.join(path.posix.dirname(file), reference.path),
      );
      const config = target.endsWith(".json")
        ? target
        : `${target}/tsconfig.json`;
      check(
        files.includes(config),
        `${file}: stale TypeScript reference ${reference.path}`,
      );
    }
  }
  sameSet(
    (configs.get("tsconfig.json").references ?? []).map((ref) =>
      normalize(ref.path),
    ),
    npmPaths.filter((p) => p !== "."),
    "root TypeScript references",
  );
  return errors.sort();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== "--release")) {
      throw new Error("Usage: check-topology.js [--release <package-name>]");
    }
    const errors = checkTopology(repositoryRoot, args[1]);
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    } else {
      console.info("Workspace topology and publication policy are consistent.");
    }
  } catch (error) {
    console.error(`Topology check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
