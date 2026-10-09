import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const envFile = path.join(repositoryRoot, ".env");
const composeFile = path.join(
  repositoryRoot,
  "apps",
  "iracing-data-mcp",
  "compose.yaml",
);

const runtimeProbe = `
const fs = require("node:fs");
const inspect = (target) => {
  if (!fs.existsSync(target)) return { exists: false };
  const stats = fs.statSync(target);
  return {
    exists: true,
    uid: stats.uid,
    gid: stats.gid,
    mode: (stats.mode & 0o777).toString(8),
    file: stats.isFile(),
    directory: stats.isDirectory(),
  };
};
process.stdout.write(JSON.stringify({
  process: { uid: process.getuid?.(), gid: process.getgid?.() },
  data: inspect("/var/lib/iracing-data-mcp"),
  credentials: inspect("/var/lib/iracing-data-mcp/credentials.json"),
  client_secret: inspect("/var/lib/iracing-data-mcp/client-secret"),
}));
`;

function failure(reason, detail) {
  console.error(JSON.stringify({ version: 1, ok: false, reason, detail }, null, 2));
  process.exitCode = 1;
}

if (!existsSync(envFile)) {
  failure("env_missing", "root .env is required before verification");
} else {
  let health;

  try {
    const response = await fetch("http://127.0.0.1:3000/healthz", {
      signal: AbortSignal.timeout(2000),
    });

    const body = response.ok ? await response.json() : {};

    health = {
      status: response.status,
      live: body.live === true,
      auth_state: body.auth_state ?? "unknown",
    };
  } catch {
    health = { status: null, live: false, auth_state: "unreachable" };
  }

  let runtime;

  try {
    const output = execFileSync(
      "docker",
      [
        "compose",
        "--env-file",
        envFile,
        "-f",
        composeFile,
        "exec",
        "-T",
        "mcp",
        "node",
        "-e",
        runtimeProbe,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    runtime = JSON.parse(output);
  } catch {
    failure("runtime_probe_failed", "the MCP container is not available for inspection");
  }

  if (runtime) {
    const processIsNonRoot = runtime.process.uid > 0 && runtime.process.gid > 0;
    const dataSecure =
      runtime.data.exists &&
      runtime.data.directory &&
      runtime.data.uid === runtime.process.uid &&
      runtime.data.mode === "700";
    const credentialsSecure =
      runtime.credentials.exists &&
      runtime.credentials.file &&
      runtime.credentials.uid === runtime.process.uid &&
      runtime.credentials.mode === "600";
    const secretSecure =
      !runtime.client_secret.exists ||
      (runtime.client_secret.file &&
        runtime.client_secret.uid === runtime.process.uid &&
        runtime.client_secret.mode === "600");
    const healthReady =
      health.status === 200 && health.live && health.auth_state === "ready";
    const checks = {
      health_ready: healthReady,
      process_non_root: processIsNonRoot,
      data_directory_secure: dataSecure,
      credentials_secure: credentialsSecure,
      optional_client_secret_secure: secretSecure,
    };
    const ok = Object.values(checks).every(Boolean);

    console.info(
      JSON.stringify(
        {
          version: 1,
          ok,
          health,
          checks,
          runtime: {
            process: runtime.process,
            data: runtime.data,
            credentials: runtime.credentials,
            client_secret: runtime.client_secret,
          },
        },
        null,
        2,
      ),
    );

    if (!ok) process.exitCode = 1;
  }
}
