import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const surfaces = [
  "openapi",
  "packages/api/client/fetch",
  "packages/api/client/axios",
  "crates/iracing-data-api-client",
  "packages/oauth/client/generated",
];
const ignoredNames = new Set([
  "node_modules",
  "dist",
  "target",
  "AGENTS.md",
  "examples",
  ".git",
]);

export function filesUnder(directory, relative = "") {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      if (ignoredNames.has(entry.name) || entry.name.endsWith(".tsbuildinfo"))
        return [];
      const name = path.posix.join(relative, entry.name);
      if (entry.isSymbolicLink())
        throw new Error(`Unexpected generated-output symlink: ${name}`);
      return entry.isDirectory()
        ? filesUnder(path.join(directory, entry.name), name)
        : [name];
    })
    .sort();
}

export function diffTrees(expected, actual) {
  const names = new Set([...filesUnder(expected), ...filesUnder(actual)]);
  return [...names].sort().filter((name) => {
    const left = path.join(expected, name);
    const right = path.join(actual, name);
    return (
      !fs.existsSync(left) ||
      !fs.existsSync(right) ||
      !fs.readFileSync(left).equals(fs.readFileSync(right))
    );
  });
}

function command(executable, args, env = {}) {
  console.info(`[generated] ${executable} ${args.join(" ")}`);
  const result = spawnSync(
    executable === "pnpm" ? process.env.npm_execpath || "pnpm" : executable,
    args,
    {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, ...env },
      shell: process.platform === "win32",
    },
  );
  if (result.error || result.status !== 0)
    throw new Error(
      `Generation failed: ${args.join(" ")}${result.error ? ` (${result.error.message})` : ""}`,
    );
}

function copyGeneratorInputs(surface, destination, names) {
  fs.mkdirSync(destination, { recursive: true });
  for (const name of names) {
    const source = path.join(root, surface, name);
    if (fs.existsSync(source))
      fs.copyFileSync(source, path.join(destination, name));
  }
}

export function checkGenerated({ update = false } = {}) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "iracing-codegen-"));
  try {
    command("pnpm", [
      "--filter",
      "@iracing-data/api-schema-to-openapi...",
      "--filter",
      "@iracing-data/oauth-schema-to-openapi...",
      "build",
    ]);
    const specs = path.join(temporary, "openapi");
    for (const [cli, stem] of [
      ["iracing-api-openapi", "iracing"],
      ["iracing-oauth-api-openapi", "oauth"],
    ]) {
      for (const extension of ["json", "yaml"]) {
        command("pnpm", [
          "exec",
          cli,
          "-o",
          specs,
          "-f",
          `${stem}.${extension}`,
        ]);
      }
    }
    for (const [client, surface] of [
      ["fetch", surfaces[1]],
      ["axios", surfaces[2]],
      ["rust", surfaces[3]],
    ]) {
      const destination = path.join(temporary, surface);
      copyGeneratorInputs(surface, destination, [
        ".openapi-generator-ignore",
        ...(client === "rust"
          ? ["Cargo.toml", ".gitignore", ".travis.yml"]
          : []),
      ]);
      command(
        "sh",
        [path.join(root, "scripts", `openapi-generator-${client}.sh`)],
        {
          OPENAPI_DOC: path.join(specs, "iracing.json"),
          OUTPUT_PACKAGE: destination,
        },
      );
    }

    const oauthSurface = surfaces[4];
    const oauthDestination = path.join(temporary, oauthSurface);
    copyGeneratorInputs(oauthSurface, oauthDestination, [
      ".openapi-generator-ignore",
    ]);
    command(
      "sh",
      [path.join(root, "scripts", "openapi-generator-oauth-fetch.sh")],
      {
        OPENAPI_DOC: path.join(specs, "oauth.json"),
        OUTPUT_PACKAGE: oauthDestination,
      },
    );

    const changes = surfaces.flatMap((surface) =>
      diffTrees(path.join(root, surface), path.join(temporary, surface)).map(
        (name) => `${surface}/${name}`,
      ),
    );
    if (update) {
      for (const surface of surfaces) {
        const destination = path.join(root, surface);
        const generated = path.join(temporary, surface);
        const generatedFiles = new Set(filesUnder(generated));
        for (const name of filesUnder(destination)) {
          if (!generatedFiles.has(name))
            fs.unlinkSync(path.join(destination, name));
        }
        for (const name of generatedFiles) {
          const output = path.join(destination, name);
          fs.mkdirSync(path.dirname(output), { recursive: true });
          fs.copyFileSync(path.join(generated, name), output);
        }
      }
      console.info(
        `[generated] Updated ${changes.length} files. Review the diff before committing.`,
      );
    } else if (changes.length) {
      throw new Error(
        `Stale generated artifacts:\n${changes.join("\n")}\nRun pnpm codegen, review the diff, and commit the outputs.`,
      );
    } else {
      console.info(
        "[generated] All committed OpenAPI and client artifacts are reproducible.",
      );
    }
    return changes;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== "--write"))
      throw new Error("Usage: node scripts/check-generated.mjs [--write]");
    checkGenerated({ update: args.includes("--write") });
  } catch (error) {
    console.error(`[generated] ${error.message}`);
    process.exitCode = 1;
  }
}
