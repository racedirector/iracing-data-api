import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const envFile = path.join(repositoryRoot, ".env");
const envExampleFile = path.join(repositoryRoot, ".env.example");
const packageFile = path.join(repositoryRoot, "package.json");
const stagingCredentialFile = path.join(
  repositoryRoot,
  ".iracing-data",
  "iracing-data-mcp",
  "credentials.json",
);

function runCommand(executable, args) {
  try {
    return {
      ok: true,
      output: execFileSync(executable, args, {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim(),
    };
  } catch (error) {
    return {
      ok: false,
      reason: error?.code === "ENOENT" ? "not_found" : "command_failed",
    };
  }
}

function parseEnv(file) {
  const values = new Map();

  if (!existsSync(file)) return values;

  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = rawLine.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match) continue;

    let value = match[2] ?? "";

    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    values.set(match[1], value);
  }

  return values;
}

function configured(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function check(id, status, detail) {
  return { id, status, detail };
}

const packageJson = JSON.parse(readFileSync(packageFile, "utf8"));
const expectedNode = readFileSync(path.join(repositoryRoot, ".nvmrc"), "utf8").trim();
const expectedNodeMajor = expectedNode.split(".")[0];
const currentNodeMajor = process.versions.node.split(".")[0];
const expectedPnpm = /^pnpm@([^+]+)/.exec(packageJson.packageManager ?? "")?.[1];
const pnpmExecutable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const pnpm = runCommand(pnpmExecutable, ["--version"]);
const dockerCli = runCommand("docker", ["--version"]);
const dockerCompose = dockerCli.ok
  ? runCommand("docker", ["compose", "version", "--short"])
  : { ok: false, reason: "docker_unavailable" };
const dockerDaemon = dockerCli.ok
  ? runCommand("docker", ["version", "--format", "{{.Server.Version}}"])
  : { ok: false, reason: "docker_unavailable" };
const env = parseEnv(envFile);
const exampleEnv = parseEnv(envExampleFile);
const envExists = existsSync(envFile);
const clientConfigured = configured(env.get("IRACING_AUTH_CLIENT"));
const expectedRedirect = exampleEnv.get("IRACING_AUTH_REDIRECT_URI");
const redirectMatches =
  configured(expectedRedirect) &&
  env.get("IRACING_AUTH_REDIRECT_URI") === expectedRedirect;
const dependenciesInstalled = existsSync(path.join(repositoryRoot, "node_modules"));
const stagingCredentialsPresent = existsSync(stagingCredentialFile);
const volume = dockerDaemon.ok
  ? runCommand("docker", [
      "volume",
      "inspect",
      "iracing-data-mcp",
      "--format",
      "{{.Name}}",
    ])
  : { ok: false, reason: "docker_unavailable" };

let health = { reachable: false };

try {
  const response = await fetch("http://127.0.0.1:3000/healthz", {
    signal: AbortSignal.timeout(1000),
  });

  if (response.ok) {
    const body = await response.json();

    health = {
      reachable: true,
      live: body.live === true,
      auth_state: body.auth_state ?? "unknown",
    };
  } else {
    health = { reachable: true, status: response.status };
  }
} catch {
  health = { reachable: false };
}

const checks = [
  check(
    "node",
    currentNodeMajor === expectedNodeMajor ? "pass" : "fail",
    `current ${process.versions.node}; expected ${expectedNode}`,
  ),
  check(
    "pnpm",
    pnpm.ok && pnpm.output === expectedPnpm ? "pass" : "fail",
    pnpm.ok
      ? `current ${pnpm.output}; expected ${expectedPnpm ?? "packageManager pin"}`
      : "pnpm is not available",
  ),
  check(
    "docker_cli",
    dockerCli.ok ? "pass" : "fail",
    dockerCli.ok ? dockerCli.output : "Docker CLI is not available",
  ),
  check(
    "docker_compose",
    dockerCompose.ok ? "pass" : "fail",
    dockerCompose.ok ? dockerCompose.output : "Docker Compose is not available",
  ),
  check(
    "docker_daemon",
    dockerDaemon.ok ? "pass" : "fail",
    dockerDaemon.ok ? `server ${dockerDaemon.output}` : "Docker daemon is not reachable",
  ),
  check(
    "env_file",
    envExists ? "pass" : "fail",
    envExists ? ".env exists" : ".env is missing",
  ),
  check(
    "oauth_client",
    clientConfigured ? "pass" : "fail",
    clientConfigured
      ? "IRACING_AUTH_CLIENT is configured"
      : "IRACING_AUTH_CLIENT is missing or empty",
  ),
  check(
    "oauth_redirect",
    redirectMatches ? "pass" : "fail",
    redirectMatches
      ? "IRACING_AUTH_REDIRECT_URI matches .env.example"
      : "IRACING_AUTH_REDIRECT_URI does not match .env.example",
  ),
  check(
    "dependencies",
    dependenciesInstalled ? "pass" : "fail",
    dependenciesInstalled ? "node_modules exists" : "run pnpm install --frozen-lockfile",
  ),
  check(
    "staging_credentials",
    stagingCredentialsPresent ? "warn" : "pass",
    stagingCredentialsPresent
      ? "host staging credentials exist; understand ownership before another login"
      : "no host staging credential remains",
  ),
];

const requiredIds = new Set([
  "node",
  "pnpm",
  "docker_cli",
  "docker_compose",
  "docker_daemon",
  "env_file",
  "oauth_client",
  "oauth_redirect",
  "dependencies",
]);

const readyForLogin = checks
  .filter(({ id }) => requiredIds.has(id))
  .every(({ status }) => status === "pass");

const actions = [];

if (!envExists) actions.push("prepare_env");
if (envExists && (!clientConfigured || !redirectMatches))
  actions.push("configure_oauth_locally");
if (currentNodeMajor !== expectedNodeMajor) actions.push("activate_repository_node");
if (!pnpm.ok || pnpm.output !== expectedPnpm) actions.push("activate_pinned_pnpm");
if (!dockerDaemon.ok) actions.push("start_docker");
if (!dependenciesInstalled) actions.push("install_dependencies");
if (stagingCredentialsPresent) actions.push("review_staging_credentials");

console.info(
  JSON.stringify(
    {
      version: 1,
      platform: process.platform,
      architecture: process.arch,
      revision: runCommand("git", ["rev-parse", "--short", "HEAD"]).output ?? null,
      ready_for_login: readyForLogin,
      checks,
      observations: {
        client_secret_configured: configured(env.get("IRACING_AUTH_SECRET")),
        named_volume_present: volume.ok,
        service_health: health,
      },
      actions,
    },
    null,
    2,
  ),
);
