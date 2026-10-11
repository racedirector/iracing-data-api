# Connect the local MCP server to ChatGPT

Read this reference only for ChatGPT web registration. Shared prerequisites,
iRacing login, storage, and recovery remain owned by [the skill](../SKILL.md) and
the [local Docker guide](../../../../apps/iracing-data-mcp/local-container.md).
This procedure was exercised on Windows on 2026-10-09. Other platforms and account
types require their own verification; UI labels and access rules may change.

Official sources: [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels)
and [Add custom MCP server](https://developers.openai.com/api/docs/guides/custom-mcp-server).
Check these before acting if current UI or binary help differs. This reference
does not require any particular agent framework, plugin, or browser automation API.

## Establish account access and preserve the local server

1. Verify the existing container with the skill's `verify.mjs`. Keep it as the
   sole iRacing refresh-token owner. The tunnel forwards MCP requests to
   `http://127.0.0.1:3000/mcp`; it does not import iRacing credentials.
2. In the user's signed-in ChatGPT web account, open [Plugins](https://chatgpt.com/plugins)
   and check **Add → Add custom MCP server → Tunnel**. Check actual access rather
   than deciding from a plan name alone. This may require workspace permission.
3. Open [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels).
   Let the user complete sign-in. An existing ChatGPT sign-in does not guarantee
   the same browser tab is signed into Platform. Inspect the actual signed-in tab
   after the user returns; avoid repeatedly acting on an older login tab.
4. Create or reuse an appropriately named tunnel. Scope it to the intended
   Platform organization and ChatGPT workspace. Do not select an unexplained
   workspace ID solely because it is the only option. Confirm the user/account
   context, and follow the host's authorization policy before granting access.
   Record the non-secret tunnel ID locally, never someone else's instance ID.

The server remains loopback-only. Do not use an ad hoc public tunnel, publish the
Compose port remotely, relax allowed-host checks, or add MCP OAuth to this app.
If private tunnel access is unavailable, report that concrete blocker and offer
the already-supported local clients; do not weaken the service boundary.

## Install and inspect the tunnel client

Use the official download linked by Platform, or
[`openai/tunnel-client` latest release](https://github.com/openai/tunnel-client/releases/latest).
Select the host OS/architecture and verify its archive against the release's
`SHA256SUMS.txt` before running it. Keep runtime files in an ignored local directory,
for example `.iracing-data/tunnel-client/`. Do not commit downloaded binaries,
profiles with account-specific metadata, logs, or keys.

**Do not assume subcommands from this document exist in an installed binary.**
`tunnel-client` is versioned independently of this repository. Before giving or
running setup commands, inspect the installed binary:

```text
tunnel-client --version
tunnel-client help quickstart
tunnel-client init --help
tunnel-client doctor --help
tunnel-client run --help
```

Treat those commands as the required baseline. If the installed binary's help
contradicts this reference, its actual help plus the current official OpenAI guide
are authoritative. Upgrade the binary only when the user wants or needs behavior
that their installed version does not provide; never invent a missing command.

The daemon requires a **runtime** Platform API key whose principal has Tunnels
Read + Use. Creating/managing a tunnel additionally requires Read + Manage.
Let the user create the key in [Platform API keys](https://platform.openai.com/settings/organization/api-keys)
according to the host's credential policy. Do not use an admin key for the daemon.
Save the runtime key to an ignored local file such as
`.iracing-data/tunnel-client/runtime-key`, or an existing approved secret store.
Use mode `0600` on POSIX or a user-restricted ACL on Windows. Never print or read
the key into chat, command arguments, generated docs, browser snapshots, or logs.
If the user authorizes copying an already-created browser key, use a private
transfer directly to the local file; if that cannot be done safely, ask them to
save it themselves. Close the reveal dialog once the key has been saved.

## Baseline profile workflow

For an HTTP MCP server that does not advertise MCP OAuth metadata, current
`tunnel-client` releases expose the `sample_mcp_remote_no_auth` profile sample.
Confirm the sample exists with the installed binary before using it. Then create a
profile whose target is the existing loopback MCP endpoint:

```text
tunnel-client init --sample sample_mcp_remote_no_auth --profile iracing-data --profile-dir <absolute-profile-directory> --tunnel-id <tunnel-id> --mcp-server-url http://127.0.0.1:3000/mcp --control-plane-api-key-ref file:<absolute-runtime-key-file> --health-listen-addr 127.0.0.1:0
```

Validate exactly that profile before starting it:

```text
tunnel-client doctor --profile iracing-data --profile-dir <absolute-profile-directory> --explain
```

Then run it with the command reported by `doctor`/`init`; for current releases this
is normally:

```text
tunnel-client run --profile iracing-data --profile-dir <absolute-profile-directory>
```

A foreground `run` is the portable baseline and is appropriate for proving the
connection. Keep the process running while ChatGPT uses the tunnel. If the user
needs a long-lived supervised runtime, inspect the installed binary for a supported
runtime-management surface rather than substituting `nohup`, `disown`, or an
unmanaged hidden process.

## Optional managed-runtime workflow

Some newer `tunnel-client` versions expose `tunnel-client runtimes ...` commands.
They are **optional version-specific conveniences**, not prerequisites for this
repository's MCP server. Only use them after this succeeds:

```text
tunnel-client runtimes --help
```

For versions that advertise `runtimes connect`, inspect its help and pass only
flags supported by that installed version. Current v0.0.16, for example, supports
an alias plus existing tunnel/profile/URL/runtime-key inputs and provides
`runtimes status <alias>` for inspection. Do not copy a command line from this
reference into a binary whose help does not expose the same flags.

For failures, use `doctor --profile iracing-data --profile-dir
<absolute-profile-directory> --explain` and bounded, redacted diagnostics.
Distinguish API-key permissions, workspace association, tunnel connectivity, and
local MCP reachability. Do not restart iRacing login to repair a tunnel-only failure.

## Register and verify in ChatGPT

With the tunnel runtime ready, return to **Add custom MCP server**:

1. Set a name such as **iRacing Data** and a short read-only description.
2. Select **Tunnel** and enter the verified tunnel ID.
3. Select **No authentication** for the MCP connection. The runtime key
   authenticates the tunnel; the server's iRacing document authenticates upstream.
4. Review the displayed risk notice, then create the plugin within the user's
   authorization and host approval policy. Creating the plugin may be followed by
   a separate **Connect iRacing Data** step; finish both when authorized.
5. Verify the plugin detail page says **Connected** and appears under **Installed**.
   Leave that page as the user-facing result. Save only a non-secret confirmation
   screenshot if the host supports it.

In a normal ChatGPT conversation the user can select `@iRacing Data`. Docker, the
MCP container, and the tunnel process must remain running on the host. Local
OpenCode/Cursor/etc. clients continue to use the direct loopback URL independently.

If the user defers testing, stop after readiness, tool discovery, and visible
registration: do not send a model prompt or call an upstream tool. Otherwise use
one explicitly authorized bounded read-only smoke. Registration is not evidence
of every tool's behavior, product billing, or independent usage limits. Report
the exact verification achieved and any remaining user action.
