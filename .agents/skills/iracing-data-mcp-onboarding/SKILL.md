---
name: iracing-data-mcp-onboarding
description: Onboard a developer or operator onto the repository-local iRacing Data MCP app. Use for first-time local setup, Windows/macOS/Linux Docker Desktop setup, OAuth configuration, browser login, MCP startup, local health verification, client registration, and startup recovery. Prefer the deterministic skill scripts and the app's `pnpm mcp:local` workflow over ad hoc Docker, bind-mount, chmod/chown, or credential-copy instructions.
---

# iRacing Data MCP onboarding

Guide the user from a fresh checkout to a verified local MCP endpoint while keeping secrets out of chat and keeping machine-verifiable setup work deterministic.

## Authority and boundaries

Read [root guidance](../../../AGENTS.md), [MCP guidance](../../../apps/iracing-data-mcp/AGENTS.md), and the current [local Docker guide](../../../apps/iracing-data-mcp/local-container.md) before acting. Treat the current checkout as implementation authority. Do not preserve stale onboarding instructions when the app, Compose file, root `.env.example`, or `pnpm mcp:local` workflow has changed.

The canonical local storage model is the Docker-managed named volume owned by the MCP workflow. Do not fall back to host bind mounts, host UID/GID mapping, manual `chmod`/`chown`, service-level `env_file`, inline Docker secrets, or remote port exposure. Do not weaken the application's `0700`/`0600` checks to make onboarding easier.

Never ask the user to paste `IRACING_AUTH_SECRET`, OAuth tokens, `credentials.json`, callback payloads, or other secrets into chat. The user edits secret-bearing files locally. Deterministic scripts may report whether a secret is configured or a credential file exists, but never its contents.

## Deterministic helpers

Run these from the repository root:

- `node .agents/skills/iracing-data-mcp-onboarding/scripts/preflight.mjs` — machine-readable host/repository readiness, OAuth-key presence, Docker readiness, staging warnings, named-volume presence, and current health state. It does not mutate the checkout or print secret values.
- `node .agents/skills/iracing-data-mcp-onboarding/scripts/prepare-env.mjs` — create root `.env` from `.env.example` only when `.env` is absent. It never overwrites an existing file and uses mode `0600` on POSIX hosts.
- `node .agents/skills/iracing-data-mcp-onboarding/scripts/verify.mjs` — after startup, verify `/healthz`, authorization readiness, non-root runtime identity, named-volume ownership/mode, and credential/optional-secret file modes without reading their contents.

Use `pnpm mcp:local` for the actual MCP lifecycle. Do not reimplement its Docker build, stopped-owner import, secret transfer, or startup sequence in the skill.

## Workflow

1. **Inspect first.** Run the preflight script and read its JSON before giving setup instructions. Use its current Node, pnpm, Docker, `.env`, dependency, staging, volume, and health results rather than assuming the host state.
2. **Get the local development toolchain ready.** The checkout's `.nvmrc` and root `packageManager` field are authoritative. If Node is wrong, tell the user to activate the repository version with their existing version manager. If pnpm is absent or mismatched, install/activate the exact pinned version; prefer Corepack when available. On Windows/macOS require Docker Desktop with the Linux engine running; on Linux require Docker Engine plus the Compose plugin. Re-run preflight after the user fixes host-level prerequisites.
3. **Prepare configuration deterministically.** If root `.env` is missing, run `prepare-env.mjs`. Then stop and give the user the exact manual edit boundary: they must locally set `IRACING_AUTH_CLIENT`, set `IRACING_AUTH_SECRET` only when their registered client has one, and keep `IRACING_AUTH_REDIRECT_URI` aligned with `.env.example`. If they do not yet have an iRacing OAuth client, they must create/configure one outside the repository first. Do not invent client IDs/secrets and do not ask them to send values back. Ask only for confirmation that the local file is configured, then rerun preflight.
4. **Install repository dependencies.** Once Node and pnpm are correct, run `pnpm install --frozen-lockfile`. Re-run preflight; do not continue to login until its required readiness checks pass. A leftover host staging credential is a warning that should be understood before starting a second credential owner; never dump or casually delete it.
5. **Perform the browser-auth manual boundary.** Tell the user immediately before the login command that a browser window will open and that they must complete iRacing sign-in/consent themselves. When shell execution is available, run `pnpm mcp:local login` for them; otherwise give that single command. The command owns stop, CLI build, browser launch, image build, named-volume initialization, credential/secret stdin import, staging cleanup, service start, and health wait. Do not replace it with hand-written Docker commands.
6. **Verify deterministically.** Run `verify.mjs`. Successful onboarding requires `live: true`, `auth_state: "ready"`, a non-root runtime, data-directory mode `0700` owned by that runtime UID, `credentials.json` mode `0600`, and mode `0600` for `client-secret` when present. If verification fails, report the failed check category without exposing raw secret-bearing files.
7. **Connect the user's MCP client.** The server endpoint is `http://127.0.0.1:3000/mcp`. Infer the client from context when possible. For Codex CLI, the repository guide uses `codex mcp add iracing-data --url http://127.0.0.1:3000/mcp`. For another client, give its local HTTP MCP configuration steps or ask which client only after the server itself is verified. Do not add bearer-token or MCP OAuth configuration; iRacing authorization is owned by the server-side credential document.
8. **Confirm usable state.** Have the user/client perform one normal MCP connection/tool smoke after registration. Distinguish MCP transport/client-registration problems from iRacing authorization problems. A passing `/healthz` proves process/auth state, not every upstream API request.

## Recovery decisions

Use `pnpm mcp:local status` plus preflight/verify results before changing state. If the service is merely stopped with valid imported credentials, use `pnpm mcp:local up`. If authorization is missing, corrupt, rotated uncertainly, or configured for the wrong OAuth client, keep the owner stopped and rerun `pnpm mcp:local login` so the user completes browser authentication again.

`pnpm mcp:local reset` is destructive because it removes the named volume and imported credentials. Never run it without explicit user approval. Do not restore old refresh-token backups after token rotation and do not create a second refreshing owner from copied credentials.

For failures outside the deterministic checks, inspect the current MCP startup diagnostics and bounded Docker logs, then return to the canonical guide. Do not solve Windows/macOS permission errors by reintroducing bind mounts or relaxing Linux permission checks.

## User-facing handoff

Keep the user informed by stage: host prerequisites, local `.env` manual edit, browser authorization, runtime verification, and MCP-client registration. At each manual boundary, state exactly what the user must do and what they must not share. Do not make them execute checks or Docker commands that the deterministic scripts or `pnpm mcp:local` can perform.

Finish only when the deterministic verification passes and either the MCP client is registered or the user has one precise remaining client-registration action. Report any unverified platform/client-specific limitation explicitly.
