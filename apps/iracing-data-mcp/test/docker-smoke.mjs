import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, chmod, writeFile, rm } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { ...options }, (res) => {
      const chunks = [];

      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () =>
        resolve(
          new Response(Buffer.concat(chunks), { status: res.statusCode }),
        ),
      );
    });

    req.on("error", reject);
    req.end(options.body);
  });
}

const docker = (...args) =>
  execFileSync("docker", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();

const sha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();

const image = `iracing-data-mcp:git-${sha}`;

const directory = await mkdtemp(path.join(os.tmpdir(), "mcp-docker-smoke-"));

let container;

try {
  assert.ok(process.getuid() > 0 && process.getgid() > 0);
  await chmod(directory, 0o700);
  const jwt = `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.synthetic`;

  await writeFile(
    path.join(directory, "credentials.json"),
    JSON.stringify({
      access_token: jwt,
      refresh_token: "synthetic-offline",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "iracing.auth",
    }),
    { mode: 0o600 },
  );
  docker("build", "-f", "apps/iracing-data-mcp/Dockerfile", "-t", image, ".");
  container = docker(
    "run",
    "-d",
    "--read-only",
    "--user",
    `${process.getuid()}:${process.getgid()}`,
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges:true",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,nodev,size=16m",
    "--publish",
    "127.0.0.1::3000",
    "--mount",
    `type=bind,src=${directory},dst=/var/lib/iracing-data-mcp`,
    "-e",
    "IRACING_MCP_CLIENT_ID=synthetic-client",
    "-e",
    "IRACING_MCP_ALLOWED_HOSTS=localhost:4321",
    "-e",
    "IRACING_MCP_ALLOWED_ORIGINS=http://localhost:4321",
    image,
  );
  const port = docker("port", container, "3000/tcp").split(":").at(-1);

  const base = `http://127.0.0.1:${port}`;

  let response;

  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      response = await request(`${base}/healthz`, {
        headers: { Host: "localhost:4321" },
      });
    } catch {
      /* bounded startup polling */
    }

    if (response?.ok) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  assert.equal(response?.status, 200);
  assert.equal((await response.json()).auth_state, "ready");
  const initialized = await request(`${base}/mcp`, {
    method: "POST",
    headers: {
      Host: "localhost:4321",
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "offline-smoke", version: "1" },
      },
    }),
  });

  assert.equal(initialized.status, 200);
  assert.ok((await initialized.json()).result.serverInfo);
  assert.equal(
    (await request(`${base}/healthz`, { headers: { Host: "evil.example" } }))
      .status,
    403,
  );
  const inspect = JSON.parse(docker("inspect", container))[0];

  docker("exec", container, ...inspect.Config.Healthcheck.Test.slice(1));
  docker(
    "exec",
    container,
    "node",
    "-e",
    "const fs=require('node:fs');for(const p of ['/app/src','/app/test','/app/node_modules/@iracing-data/api-client-fetch/src','/usr/local/bin/npm','/usr/local/bin/corepack'])if(fs.existsSync(p))process.exit(1)",
  );
  assert.equal(inspect.HostConfig.ReadonlyRootfs, true);
  assert.deepEqual(inspect.HostConfig.CapDrop, ["ALL"]);
  assert.ok(inspect.HostConfig.SecurityOpt.includes("no-new-privileges:true"));
  assert.equal(
    inspect.HostConfig.PortBindings["3000/tcp"][0].HostIp,
    "127.0.0.1",
  );
  assert.equal(inspect.Mounts.length, 1);
  console.info(
    `Offline Docker build/health/initialize passed: ${docker("image", "inspect", image, "--format", "{{.Os}}/{{.Architecture}}")}; Docker ${docker("version", "--format", "{{.Server.Version}}")} on ${process.platform}/${process.arch}. Synthetic credentials only.`,
  );
  docker("stop", "--time", "15", container);
  const stopped = JSON.parse(docker("inspect", container))[0].State;

  assert.equal(
    stopped.ExitCode,
    0,
    "production server must drain and exit cleanly",
  );
  assert.equal(stopped.OOMKilled, false);
} finally {
  if (container) {
    docker("rm", "-f", container);
  }

  await rm(directory, { recursive: true, force: true });
}
