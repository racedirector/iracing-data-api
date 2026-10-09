import { spawn } from "node:child_process";
import { chmod, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const composeArguments = [
  "compose",
  "--env-file",
  ".env",
  "-f",
  "apps/iracing-data-mcp/compose.yaml",
];
const stagingDirectory = path.join(
  repositoryRoot,
  ".iracing-data",
  "iracing-data-mcp",
);
const credentialsFile = path.join(stagingDirectory, "credentials.json");
const cliFile = path.join(
  repositoryRoot,
  "apps",
  "iracing-data-cli",
  "dist",
  "index.js",
);
const containerSecretFile = "/var/lib/iracing-data-mcp/client-secret";

function dockerEnvironment() {
  const environment = { ...process.env };
  const clientSecret = process.env.IRACING_AUTH_SECRET?.trim();

  delete environment.IRACING_AUTH_SECRET;
  environment.IRACING_MCP_CLIENT_SECRET_FILE = clientSecret
    ? containerSecretFile
    : "";

  return environment;
}

function run(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: repositoryRoot,
      env: options.env ?? process.env,
      stdio: [options.input === undefined ? "inherit" : "pipe", "inherit", "inherit"],
    });

    if (options.input !== undefined) {
      child.stdin.end(options.input);
    }

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0 || options.allowFailure) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${executable} exited with ${code ?? `signal ${signal ?? "unknown"}`}`,
        ),
      );
    });
  });
}

function compose(args, options = {}) {
  return run("docker", [...composeArguments, ...args], {
    ...options,
    env: dockerEnvironment(),
  });
}

function composeInput(service, input) {
  return compose(["run", "--rm", "-T", service], { input });
}

async function ensureStagingDirectory() {
  await mkdir(stagingDirectory, { recursive: true, mode: 0o700 });

  if (process.platform !== "win32") {
    await chmod(stagingDirectory, 0o700);
  }
}

async function waitForHealth() {
  let lastError;

  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch("http://127.0.0.1:3000/healthz");

      if (response.ok) {
        const health = await response.json();

        console.log(`MCP is live (${health.auth_state ?? "unknown auth state"}).`);
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error("MCP health check failed.", { cause: lastError });
}

async function login() {
  await compose(["stop", "mcp"], { allowFailure: true });
  await ensureStagingDirectory();

  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

  await run(pnpm, ["--filter", "@iracing-data/cli...", "build"]);
  await run(process.execPath, [
    cliFile,
    "auth",
    "login",
    "--scope",
    "iracing.auth",
    "--credentials",
    credentialsFile,
  ]);

  await compose(["build", "mcp"]);
  await compose(["run", "--rm", "mcp-init"]);
  await composeInput("mcp-import", await readFile(credentialsFile, "utf8"));

  const clientSecret = process.env.IRACING_AUTH_SECRET?.trim();

  if (clientSecret) {
    await composeInput("mcp-secret-import", clientSecret);
  }

  await rm(credentialsFile, { force: true });
  await compose(["up", "-d", "mcp"]);
  await waitForHealth();
}

async function up() {
  await compose(["up", "-d", "--build", "mcp"]);
  await waitForHealth();
}

async function stop() {
  await compose(["stop", "mcp"]);
}

async function reset() {
  await compose(["down", "-v"]);
  await rm(credentialsFile, { force: true });
}

async function status() {
  await compose(["ps"]);
}

async function main() {
  switch (process.argv[2]) {
    case "login":
      await login();
      break;
    case "up":
      await up();
      break;
    case "stop":
      await stop();
      break;
    case "reset":
      await reset();
      break;
    case "status":
      await status();
      break;
    default:
      console.error(
        "Usage: pnpm mcp:local <login|up|stop|reset|status>",
      );
      process.exitCode = 2;
  }
}

void main().catch(() => {
  console.error(
    "Local MCP command failed. Review the preceding Docker/CLI output and keep the MCP stopped before repairing credentials.",
  );
  process.exitCode = 1;
});
