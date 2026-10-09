# Authored OpenAPI build tools

Inherits [root guidance](../../AGENTS.md). These helpers are private authored tooling, not generated SDKs. Discover package names and scripts from their manifests.

Inspect the [Data API document builder](api-schema-to-openapi/src/index.ts) and
[CLI](api-schema-to-openapi/src/cli.ts), or the [OAuth document builder](oauth-schema-to-openapi/src/index.ts)
and [CLI](oauth-schema-to-openapi/src/cli.ts), for mapping, description provenance and output boundaries.
Preserve public client naming deliberately when changing operation IDs. Fix mapping problems here
instead of editing OpenAPI or generated SDK output. Do not hand-edit compiled `dist/`.

Use [OpenAPI guidance](../../openapi/AGENTS.md) for exact dependency-aware build and JSON/YAML generation commands. Regenerate only the affected contract branch, then validate its downstream consumers. Run root lint/style for TypeScript changes; inspect current scripts for available tests. A successful helper build does not prove upstream compatibility or generated-output freshness.
