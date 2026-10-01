# Authored OpenAPI build tools

Inherits [root guidance](../../AGENTS.md). These helpers are private authored tooling, not generated SDKs. Discover package names and scripts from their manifests.

Schemas supply wire shapes; helper `src` owns OpenAPI paths, operation IDs, response/content-type/security mappings, and document metadata. Preserve public client naming deliberately when changing operation IDs. Fix mapping problems here instead of editing `openapi/` or downstream generated clients. CLI build output in `dist/` is derived and must not be hand-edited.

Use [OpenAPI guidance](../../openapi/AGENTS.md) for exact dependency-aware build and JSON/YAML generation commands. Regenerate only the affected contract branch, then validate its downstream consumers. Run root lint/style for TypeScript changes; inspect current scripts for available tests. A successful helper build does not prove upstream compatibility or generated-output freshness.
