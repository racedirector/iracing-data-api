# Local Docker MCP

This private app runs one local credential owner at `http://127.0.0.1:3000/mcp`. The supported local-Docker path uses a Docker-managed named volume on Windows, macOS, and Linux so the MCP's required Linux ownership and `0700`/`0600` permission contract does not depend on host bind-mount semantics.

Local processes can access MCP; do not expose its port remotely. No browser callback runs inside Docker: OAuth login remains a host operation, and the resulting credentials are transferred into the stopped Docker volume over stdin.

## Configure once

Use the repository-root `.env` for host OAuth configuration and Compose interpolation. The root scripts load it automatically.

```sh
cp .env.example .env
```

Set the OAuth values issued for your registered client:

```dotenv
IRACING_AUTH_CLIENT=<registered-client-id>
IRACING_AUTH_SECRET=<secret-if-issued>
IRACING_AUTH_REDIRECT_URI=http://127.0.0.1:0/oauth/iracing/callback
```

If your client has no secret, leave `IRACING_AUTH_SECRET` empty. Normal local setup does **not** require host UID/GID values, a host MCP data-directory path, or manual `chmod`/`chown` commands.

The same `IRACING_AUTH_CLIENT` is used by host login and mapped by Compose to the MCP container's `IRACING_MCP_CLIENT_ID`. The image tag defaults to `local`.

Do **not** add a Compose service-level `env_file: ../../.env`. That would inject the whole root `.env`, including `IRACING_AUTH_SECRET`, into the MCP container. The MCP intentionally rejects inline secrets. The host helper removes `IRACING_AUTH_SECRET` from Docker's environment and, when a secret exists, transfers it over stdin into a `0600` file inside the Docker-managed volume.

## Build, authenticate, and start

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm mcp:local login
```

`pnpm mcp:local login` performs the complete stopped-owner flow:

1. Stops the MCP if it is running.
2. Builds the host auth CLI.
3. Opens the iRacing browser login using the root `.env`.
4. Builds the MCP image.
5. Initializes the Docker named volume as `1000:1000` with mode `0700`.
6. Transfers the OAuth document over stdin and writes `credentials.json` as `0600`.
7. If configured, transfers the client secret over stdin and writes `client-secret` as `0600`.
8. Removes the host staging credential.
9. Starts the MCP and waits for `/healthz`.

The runtime container remains non-root (`USER 1000:1000`). Only the one-shot `mcp-init` service runs as root, without networking and with only `CHOWN`/`FOWNER`, to establish the named volume's ownership and mode. Credential and secret import services run non-root with networking disabled.

For normal subsequent starts:

```sh
pnpm mcp:local up
```

Other lifecycle commands are:

```sh
pnpm mcp:local status
pnpm mcp:local stop
pnpm mcp:local reset
```

`reset` removes the MCP container and named volume, so the next authenticated start requires `pnpm mcp:local login` again.

## Platform notes

The supported command sequence above is intentionally the same on Windows, macOS, and Linux.

<details>
<summary>Windows / Docker Desktop</summary>

Do not use a Windows bind mount for `/var/lib/iracing-data-mcp`. Docker Desktop commonly projects Windows directories into the Linux VM as mode `0777`, which the MCP correctly rejects because its data directory must be exactly `0700`.

The named-volume workflow avoids NTFS ACL-to-POSIX translation entirely. `pnpm mcp:local login` stages the host OAuth result only long enough to stream it into the Docker volume, then deletes the staging credential.

PowerShell and Command Prompt both use the same pnpm commands shown above; no `id`, `chmod`, `chown`, `export`, or PowerShell-specific Docker setup is required.

</details>

<details>
<summary>macOS / Docker Desktop</summary>

Use the same named-volume workflow. Although macOS bind mounts can often expose usable POSIX modes, their behavior still crosses the Docker Desktop filesystem boundary. The named volume keeps credential ownership, atomic replacement, and directory fsync semantics inside Docker's Linux filesystem and matches the Windows and Linux setup.

No host UID/GID mapping is required.

</details>

<details>
<summary>Linux</summary>

Use the same named-volume workflow for consistency with other development hosts. A secure native Linux bind mount can work, but it is no longer the canonical local setup and is not required for normal operation.

</details>

GitHub Markdown does not provide native tab controls; the collapsible sections above are used for the small amount of host-specific context while keeping one canonical command path.

## Docker storage and security boundary

Compose uses the named volume `iracing-data-mcp` at `/var/lib/iracing-data-mcp`. The application still enforces:

- non-root runtime UID/GID
- data directory owned by the runtime user with mode exactly `0700`
- OAuth credential document mode exactly `0600`
- optional client-secret file owned by the runtime user with mode exactly `0600`
- no symlink credential directory or final secret path

These checks are not bypassed for Docker Desktop.

Compose publishes only `127.0.0.1:3000`, uses a read-only root filesystem, a small `/tmp` tmpfs, drops all runtime capabilities, forbids new privileges, and mounts no Docker socket. The one-shot volume initializer has no network and exits before the MCP starts.

`IRACING_MCP_ALLOWED_HOSTS` and `IRACING_MCP_ALLOWED_ORIGINS` remain optional root `.env` overrides. They accept comma-separated **exact** loopback authorities/origins and default to localhost and 127.0.0.1 on port 3000. Wildcards, non-loopback names, HTTPS, unpaired origins, credentials, paths, query strings, whitespace, and `null` origins are rejected.

## Connect a local MCP client

After the service starts:

```sh
codex mcp add iracing-data --url http://127.0.0.1:3000/mcp
```

Use no MCP bearer token or MCP OAuth login. iRacing authorization belongs to the credential document in the Docker-managed volume. See the [tool guide](README.md) for the available tools and workflows.

## Reauthentication and recovery

Before replacing credentials, stop the owner and run the complete login/import flow again:

```sh
pnpm mcp:local login
```

The helper stops the MCP before host authentication/import and does not leave the host staging credential behind after successful transfer. Exactly one running process may own a refresh-token document. Do not run another MCP or CLI Data API process against a copied credential document while the container owns the imported one.

If refresh-token rotation becomes uncertain, or the credential state is missing/corrupt, keep the service stopped and run `pnpm mcp:local login` again. Do not restore old refresh tokens from backups.

A successful `/healthz` response means the process is live; it does not by itself prove an authenticated upstream request succeeds.

## Offline validation

Run the repository verification contract plus Docker recovery coverage:

```sh
pnpm verify
pnpm verify:docker
```

The Docker suite uses synthetic credentials and no account access. It exercises production startup, rotation/restart, persistence faults, named-volume import, permission enforcement, graceful shutdown, and recovery behavior.

The [HTTP boundary](src/http.ts), [session owner](src/session.ts), and [credential importer](src/import-credentials.ts) document the underlying lifecycle, durability, and recovery contracts.
