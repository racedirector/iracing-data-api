# Generated Rust Data API client

Inherits [root guidance](../../AGENTS.md). This crate is a generated public client in the Cargo workspace; it is independently versioned. Classification does not provide an automated Cargo publication workflow.

Rust source, models, endpoint documentation, and generator support files come from `openapi/iracing.json`. Fix contracts in authored schemas/mappings per [OpenAPI guidance](../../openapi/AGENTS.md). Fix generation in `scripts/openapi-generator-rust.sh`, its post-process script, or `openapitools.json`; do not hand-patch generated Rust.

The wrapper selects the Rust generator options, formats the complete module tree with rustfmt, and restores workspace lint inheritance. Public crate metadata and README introduction are authored in `scripts/client-presentation/rust.json` and `rust.md`, then applied by `scripts/normalize-rust-presentation.mjs`. Build/dependency/version settings remain authored in `Cargo.toml` and are preserved during isolated regeneration. `examples/` is authored consumer code and is not replaced by codegen. Run `pnpm verify:generated` for isolated output freshness validation. Release versions in `Cargo.toml` are reviewed decisions: inspect generation for overwritten versions, dependencies, or manifest settings. Keep authored guidance when cleaning generated output.

From the repository root, after regenerating the Data API OpenAPI input:

```bash
pnpm codegen:client:api:rust
cargo fmt --all -- --check
cargo check -p iracing-data-api-client
cargo test -p iracing-data-api-client
```

Generation requires Java/OpenAPI Generator and Rust/rustfmt. Inspect generated diffs, including Cargo metadata and documentation, and run focused Rust checks through `pnpm verify:rust`, which CI also runs. Report unavailable toolchains or dependency downloads instead of treating unrun checks as passing. A shared contract change also requires the Fetch and Axios generation/builds.
