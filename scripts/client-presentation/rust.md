# iRacing Data API Rust client

Typed Rust client generated from this repository's maintained iRacing Data API OpenAPI contract. OAuth authentication is managed separately; configure a bearer access token for Data API requests.

## Installation

```toml
[dependencies]
iracing-data-api-client = { version = "{{version}}", features = ["rustls-tls"] }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Install the independently versioned crate from [crates.io](https://crates.io/crates/iracing-data-api-client) once the desired version is published. The repository version may be ahead of published releases. HTTPS requires `rustls-tls` (shown above) or `native-tls`; the crate has no default TLS feature.

## First Data API call

Obtain an iRacing OAuth bearer access token with permission to access the Data API and set `IRACING_ACCESS_TOKEN` in your environment. This crate does not acquire or refresh tokens. See the [authentication guidance](https://github.com/racedirector/iracing-data-api/tree/main/packages/oauth/client#readme) for the OAuth requirements and an independently maintained TypeScript authentication client.

In your application's `src/main.rs`:

```rust
use iracing_data_api_client::apis::{configuration::Configuration, doc_api};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut configuration = Configuration::new();
    configuration.bearer_access_token = Some(std::env::var("IRACING_ACCESS_TOKEN")?);
    let docs = doc_api::get_docs(&configuration).await?;
    println!("{docs:#?}");
    Ok(())
}
```

Run `cargo run` to request `/data/doc`. HTTP and token failures propagate as errors. For a member lookup that also follows the returned data link, see the authored [member example](https://github.com/racedirector/iracing-data-api/blob/main/crates/iracing-data-api-client/examples/get_member.rs). From a repository checkout, run:

```bash
cargo run -p iracing-data-api-client --features rustls-tls --example get_member -- --access-token "$IRACING_ACCESS_TOKEN" --customer-ids 378767 --include-licenses
```

## Reference, generation, and releases

The generated endpoint and model reference follows below; published Rust documentation is available on [docs.rs](https://docs.rs/iracing-data-api-client) after publication. The [Data API OpenAPI contract](https://github.com/racedirector/iracing-data-api/blob/main/openapi/iracing.json) is the source for generated Rust API code. Repository-owned presentation templates preserve this introduction and Cargo metadata during regeneration.

See [repository guidance](https://github.com/racedirector/iracing-data-api/blob/main/crates/iracing-data-api-client/AGENTS.md) for canonical sources and deterministic regeneration. The crate has its own Cargo version and release process; npm package versions do not select its version. Follow the [Rust release procedure](https://github.com/racedirector/iracing-data-api/blob/main/docs/RELEASING.md#rust-crate-releases) before publishing.

## License

[MIT](https://github.com/racedirector/iracing-data-api/blob/main/LICENSE).
