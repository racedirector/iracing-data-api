# Repository discovery for OAuth audits

Read [root guidance](../../../../AGENTS.md), [OAuth guidance](../../../../packages/oauth/AGENTS.md), and [OpenAPI guidance](../../../../openapi/AGENTS.md) for canonical ownership and regeneration rules. Use `workspace-policy.json` and current manifests for classification, package names, and dependencies. This reference supplies audit search seeds, not a second topology inventory.

## Discovery

From the repository root:

```bash
rg --files packages/oauth packages/helpers/oauth-schema-to-openapi openapi examples
rg -n 'OAuth|authorize|callback|passwordLimited|refresh|PKCE|challenge|verifier' packages/oauth examples
rg -n 'mask|secret|scope|revoke|session|profile|RateLimit|Retry-After|request.id' packages/oauth
rg -n 'jwt|jwks|claim|issuer|aud|error|URLSearchParams|form-urlencoded' packages/oauth
rg --files -g '*test*' -g '*spec*' -g '*fixture*' packages/oauth examples
```

Inspect schema exports, runtime client/storage/errors/utilities, helper endpoint mappings, generated JSON/YAML, examples, and README claims. Read package scripts before deciding what tests exist; a test dependency or old file reference is not evidence of coverage. Inspect dependency helpers when they alter raw protocol values.

Do not limit the audit to these terms. Check git history for relevant symbols before describing a mismatch as an upstream change or intentional design. Preserve working-tree changes and do not regenerate outputs during a read-only audit.
