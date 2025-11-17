import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

const NODE_TS_CONFIG = "tsconfig.build.json";
const DEFAULT_ENTRY = "src/index.ts";

function resolveEntry(cwd: string, pkg: Record<string, unknown>) {
  const candidates: string[] = [];

  if (typeof pkg.source === "string") {
    candidates.push(pkg.source);
  }

  candidates.push(DEFAULT_ENTRY, "index.ts");

  for (const candidate of candidates) {
    const entry = path.resolve(cwd, candidate);
    if (fs.existsSync(entry)) return entry;
  }

  return path.resolve(cwd, DEFAULT_ENTRY);
}

export default defineConfig((options) => {
  const cwd = options?.cwd ?? process.cwd();
  const pkgPath = path.join(cwd, "package.json");
  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(fs.readFileSync(pkgPath, "utf8"))
    : {};

  const external = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ];

  const buildOptions = pkg.buildOptions || {};
  const sourcemap =
    buildOptions.sourcemap === undefined ? false : buildOptions.sourcemap;

  return {
    sourcemap,
    entry: [resolveEntry(cwd, pkg)],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    treeshake: true,
    minify: true,
    target: "es2020",
    tsconfig: path.join(cwd, NODE_TS_CONFIG),
    splitting: false,
    outDir: "dist",
    outExtension: ({ format }) => ({
      js: format === "esm" ? ".mjs" : ".js",
    }),
    alias: fs.existsSync(path.join(cwd, "src"))
      ? {
          "@": path.join(cwd, "src"),
        }
      : undefined,
    external,
  };
});
