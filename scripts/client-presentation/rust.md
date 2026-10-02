# iRacing Data API Rust client

Typed Rust client generated from this repository's maintained iRacing Data API OpenAPI contract. OAuth authentication is managed separately; configure a bearer access token for Data API requests.

## Installation

```toml
[dependencies]
iracing-data-api-client = "{{version}}"
```

Enable `rustls-tls` or `native-tls` when your application needs HTTPS transport through this client. See [repository guidance](https://github.com/racedirector/iracing-data-api/blob/main/AGENTS.md) for canonical sources and regeneration, and [release instructions](https://github.com/racedirector/iracing-data-api/blob/main/docs/RELEASING.md) before publishing.

## License

[MIT](https://github.com/racedirector/iracing-data-api/blob/main/LICENSE).
