# Generated Rust Data API client

Inherits [root guidance](../../AGENTS.md). This crate is a generated public client in the Cargo workspace; it is independently versioned. Classification does not provide an automated Cargo publication workflow.

Rust source, models, endpoint documentation, and generator support files come from `openapi/iracing.json`. Fix contracts in authored schemas/mappings per [OpenAPI guidance](../../openapi/AGENTS.md). Fix generation in `scripts/openapi-generator-rust.sh`, its post-process script, or `openapitools.json`; do not hand-patch generated Rust.

Inspect the [Rust wrapper](../../scripts/openapi-generator-rust.sh),
[presentation normalizer](../../scripts/normalize-rust-presentation.mjs), and
[freshness orchestrator](../../scripts/check-generated.mjs) for generation and preservation boundaries.
Edit the authored presentation inputs in [rust.json](../../scripts/client-presentation/rust.json)
and [rust.md](../../scripts/client-presentation/rust.md), rather than generated README output.
Keep reviewed Cargo versions, dependencies and build settings, authored examples, and scoped guidance
when regenerating or cleaning output. Run `pnpm verify:generated` for isolated freshness validation.

From the repository root, after regenerating the Data API OpenAPI input:

```bash
pnpm codegen:client:api:rust
cargo fmt --all -- --check
cargo check -p iracing-data-api-client
cargo test -p iracing-data-api-client
```

Generation requires Java/OpenAPI Generator and Rust/rustfmt. Inspect generated diffs, including Cargo metadata and documentation, and run focused Rust checks through `pnpm verify:rust`, which CI also runs. Report unavailable toolchains or dependency downloads instead of treating unrun checks as passing. A shared contract change also requires the Fetch and Axios generation/builds.
