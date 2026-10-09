# Security

## Report a vulnerability privately

Use GitHub's [private vulnerability reporting form](https://github.com/racedirector/iracing-data-api/security/advisories/new) for this repository. Sign in to GitHub, open the form, and send the report to repository maintainers. Do not open a public issue or PR containing vulnerability details before maintainers have had an opportunity to investigate and coordinate disclosure.

Include the affected package and version or commit, expected and observed behavior, impact, and a minimal reproduction using synthetic or redacted data. Explain any required environment or configuration. Never include a real password, client secret, access token, refresh token, credential document, or private iRacing account data. If a credential has been exposed, revoke or rotate it through the appropriate provider; a private report does not revoke credentials.

## Security-sensitive scope

Report OAuth and credential vulnerabilities privately, including authorization/callback validation failures, token leakage, unsafe token persistence, refresh-token rotation or ownership failures, and secrets exposed in logs or diagnostics. The same route covers authentication bypass, unintended network or filesystem access, and vulnerabilities in generated clients, schemas, CLI tools, or the local MCP application.

Ordinary bugs and feature requests can use the [public issue forms](https://github.com/racedirector/iracing-data-api/issues/new/choose) after removing sensitive information. When unsure whether a report exposes a vulnerability, use the private form first.

## Version expectations

Packages are independently versioned; identify the exact affected package release rather than only a monorepo revision. Maintainers assess reports against current source and published versions. The project does not promise long-term support or security backports for a fixed version range. See [release instructions](docs/RELEASING.md) for package release boundaries.
