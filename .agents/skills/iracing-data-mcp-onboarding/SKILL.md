---
name: iracing-data-mcp-onboarding
description: Onboard a developer or operator onto the repository-local iRacing Data MCP server from any agent or MCP-capable client. Covers local prerequisites, iRacing OAuth, Docker startup, client configuration, optional ChatGPT private-tunnel integration, and recovery. Use the repository's deterministic helpers and pnpm mcp:local lifecycle.
---

# iRacing Data MCP onboarding

Guide the user from a fresh checkout to a verified local MCP endpoint while keeping secrets out of chat and keeping machine-verifiable setup work deterministic.

## Agent and client portability

This skill is plain repository guidance, not a Codex-specific API workflow. Any agent can read it or the user can follow it manually. Resolve paths relative to this skill and run commands from the repository root; never assume a particular operating system, agent tool name, browser session, user path, or credential exists.

Use the host agent's available shell, filesystem, and browser capabilities. If a capability is unavailable, give the user the smallest equivalent local step and resume from its verified result. Agent permissions and client workspace trust still apply. A denied Docker pipe or command in a sandbox does not prove Docker is stopped: distinguish access denial from host readiness before asking the user to reinstall or restart anything.

Choose the user's requested client, not the agent currently helping them. Read the [client connection guide](../../../apps/iracing-data-mcp/clients.md) for supported project configs and framework constraints. Read [ChatGPT integration](references/chatgpt.md) only when connecting ChatGPT web through a private tunnel. Do not assume a model subscription supplies Platform tunnel permissions, an API key, or custom-MCP access.

## Authority and boundaries

Read [root guidance](../../../AGENTS.md), [MCP guidance](../../../apps/iracing-data-mcp/AGENTS.md), and the current [local Docker guide](../../../apps/iracing-data-mcp/local-container.md) before acting. Treat the current checkout as implementation authority. Do not preserve stale onboarding instructions when the app, Compose file, root `.env.example`, or `pnpm mcp:local` workflow has changed.

The canonical local storage model is the Docker-managed named volume owned by the MCP workflow. Do not fall back to host bind mounts, host UID/GID mapping, manual `chmod`/`chown`, service-level `env_file`, inline Docker secrets, or remote port exposure. Do not weaken the application's `0700`/`0600` checks to make onboarding easier.

Never ask the user to paste `IRACING_AUTH_SECRET`, OAuth tokens, `credentials.json`, callback payloads, or other secrets into chat. The user edits secret-bearing files locally. Deterministic scripts may report whether a secret is configured or a credential file exists, but never its contents.

The same boundary applies to a tunnel runtime API key. Store only a secret reference in tunnel configuration; keep the key in a local ignored file or the host's secret store. If an authorized browser-to-local-file transfer is supported, transfer the value without printing it, placing it in a tool argument, or including it in screenshots/logs. Otherwise let the user save it locally. Follow the host's credential and approval policies.

## Deterministic helpers

Run these from the repository root:

- `node .agents/skills/iracing-data-mcp-onboarding/scripts/preflight.mjs` — machine-readable host/repository readiness, OAuth-key presence, Docker readiness, staging warnings, named-volume presence, and current health state. It does not mutate the checkout or print secret values.
- `node .agents/skills/iracing-data-mcp-onboarding/scripts/prepare-env.mjs` — create root `.env` from `.env.example` only when `.env` is absent. It never overwrites an existing file and uses mode `0600` on POSIX hosts.
- `node .agents/skills/iracing-data-mcp-onboarding/scripts/verify.mjs` — after startup, verify `/healthz`, authorization readiness, non-root runtime identity, named-volume ownership/mode, and credential/optional-secret file modes without reading their contents.

Use `pnpm mcp:local` for the actual MCP lifecycle. Do not reimplement its Docker build, stopped-owner import, secret transfer, or startup sequence in the skill.

## Workflow

1. **Inspect first.** Run the preflight script and read its JSON before giving setup instructions. Use its current Node, pnpm, Docker, `.env`, dependency, staging, volume, and health results rather than assuming the host state.
2. **Get the local development toolchain ready.** The checkout's `.nvmrc` and root `packageManager` field are authoritative. If Node is wrong, tell the user to activate the repository version with their existing version manager. If pnpm is absent or mismatched, install/activate the exact pinned version; prefer Corepack when available. On Windows/macOS require Docker Desktop with the Linux engine running; on Linux require Docker Engine plus the Compose plugin. Re-run preflight after the user fixes host-level prerequisites.
3. **Prepare configuration deterministically.** If root `.env` is missing, run `prepare-env.mjs`. Preserve existing values the user has confirmed. When configuration is missing or needs changing, give the exact local edit boundary: the user sets `IRACING_AUTH_CLIENT`, set `IRACING_AUTH_SECRET` only when their registered client has one, and set `IRACING_AUTH_REDIRECT_URI` to the HTTP loopback callback registered with iRacing. The `.env.example` port `0` is an example; preserve a registered fixed port when configured. If they do not yet have an iRacing OAuth client, they must create/configure one outside the repository first. Do not invent client IDs/secrets and do not ask them to send values back. If an edit is required, ask only for confirmation that the local file is configured, then rerun preflight. Preflight validates loopback URL shape, not registration with iRacing.
4. **Install repository dependencies.** Once Node and pnpm are correct, run `pnpm install --frozen-lockfile`. Re-run preflight; do not continue to login until its required readiness checks pass. A leftover host staging credential is a warning that should be understood before starting a second credential owner; never dump or casually delete it.
5. **Start or authenticate the owner.** If verification already passes, retain the running owner and continue to client configuration. If the service is stopped with valid imported credentials, use `pnpm mcp:local up`. If login is required, tell the user immediately before `pnpm mcp:local login` that a browser window will open and they must complete iRacing sign-in/consent themselves. When shell execution is available, run that command for them; otherwise give that single command. It owns stop, CLI build, browser launch, image build, named-volume initialization, credential/secret stdin import, staging cleanup, service start, and health wait. Do not replace it with hand-written Docker commands or force a fresh login for each new client.
6. **Verify deterministically.** Run `verify.mjs`. Successful onboarding requires `live: true`, `auth_state: "ready"`, a non-root runtime, data-directory mode `0700` owned by that runtime UID, `credentials.json` mode `0600`, and mode `0600` for `client-secret` when present. If verification fails, report the failed check category without exposing raw secret-bearing files.
7. **Connect the user's MCP client.** The endpoint is `http://127.0.0.1:3000/mcp`, using Streamable HTTP with no MCP bearer token or MCP OAuth. iRacing authorization belongs to the server-side credential document. Use the checked-in configuration and remaining client step in the [client connection guide](../../../apps/iracing-data-mcp/clients.md); preserve unrelated client settings and normal tool approvals. For other frameworks, check their HTTP transport support and whether they share the server host's network context. Ollama requires an MCP-capable host. For ChatGPT web, follow [the private-tunnel reference](references/chatgpt.md) and finish registration only while the tunnel is ready. Ask which client only when context does not establish it.
8. **Confirm usable state.** Have the user/client perform one normal MCP connection/tool smoke after registration unless they explicitly defer testing. Distinguish MCP transport/client-registration problems from iRacing authorization problems. A passing `/healthz` proves process/auth state, not every upstream API request.

## Recovery decisions

Use `pnpm mcp:local status` plus preflight/verify results before changing state. If the service is merely stopped with valid imported credentials, use `pnpm mcp:local up`. If authorization is missing, corrupt, rotated uncertainly, or configured for the wrong OAuth client, keep the owner stopped and rerun `pnpm mcp:local login` so the user completes browser authentication again.

`pnpm mcp:local reset` is destructive because it removes the named volume and imported credentials. Never run it without explicit user approval. Do not restore old refresh-token backups after token rotation and do not create a second refreshing owner from copied credentials.

For failures outside the deterministic checks, inspect the current MCP startup diagnostics and bounded Docker logs, then return to the canonical guide. Do not solve Windows/macOS permission errors by reintroducing bind mounts or relaxing Linux permission checks.

## User-facing handoff

Keep the user informed by stage: host prerequisites, local `.env` manual edit, browser authorization, runtime verification, and MCP-client registration. At each manual boundary, state exactly what the user must do and what they must not share. Do not make them execute checks or Docker commands that the deterministic scripts or `pnpm mcp:local` can perform.

Finish when the requested scope is satisfied: a verified server plus registered client, or configuration-only setup with one precise remaining client step. Respect a request to defer model inference or upstream calls. Distinguish runtime readiness, transport/tool discovery, client registration, and model/tool behavior in the result; do not claim skipped checks passed. Do not infer separate product billing or usage-limit behavior from a successful connection.
