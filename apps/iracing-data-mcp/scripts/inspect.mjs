import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// pnpm filters run in the package directory. Keep both Inspector modes rooted
// at the repository so relative IRACING_CREDENTIALS values retain their meaning.
const root = new URL("../../../", import.meta.url);
const binary = (name) =>
  fileURLToPath(new URL(`../node_modules/.bin/${name}`, import.meta.url));
const server = "apps/iracing-data-mcp/dist/main.js";
const mode = process.argv[2];
if (!["stdio", "http"].includes(mode)) {
  throw new Error("Expected Inspector transport: stdio or http.");
}
const result =
  mode === "stdio"
    ? spawnSync(binary("mcp-inspector"), ["node", server, "serve"], {
        cwd: root,
        stdio: "inherit",
        shell: process.platform === "win32",
      })
    : spawnSync(
        binary("concurrently"),
        [
          "-k",
          `node ${server} serve --transport http`,
          `"${binary("mcp-inspector")}" --transport http --server-url http://127.0.0.1:3000/mcp`,
        ],
        { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
      );
if (result.error) {
  console.error(result.error);
}
process.exitCode = result.status ?? 1;
