import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { assertSafeDockerLogs } from "./logs.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));

const root = path.resolve(directory, "../../../..");

const require = createRequire(path.resolve(directory, "../../package.json"));

const { Client, StreamableHTTPClientTransport } = await import(
  require.resolve("@modelcontextprotocol/client")
);

const { writeOAuthTokenDocument } = await import(
  require.resolve("@iracing-data/oauth-client")
);

const scratch = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-recovery-"));

const sha = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: root,
  encoding: "utf8",
}).trim();

const image = `iracing-data-mcp:${sha}`;

const uid = process.getuid?.();

const gid = process.getgid?.();

const owners = new Set();

const containers = new Set();

const volumes = new Set();

const epoch = Date.UTC(2030, 0, 1);

let assertions = 0;

function docker(...args) {
  return execFileSync("docker", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 10 * 1024 * 1024,
  }).trim();
}

function request(url, init = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: init.method ?? "GET",
        headers: {
          ...Object.fromEntries(new Headers(init.headers)),
          Host: "127.0.0.1:3000",
        },
        signal: init.signal,
      },
      (res) => {
        const chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve(
            new Response(
              res.statusCode === 204 ? null : Buffer.concat(chunks),
              { status: res.statusCode, headers: res.headers },
            ),
          ),
        );
      },
    );

    req.on("error", reject);
    req.end(init.body);
  });
}

async function until(operation) {
  let last;

  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const value = await operation();

      if (value) {
        return value;
      }
    } catch (error) {
      last = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Bounded Docker fixture readiness failed", { cause: last });
}

const jwt = (expired = false) =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp: Math.floor(epoch / 1000) + (expired ? -1 : 600) })).toString("base64url")}.SYNTHETIC_SECRET`;

const token = (index = 0, expired = true) => ({
  access_token: jwt(expired),
  refresh_token: `SYNTHETIC_REFRESH_${index}`,
  token_type: "Bearer",
  expires_in: 600,
  scope: "iracing.auth",
});

async function dataDirectory(name) {
  const target = path.join(scratch, name);

  await fs.mkdir(target, { mode: 0o700 });

  return target;
}

const credential = (data) => path.join(data, "credentials.json");

const write = (data, value) =>
  writeOAuthTokenDocument(credential(data), value, {
    overwrite: true,
    durability: "required",
  });

const read = async (data) =>
  JSON.parse(await fs.readFile(credential(data), "utf8"));

async function start(source, env = {}, volume = false, harness = true) {
  assert.ok(
    !owners.has(source),
    "Only one process may own a credential source; stop/drain before reuse",
  );
  const args = [
    "run",
    "-d",
    "--read-only",
    "--user",
    `${uid}:${gid}`,
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges:true",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,nodev,size=16m",
    "--publish",
    "127.0.0.1::3000",
    "--mount",
    `type=${volume ? "volume" : "bind"},src=${source},dst=/var/lib/iracing-data-mcp`,
    "-e",
    "IRACING_MCP_CLIENT_ID=synthetic-client",
  ];

  if (harness) {
    args.push(
      "--publish",
      "127.0.0.1::3001",
      "--mount",
      `type=bind,src=${directory},dst=/tests,readonly`,
      "--entrypoint",
      "node",
    );
  }

  for (const [key, value] of Object.entries(env)) {
    args.push("-e", `${key}=${value}`);
  }

  args.push(image);
  if (harness) {
    args.push("/tests/container-harness.mjs");
  }

  const id = docker(...args);

  containers.add(id);
  owners.add(source);
  const app = {
    id,
    source,
    base: `http://127.0.0.1:${docker("port", id, "3000/tcp").split(":").at(-1)}`,
  };

  app.health = async () => (await request(`${app.base}/healthz`)).json();
  if (harness) {
    app.state = async () =>
      (
        await request(
          `http://127.0.0.1:${docker("port", id, "3001/tcp").split(":").at(-1)}/state`,
        )
      ).json();
  }

  await until(async () => (await app.health()).live);
  const client = new Client(
    { name: "docker-recovery", version: "1" },
    { supportedProtocolVersions: ["2025-11-25"] },
  );

  await client.connect(
    new StreamableHTTPClientTransport(new URL(`${app.base}/mcp`), {
      fetch: request,
    }),
  );
  app.client = client;
  app.call = () => client.callTool({ name: "get_my_driver", arguments: {} });

  return app;
}

function logsAreSafe(app) {
  return assertSafeDockerLogs(
    spawnSync("docker", ["logs", app.id], { cwd: root, encoding: "utf8" }),
  );
}

async function stop(app) {
  await app.client.close();
  docker("stop", "--time", "12", app.id);
  logsAreSafe(app);
  owners.delete(app.source);
  assert.equal(
    JSON.parse(docker("inspect", app.id))[0].State.ExitCode,
    0,
    "Graceful stop must exit without SIGKILL",
  );
  docker("rm", app.id);
  containers.delete(app.id);
}

async function checkUnauthenticated(app) {
  assert.equal((await app.health()).auth_state, "authorization_required");
  assert.equal((await app.client.listTools()).tools.length, 8);
  const result = await app.call();

  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.error.code, "AUTHORIZATION_REQUIRED");
  assert.doesNotMatch(
    JSON.stringify(result),
    /SYNTHETIC_SECRET|SYNTHETIC_REFRESH/,
  );
  assertions++;
}

async function productionSecurity() {
  const data = await dataDirectory("production-missing");

  const app = await start(data, {}, false, false);

  await checkUnauthenticated(app);
  const inspected = JSON.parse(docker("inspect", app.id))[0];

  assert.equal(inspected.Config.User, `${uid}:${gid}`);
  assert.equal(inspected.HostConfig.ReadonlyRootfs, true);
  assert.deepEqual(inspected.HostConfig.CapDrop, ["ALL"]);
  assert.ok(
    inspected.HostConfig.SecurityOpt.includes("no-new-privileges:true"),
  );
  assert.equal(
    inspected.HostConfig.PortBindings["3000/tcp"][0].HostIp,
    "127.0.0.1",
  );
  assert.equal(inspected.Mounts.length, 1);
  assert.equal(inspected.Mounts[0].Destination, "/var/lib/iracing-data-mcp");
  docker(
    "exec",
    app.id,
    "node",
    "-e",
    "const fs=require('node:fs');const dir=fs.statSync('/var/lib/iracing-data-mcp');if(process.getuid()===0||process.getgid()===0||(dir.mode&511)!==448||dir.uid!==process.getuid())process.exit(1);for(const p of ['/app/src','/app/test','/usr/local/bin/npm','/usr/local/bin/corepack','/var/run/docker.sock'])if(fs.existsSync(p))process.exit(1);try{fs.writeFileSync('/app/forbidden','x');process.exit(1)}catch(e){if(e.code!=='EROFS')process.exit(1)}",
  );
  await stop(app);
  assertions++;
}

async function recoveryAndRotation() {
  const data = await dataDirectory("rotation");

  await write(data, token());
  const before = await fs.stat(credential(data));

  let app = await start(data);

  await assert.rejects(start(data), /Only one process/);
  const results = await Promise.all(
    Array.from({ length: 8 }, () => app.call()),
  );

  assert.ok(
    results.every(
      (result) =>
        result.isError !== true && result.structuredContent.cust_id === 7,
    ),
  );
  assert.deepEqual((await app.state()).grants, [0]);
  assert.equal((await app.state()).unexpected, 0);
  assert.equal((await read(data)).refresh_token, "SYNTHETIC_REFRESH_1");
  const after = await fs.stat(credential(data));

  assert.notEqual(
    after.ino,
    before.ino,
    "Bind-directory replacement must publish atomically",
  );
  assert.equal(after.mode & 0o777, 0o600);
  await stop(app);
  app = await start(data, {
    HARNESS_EXPECTED_REFRESH: "1",
    HARNESS_CLOCK_OFFSET: "700000",
  });
  const restarted = await Promise.all(
    Array.from({ length: 8 }, () => app.call()),
  );

  assert.ok(restarted.every((result) => result.isError !== true));
  assert.deepEqual((await app.state()).grants, [1]);
  assert.equal((await read(data)).refresh_token, "SYNTHETIC_REFRESH_2");
  await stop(app);

  // Stopped host login replaces credentials through the same writer; no real grant/browser.
  await write(data, token(0, false));
  app = await start(data);
  assert.equal((await app.call()).isError, undefined);
  assert.deepEqual((await app.state()).grants, []);
  await stop(app);
  await fs.unlink(credential(data));
  app = await start(data);
  await checkUnauthenticated(app);

  // Hot replacement is deliberately unsupported and must not clear terminal state.
  await write(data, token(0, false));
  await checkUnauthenticated(app);
  assert.deepEqual((await app.state()).grants, []);
  await stop(app);
  app = await start(data);
  assert.equal((await app.call()).isError, undefined);
  await stop(app);
  assertions++;
}

async function invalidCredentials() {
  for (const mode of ["corrupt", "unsafe_mode"]) {
    const data = await dataDirectory(mode);

    await write(data, token());
    if (mode === "corrupt") {
      await fs.writeFile(credential(data), "{SYNTHETIC_SECRET");
    } else {
      await fs.chmod(credential(data), 0o644);
    }

    const app = await start(data);

    await checkUnauthenticated(app);
    assert.deepEqual((await app.state()).grants, []);
    await stop(app);
  }
}

async function persistenceFaults() {
  for (const fault of ["write", "file_fsync", "rename", "directory_fsync"]) {
    const data = await dataDirectory(fault);

    await write(data, token());
    const app = await start(data, { HARNESS_FILESYSTEM_FAULT: fault });

    const result = await app.call();

    assert.equal(result.isError, true);
    assert.equal(result.structuredContent.error.reason, "persistence_failed");
    await checkUnauthenticated(app);
    const state = await app.state();

    assert.deepEqual(state.grants, [0]);
    assert.equal(state.faultCount, 1);
    await assert.rejects(fs.stat(credential(data)), { code: "ENOENT" });
    assert.deepEqual(
      (await fs.readdir(data)).filter((file) => file.endsWith(".tmp")),
      [],
    );
    await stop(app);
    assertions++;
  }
}

function initializeNamedVolume(volume) {
  docker(
    "run",
    "--rm",
    "--network",
    "none",
    "--user",
    "0:0",
    "--cap-drop",
    "ALL",
    "--cap-add",
    "CHOWN",
    "--cap-add",
    "FOWNER",
    "--security-opt",
    "no-new-privileges:true",
    "--mount",
    `type=volume,src=${volume},dst=/var/lib/iracing-data-mcp`,
    "--entrypoint",
    "sh",
    image,
    "-c",
    'chown "$1:$2" /var/lib/iracing-data-mcp && chmod 700 /var/lib/iracing-data-mcp',
    "sh",
    String(uid),
    String(gid),
  );
}

function importStoppedVolume(volume, staging) {
  const importArgs = [
    "run",
    "--rm",
    "--network",
    "none",
    "--read-only",
    "--user",
    `${uid}:${gid}`,
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges:true",
    "--mount",
    `type=bind,src=${staging},dst=/import,readonly`,
    "--mount",
    `type=volume,src=${volume},dst=/var/lib/iracing-data-mcp`,
    "--entrypoint",
    "node",
  ];

  assert.throws(() =>
    docker(
      ...importArgs,
      image,
      "dist/import-main.js",
      "/import/credentials.json",
    ),
  );
  docker(
    ...importArgs,
    "-e",
    "IRACING_MCP_OWNER_STOPPED=yes",
    image,
    "dist/import-main.js",
    "/import/credentials.json",
  );
}

async function namedVolumeImport() {
  const volume = `mcp-recovery-${randomUUID()}`;

  volumes.add(volume);
  docker("volume", "create", volume);
  initializeNamedVolume(volume);
  const staging = await dataDirectory("staging");

  await write(staging, token());
  importStoppedVolume(volume, staging);
  await fs.unlink(credential(staging)); // Transfer ownership: never leave two refreshing copies.
  let app = await start(volume, {}, true);

  assert.equal((await app.call()).isError, undefined);
  assert.deepEqual((await app.state()).grants, [0]);
  docker(
    "exec",
    app.id,
    "node",
    "-e",
    "const fs=require('node:fs');const f=fs.statSync('/var/lib/iracing-data-mcp/credentials.json');if((f.mode&511)!==384||f.uid!==process.getuid())process.exit(1)",
  );
  await stop(app);
  app = await start(
    volume,
    { HARNESS_EXPECTED_REFRESH: "1", HARNESS_CLOCK_OFFSET: "700000" },
    true,
  );
  assert.equal((await app.call()).isError, undefined);
  assert.deepEqual((await app.state()).grants, [1]);
  await stop(app);
  docker(
    "run",
    "--rm",
    "--network",
    "none",
    "--read-only",
    "--user",
    `${uid}:${gid}`,
    "--cap-drop",
    "ALL",
    "--mount",
    `type=volume,src=${volume},dst=/var/lib/iracing-data-mcp`,
    "--entrypoint",
    "node",
    image,
    "-e",
    "require('node:fs').unlinkSync('/var/lib/iracing-data-mcp/credentials.json')",
  );
  app = await start(volume, {}, true);
  await checkUnauthenticated(app);
  await stop(app);
  docker("volume", "rm", volume);
  volumes.delete(volume);
  assertions++;
}

async function ambiguousRefresh() {
  const data = await dataDirectory("disconnect");

  await write(data, token());
  const app = await start(data, { HARNESS_GRANT_MODE: "disconnect" });

  const result = await app.call();

  assert.equal(result.structuredContent.error.reason, "rotation_uncertain");
  await checkUnauthenticated(app);
  assert.deepEqual((await app.state()).grants, [0]);
  await assert.rejects(fs.stat(credential(data)), { code: "ENOENT" });
  await stop(app);
  assertions++;
}

async function heldRefreshShutdown() {
  const data = await dataDirectory("held-shutdown");

  await write(data, token());
  const app = await start(data, { HARNESS_GRANT_MODE: "hold" });

  const pending = app.call().catch(() => undefined);

  await until(async () => (await app.state()).grants.length === 1);
  docker("stop", "--time", "12", app.id);
  await pending;
  await app.client.close();
  owners.delete(app.source);
  const logs = logsAreSafe(app);

  assert.match(logs, /"operation":"shutdown"/);
  assert.match(logs, /"error_code":"TOKEN_REFRESH_FAILED"/);
  const inspected = JSON.parse(docker("inspect", app.id))[0];

  assert.equal(
    inspected.State.ExitCode,
    0,
    "SIGTERM during consumed refresh must drain without SIGKILL",
  );
  await assert.rejects(
    fs.stat(credential(data)),
    { code: "ENOENT" },
    "Uncertain consumed refresh must not survive stopped shutdown",
  );
  docker("rm", app.id);
  containers.delete(app.id);
  const restarted = await start(data);

  await checkUnauthenticated(restarted);
  assert.deepEqual((await restarted.state()).grants, []);
  await stop(restarted);
  assertions++;
}

async function secretLayers(marker) {
  const saved = path.join(scratch, "image.tar");

  docker("save", "--output", saved, image);
  const entries = execFileSync("tar", ["-tf", saved], { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter((entry) => !entry.endsWith("/"));

  for (const entry of entries) {
    let bytes = execFileSync("tar", ["-xOf", saved, entry], {
      maxBuffer: 300 * 1024 * 1024,
    });

    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      bytes = gunzipSync(bytes);
    }

    assert.equal(
      bytes.includes(Buffer.from(marker)),
      false,
      "Excluded secret sentinel must not enter any saved image layer or config",
    );
  }

  await fs.unlink(saved);
  assertions++;
}

const sentinel = path.join(root, `.env.mcp-recovery-${randomUUID()}`);

try {
  assert.ok(
    uid > 0 && gid > 0,
    "Docker recovery requires an explicit nonzero POSIX host UID/GID",
  );
  docker("version", "--format", "{{.Server.Version}}");
  const marker = randomUUID();

  await fs.writeFile(sentinel, marker, { mode: 0o600 });
  console.info(
    "[docker-recovery] build immutable production image (dependency/image downloads may occur)",
  );
  docker("build", "-f", "apps/iracing-data-mcp/Dockerfile", "-t", image, ".");
  await fs.unlink(sentinel);
  await secretLayers(marker);
  for (const [name, scenario] of Object.entries({
    productionSecurity,
    recoveryAndRotation,
    invalidCredentials,
    persistenceFaults,
    namedVolumeImport,
    ambiguousRefresh,
    heldRefreshShutdown,
  })) {
    if (
      process.env.MCP_DOCKER_SCENARIO &&
      process.env.MCP_DOCKER_SCENARIO !== name
    ) {
      continue;
    }

    console.info(`[docker-recovery] ${name}`);
    await scenario();
  }

  console.info(
    `[docker-recovery] ${assertions} acceptance groups passed; ${docker("image", "inspect", image, "--format", "{{.Os}}/{{.Architecture}}")}, Node ${docker("run", "--rm", "--network", "none", "--entrypoint", "node", image, "--version")}, Docker ${docker("version", "--format", "{{.Server.Version}}")} on ${process.platform}/${process.arch}; synthetic credentials only.`,
  );
} finally {
  for (const id of containers) {
    try {
      docker("rm", "-f", id);
    } catch {
      /* Best effort after assertion failure. */
    }
  }

  for (const volume of volumes) {
    try {
      docker("volume", "rm", volume);
    } catch {
      /* Best effort after assertion failure. */
    }
  }

  await fs.rm(sentinel, { force: true });
  await fs.rm(scratch, { recursive: true, force: true });
}
