# Local Docker MCP

This private app runs one local credential owner at `http://127.0.0.1:3000/mcp`.
Health and MCP initialize/listing remain usable when credentials are missing or
corrupt; authenticated tools require stopped host reauthentication. The service
uses the shared OAuth session and bounded HTTP shutdown. No browser callback runs
inside Docker. Local processes can access MCP; do not expose its port remotely.

From the repository root, build the CLI and log in on the host with the **same
registered client ID** used by MCP. The CLI's registered loopback redirect URI is
for host login only. Set its normal `IRACING_AUTH_CLIENT` and
`IRACING_AUTH_REDIRECT_URI` configuration. If that client requires a secret,
configure the CLI privately, then put the same secret in a 0600 file inside the
MCP data directory. Never put secrets in Docker environment values, command-line
flags, build arguments, image layers, or diagnostic dumps.

Use the repository Node version in `.nvmrc` and pinned pnpm from `packageManager`,
then install frozen dependencies before building. Explicitly export the nonsecret
client ID below: the CLI can load `.env` privately, but that does not set the
parent shell variable used by Compose. Do not source a secret-bearing `.env`
wholesale. Keep the redirect URI and any CLI secret in its normal private
configuration.

```sh
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/cli...' build
export IRACING_AUTH_CLIENT='<registered-client-id>'
export IRACING_MCP_DATA_DIR="$PWD/.iracing-data/iracing-data-mcp"
mkdir -p "$IRACING_MCP_DATA_DIR"
chmod 700 "$IRACING_MCP_DATA_DIR"
pnpm iracing-data auth login --scope iracing.auth --credentials "$IRACING_MCP_DATA_DIR/credentials.json"
export IRACING_MCP_CLIENT_ID="$IRACING_AUTH_CLIENT"
export IRACING_MCP_UID="$(id -u)" IRACING_MCP_GID="$(id -g)"
export IRACING_MCP_IMAGE_TAG="git-$(git rev-parse HEAD)"
docker compose -f apps/iracing-data-mcp/compose.yaml build
docker compose -f apps/iracing-data-mcp/compose.yaml up -d
curl --fail http://127.0.0.1:3000/healthz
```

Both UID and GID must be nonzero. The entire data directory is mounted at
`/var/lib/iracing-data-mcp` so atomic token replacement and directory fsync work.
The directory must belong to that UID with mode 0700, and credentials must be 0600. Ownership/modes are checked, never bypassed. Host chmod/chown must be
performed while stopped. Configure an optional secret by setting
`IRACING_MCP_CLIENT_SECRET_FILE=/var/lib/iracing-data-mcp/client-secret`; ensure
that file is owned by the mapped UID, mode 0600, and contains only the same
client's secret. Wrong-client credentials require new host login with the
configured client ID; the server never tries another client.

Compose publishes only 127.0.0.1:3000, uses a read-only root filesystem, a small
/tmp tmpfs and the data mount, drops all capabilities and forbids new privileges.
It mounts no Docker socket. The runtime is digest-pinned Node 24 slim (tested Node 24.21.0), without build tools or
dev dependencies. Builds use the root context and frozen pnpm lockfile. Local
images use the git SHA tag; no registry publication or npm release is included.

`IRACING_MCP_ALLOWED_HOSTS` and `IRACING_MCP_ALLOWED_ORIGINS` accept comma-separated
**exact** authorities/origins; defaults allow localhost and 127.0.0.1 on port 3000.
For example, a local client sending a different Origin must explicitly configure
that exact loopback `http://` origin and its matching Host authority. Only `localhost` and `127.0.0.1` HTTP authorities are supported, including
custom ports. Wildcards, non-loopback names, HTTPS, unpaired origins, credentials,
paths, query strings, whitespace and `null` origins are rejected. Requests without Origin are
accepted after Host validation. Keep the loopback port binding unchanged.

## Connect a local MCP client

After the container starts, register it with Codex on the same host:

```sh
codex mcp add iracing-data --url http://127.0.0.1:3000/mcp
```

The syntax was checked against Codex CLI 0.160.0; no native desktop UI or live
account connection is claimed. Use no MCP bearer token or MCP OAuth login: iRacing
authorization belongs to the mounted credential document. See the [tool guide](README.md)
for eight tools, six workflows, protocol evidence and result/recovery semantics.

## Stop, repair, restart, logout

Before every login/re-login, import, logout, permission repair or file replacement:

```sh
docker compose -f apps/iracing-data-mcp/compose.yaml stop
# Wait for stop to complete (15 seconds grace; HTTP drain is bounded at 10 seconds).
pnpm iracing-data auth login --scope iracing.auth --credentials "$IRACING_MCP_DATA_DIR/credentials.json"
docker compose -f apps/iracing-data-mcp/compose.yaml up -d
```

Exactly one running process may own a credential document. Do not run CLI Data
API commands or another MCP against that document while the container runs.
Auth-only credentials cannot use `whoami`, which needs profile scope. For local
logout, stop/drain and remove `credentials.json`, then restart: health reports
`authorization_required`. For the bind mount:

```sh
docker compose -f apps/iracing-data-mcp/compose.yaml stop
rm -- "$IRACING_MCP_DATA_DIR/credentials.json"
docker compose -f apps/iracing-data-mcp/compose.yaml up -d
```

This removes local credentials; it does not revoke
upstream authorization. Do not restore old backups after refresh-token rotation.
Corruption, missing files and uncertain rotation require stopped login. Startup
configuration failures use a safe message with remediation; token contents and
filesystem exceptions are never printed. A successful health check means the
process is live, not that authenticated upstream operations have been verified.

## Optional named volume: stopped atomic import

A named volume can replace the bind mount when host permission semantics are
unsuitable. Stop/drain **every owner**, create an empty named volume, and initialize
only its ownership (this one-off root command never starts the server):

```sh
docker volume create iracing-data-mcp
# Use the same explicit nonzero UID/GID as the host importer.
docker run --rm --user 0:0 --network none --cap-drop ALL --cap-add CHOWN --cap-add FOWNER --security-opt no-new-privileges:true \
  --mount type=volume,src=iracing-data-mcp,dst=/var/lib/iracing-data-mcp \
  --entrypoint sh "iracing-data-mcp:$IRACING_MCP_IMAGE_TAG" -c \
  'chown "$1:$2" /var/lib/iracing-data-mcp && chmod 700 /var/lib/iracing-data-mcp' sh "$IRACING_MCP_UID" "$IRACING_MCP_GID"
docker run --rm --network none --read-only --user "$IRACING_MCP_UID:$IRACING_MCP_GID" \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --mount type=bind,src="$IRACING_MCP_DATA_DIR",dst=/import,readonly \
  --mount type=volume,src=iracing-data-mcp,dst=/var/lib/iracing-data-mcp \
  -e IRACING_MCP_OWNER_STOPPED=yes --entrypoint node \
  "iracing-data-mcp:$IRACING_MCP_IMAGE_TAG" dist/import-main.js /import/credentials.json
```

The narrow helper validates the existing shared wire document/ownership and uses
the shared atomic durable writer; it constructs no OAuth client and cannot
refresh. The stopped acknowledgement is an operator prerequisite, not a lock.
After successful import, remove the host staging credential while stopped so it
cannot become a second refreshing owner. Replace Compose's data `volumes` entry
with `type: volume`, `source: iracing-data-mcp`, the same target, and add top-level
`volumes: {iracing-data-mcp: {external: true}}`. Subsequent re-login uses fresh host
staging credentials, stopped import, staging removal and restart. Local volume
logout removes credentials through a stopped one-off container under the mapped
UID, after stopping/draining every owner:

```sh
docker run --rm --network none --read-only --user "$IRACING_MCP_UID:$IRACING_MCP_GID" \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --mount type=volume,src=iracing-data-mcp,dst=/var/lib/iracing-data-mcp \
  --entrypoint sh "iracing-data-mcp:$IRACING_MCP_IMAGE_TAG" -c \
  'rm -- /var/lib/iracing-data-mcp/credentials.json'
```

Never initialize ownership or import into an active server's volume.

Windows host ACLs do not provide verified POSIX modes/UIDs. Use a Linux-owned
named volume and perform login/staging/import in an environment where the shared
0700/0600 contract is enforceable; do not disable checks. Docker Desktop bind
mount behavior depends on host/backend. Only platforms explicitly recorded by
the smoke run are verified; no blanket amd64/arm64 or Windows claim is made.

## Offline validation and rollback

Run the synthetic build/start/health/initialize smoke from the repository root:

```sh
node apps/iracing-data-mcp/test/docker-smoke.mjs
```

It uses temporary synthetic credentials, no account access, and removes its
container/data on completion. Run the complete synthetic restart/rotation/recovery suite with `pnpm verify:docker`;
see [verification prerequisites and CI coverage](../../docs/VERIFICATION.md#offline-docker-recovery).
It exercises the actual production entry point with a read-only test harness, no
real grants and no production endpoint override knobs. Rollback stops/drains and reverts the application/image;
never restore consumed refresh tokens. No generated artifacts or public package
versions change.

Packaging validation on 2026-10-05 passed with Docker Desktop 29.5.2 on macOS
arm64, a linux/arm64 runtime and Node 24.21.0. Build, synthetic credential health,
MCP initialize, exact Host rejection, read-only rootfs/capability/loopback mount
inspection and graceful stop passed. amd64 and Windows were not tested. The
public Node image digest is
`sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6`;
review and refresh it with dependency updates. Corepack in the build stage uses
the exact pnpm version/integrity in the root `packageManager`; the runtime removes
package-manager binaries and ships app dist with production dependencies only.

Shutdown also closes the process credential owner after bounded HTTP drain. If a
refresh grant was submitted but its replacement was not durably committed, the
owner records a safe `shutdown` / `TOKEN_REFRESH_FAILED` diagnostic, invalidates
retained account data and removes the uncertain credential before production
exit. Late grant results cannot restore ready state; publications already underway
are checked after completion and removal is attempted when the owner is terminal.
Failed cleanup requires stopped re-login. A clean completed rotation is retained;
a structured nonconsuming OAuth transient rejection also preserves the old
credential. Repeat shutdown signals share one owner cleanup.

If credential deletion cannot be confirmed, shutdown exits **nonzero** and tells
you to keep the service stopped and repair/re-login before restarting. Do not
configure automatic restart for that failure: a failed deletion cannot guarantee
durable quarantine to a new process. Forced SIGKILL/power loss can interrupt any
cleanup and does not prove whether a submitted refresh was consumed; perform
stopped host re-login before restarting after such an interruption. Never restore
an old refresh token from backup.

Recovery validation on 2026-10-06 passed all 22 acceptance groups locally on the
same macOS arm64 / linux/arm64 / Docker 29.5.2 / Node 24.21.0 platform. Coverage
includes rotation and restart exactly once, write/fsync/rename failure quarantine,
stopped login/logout, named-volume import, bind atomic replacement and termination
during refresh. The same 22 groups
[passed in CI](https://github.com/racedirector/iracing-data-api/actions/runs/37411801261/job/112101646317)
on Ubuntu 24.04.5/Linux amd64, Docker 28.0.4 and Node 24.21.0. No Windows support
is verified.
Single-owner orchestration in tests does not implement a production process lock.
