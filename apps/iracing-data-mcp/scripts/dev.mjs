import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Keep build output off the MCP protocol's stdout.
const build = spawnSync("pnpm", ["build"], {
  cwd: new URL("..", import.meta.url),
  stdio: ["ignore", 2, 2],
});

if (build.error) {
  console.error(build.error);
}

if (build.error || build.status !== 0) {
  process.exit(build.status ?? 1);
}

// Match mcp:local's root-relative environment and credential paths.
const root = new URL("../../../", import.meta.url);
const envFile = new URL(".env", root);
if (existsSync(envFile)) {
  process.loadEnvFile(fileURLToPath(envFile));
}
process.chdir(fileURLToPath(root));

process.argv.splice(2, 0, "serve");
await import("../dist/main.js");
