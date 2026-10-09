# Local Docker MCP

This private app runs one local credential owner at `http://127.0.0.1:3000/mcp`. Health and MCP initialize/listing remain usable when credentials are missing or corrupt; authenticated tools require stopped host reauthentication. No browser callback runs inside Docker. Local processes can access MCP; do not expose its port remotely.

## Configure once with the repository `.env`

Use one repository-root `.env` for both host OAuth login and Docker Compose. The `pnpm iracing-data` script already loads that file. Invoke Compose with `--env-file .env` so it uses the same root configuration instead of looking for an app-local `.env` beside `compose.yaml`.

Start from the checked-in example:

```sh
cp .env.example .env
```

Configure the normal host OAuth values and the host UID/GID:

```dotenv
IRACING_AUTH_CLIENT=<registered-client-id>
IRACING_AUTH_SECRET=<secret-if-issued>
IRACING_AUTH_REDIRECT_URI=http://127.0.0.1:0/oauth/iracing/callback
IRACING_MCP_UID=<output-of-id--u>
IRACING_MCP_GID=<output-of-id--g>
```

If the registered client does not have a secret, leave `IRACING_AUTH_SECRET` empty. On POSIX hosts, `id -u` and `id -g` provide the two MCP values. Both must be nonzero.

The same `IRACING_AUTH_CLIENT` is used for host login and mapped by Compose to the container's `IRACING_MCP_CLIENT_ID`; there is no second client-ID setting to keep in sync. The local image tag defaults to `local`, and the normal credential directory is `.iracing-data/iracing-data-mcp` under the repository root.

Do **not** add `env_file: ../../.env` to the service. A Compose service `env_file` would inject every value from the root file into the container, including `IRACING_AUTH_SECRET`. The MCP intentionally rejects inline secrets. The `--env-file .env` CLI option is used for Compose interpolation, and `compose.yaml` explicitly forwards only the values the container needs. The repository `.dockerignore` excludes `.env*`, so the file is never copied into an image build context.

The Dockerfile is intentionally limited to stable, nonsecret, host-independent container defaults such as `NODE_ENV=production` and the internal `IRACING_MCP_LISTEN_HOST=0.0.0.0`. Bind-mount paths, host UID/GID, client IDs and secrets are runtime/operator configuration and do not belong in image layers.

## First-time setup and start

Use the repository Node version in `.nvmrc` and pinned pnpm from `packageManager`. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter '@iracing-data/cli...' build
mkdir -p .iracing-data/iracing-data-mcp
chmod 700 .iracing-data/iracing-data-mcp
pnpm iracing-data auth login --scope iracing.auth --credentials .iracing-data/iracing-data-mcp/credentials.json
docker compose --env-file .env -f apps/iracing-data-mcp/compose.yaml up -d --build
curl --fail http://127.0.0.1:3000/healthz
```

The CLI reads `IRACING_AUTH_CLIENT`, `IRACING_AUTH_SECRET` and `IRACING_AUTH_REDIRECT_URI` from the root `.env`; those values do not need to be exported into the parent shell.

If the registered client requires a secret, keep `IRACING_AUTH_SECRET` in the host-only `.env` for CLI login and separately place the same secret in `.iracing-data/iracing-data-mcp/client-secret` with mode 0600. Then add only the container-visible file path to `.env`:

```dotenv
IRACING_MCP_CLIENT_SECRET_FILE=/var/lib/iracing-data-mcp/client-secret
```

Never put a secret value in Docker environment values, command-line flags, build arguments, image layers or diagnostic dumps.

The entire data directory is mounted at `/var/lib/iracing-data-mcp` so atomic token replacement and directory fsync work. The directory must belong to the configured UID with mode 0700, and credentials and an optional secret file must be 0600. Ownership/modes are checked, never bypassed. Host chmod/chown must be performed while stopped. Wrong-client credentials require a new host login with the configured client ID; the server never tries another client.

Compose publishes only `127.0.0.1:3000`, uses a read-only root filesystem, a small `/tmp` tmpfs and the data mount, drops all capabilities and forbids new privileges. It mounts no Docker socket. The runtime is digest-pinned Node 24 slim, without build tools or dev dependencies. Builds use the root context and frozen pnpm lockfile. No registry publication or npm release is included.

`IRACING_MCP_ALLOWED_HOSTS` and `IRACING_MCP_ALLOWED_ORIGINS` remain optional root `.env` overrides. They accept comma-separated **exact** authorities/origins and default to localhost and 127.0.0.1 on port 3000. Only `localhost` and `127.0.0.1` HTTP authorities are supported, including custom ports. Wildcards, non-loopback names, HTTPS, unpaired origins, credentials, paths, query strings, whitespace and `null` origins are rejected. Requests without Origin are accepted after Host validation. Keep the loopback port binding unchanged.

## Connect a local MCP client

After the container starts, register it with Codex on the same host:

```sh
codex mcp add iracing-data --url http://127.0.0.1:3000/mcp
```

Use no MCP bearer token or MCP OAuth login: iRacing authorization belongs to the mounted credential document. See the [tool guide](README.md) for the available tools, workflows, protocol evidence and result/recovery semantics.

## Stop, repair, restart, logout

Before every login/re-login, import, logout, permission repair or file replacement:

```sh
docker compose --env-file .env -f apps/iracing-data-mcp/compose.yaml stop
# Wait for stop to complete (15 seconds grace; HTTP drain is bounded at 10 seconds).
pnpm iracing-data auth login --scope iracing.auth --credentials .iracing-data/iracing-data-mcp/credentials.json
docker compose --env-file .env -f apps/iracing-data-mcp/compose.yaml up -d
```

Exactly one running process may own a credential document. Do not run CLI Data API commands or another MCP against that document while the container runs. Auth-only credentials cannot use `whoami`, which needs profile scope.

For local logout, stop/drain and remove `credentials.json`, then restart:

```sh
docker compose --env-file .env -f apps/iracing-data-mcp/compose.yaml stop
rm -- .iracing-data/iracing-data-mcp/credentials.json
docker compose --env-file .env -f apps/iracing-data-mcp/compose.yaml up -d
```

This removes local credentials; it does not revoke upstream authorization. Do not restore old backups after refresh-token rotation. Corruption, missing files and uncertain rotation require stopped login. A successful health check means the process is live, not that authenticated upstream operations have been verified.

## Optional named volume: stopped atomic import

A named volume can replace the bind mount when host permission semantics are unsuitable. This is an advanced alternative; the normal setup above uses the repository-local bind mount. Stop/drain **every owner**, create an empty named volume, and initialize only its ownership:

```sh
docker volume create iracing-data-mcp
docker run --rm --user 0:0 --network none --cap-drop ALL --cap-add CHOWN --cap-add FOWNER --security-opt no-new-privileges:true \
  --mount type=volume,src=iracing-data-mcp,dst=/var/lib/iracing-data-mcp \
  --entrypoint sh iracing-data-mcp:local -c \
  'chown "$1:$2" /var/lib/iracing-data-mcp && chmod 700 /var/lib/iracing-data-mcp' sh "$(id -u)" "$(id -g)"
docker run --rm --network none --read-only --user "$(id -u):$(id -g)" \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --mount type=bind,src="$PWD/.iracing-data/iracing-data-mcp",dst=/import,readonly \
  --mount type=volume,src=iracing-data-mcp,dst=/var/lib/iracing-data-mcp \
  -e IRACING_MCP_OWNER_STOPPED=yes --entrypoint node \
  iracing-data-mcp:local dist/import-main.js /import/credentials.json
```

If `IRACING_MCP_IMAGE_TAG` is intentionally overridden, substitute that image tag for `local` in the one-off commands above.

See [the stopped importer](src/import-credentials.ts) for validation and shared durable-writer ownership. The stopped acknowledgement is an operator prerequisite, not a lock. After successful import, remove the host staging credential while stopped so it cannot become a second refreshing owner. Replace Compose's data `volumes` entry with `type: volume`, `source: iracing-data-mcp`, the same target, and add top-level `volumes: {iracing-data-mcp: {external: true}}`.

Windows host ACLs do not provide verified POSIX modes/UIDs. Use a Linux-owned named volume and perform login/staging/import in an environment where the shared 0700/0600 contract is enforceable; do not disable checks. Docker Desktop bind mount behavior depends on host/backend. Only platforms explicitly recorded by the smoke run are verified.

## Offline validation and rollback

Run the synthetic build/start/health/initialize smoke from the repository root:

```sh
node apps/iracing-data-mcp/test/docker-smoke.mjs
```

Run the complete synthetic restart/rotation/recovery suite with `pnpm verify:docker`; see [verification prerequisites and CI coverage](../../docs/VERIFICATION.md#offline-docker-recovery). The tests use synthetic credentials and no account access. Rollback stops/drains and reverts the application/image; never restore consumed refresh tokens. No generated artifacts or public package versions change.

The [HTTP boundary](src/http.ts) and [session owner](src/session.ts) document drain, rotation quarantine and late-result handling. If credential deletion cannot be confirmed, keep the service stopped and repair/re-login before restarting. Forced SIGKILL or power loss can interrupt cleanup and does not prove whether a submitted refresh was consumed; perform stopped host re-login before restarting after such an interruption.
