# Audit method and output contract

## Semantic comparison matrix

Create one row per meaningful protocol rule. A useful working table has:

| Surface           | Official contract                             | Schema/types               | Runtime client              | Tests/docs/generated | Result                                | Evidence                   |
| ----------------- | --------------------------------------------- | -------------------------- | --------------------------- | -------------------- | ------------------------------------- | -------------------------- |
| endpoint or field | method, presence, value, condition, lifecycle | accepts/rejects/normalizes | sends/parses/stores/retries | what locks behavior  | match/mismatch/ambiguous/out of scope | official URL + file/symbol |

Model presence as separate states: **required**, **optional/omitted**, **nullable**, and **conditionally included/required**. Record exact literal casing and wire names. For schemas, distinguish input and output types, Zod defaults/transforms, unknown-key behavior, and the inferred TypeScript type.

## Required coverage

### Endpoints and transport

- Base URL, endpoint path, method, authentication, `Authorization` construction, success/error status, redirect behavior, `Content-Type`, query/form body, percent encoding, and response headers.
- Newly documented endpoints: classify as required, recommended, optional capability, or intentionally out of scope based on current package responsibility.

### Requests and responses

- Every field's name, primitive shape, requiredness, nullability, conditional rule, default, literal/union values, whitespace-delimited representation, and relationship to client type or another parameter.
- Inspect dependency source/types where a protocol helper may lowercase, coerce, discard, or synthesize fields. Report raw-wire compatibility separately from compatibility after that normalization.
- Ensure callback success and redirect-error shapes are not conflated.
- Ensure runtime response parsing actually uses the schema where claimed.

### Lifecycle and security

- Authorization-code use, access/refresh expiration, dynamic lifetime fields, refresh rotation and single use, storage replacement, and reauthentication fallback.
- PKCE requirement by client type, verifier character/length rules, supported method, challenge derivation, and parameter transmission.
- Masking hash, secret/identifier order, identifier normalization, UTF-8 input, standard versus URL-safe Base64, padding, and form encoding order. Treat any mismatch as security-sensitive.
- Token/code opacity. Advanced JWT parsing may exist, but core client behavior must not depend on undocumented or explicitly unstable token internals.
- JWT header/payload presence, conditional claims, signature verification, `alg`, `jku`, TLS/domain/redirect constraints, verified-versus-decoded data, time checks, issuer, audience, environment, and scopes.

### Errors, scopes, and throttling

- Redirect errors versus JSON errors; fields, optional `state`, documented codes/statuses, endpoint applicability, and information retained for consumers.
- Treat error codes as open unless repository policy and official docs justify closure.
- Requested versus granted scopes; the server may remove or add scopes. Strict request literals and extensible response values require separate judgments.
- Rate-limit and retry headers, HTTP behavior, Password Limited startup-only guidance, and whether retries could amplify lockouts.

### Session and revocation surfaces

- Profile/session shapes, all time fields, list-versus-string fields, opaque session IDs, snake_case wire parameters, authorization, content type, and empty successful responses.
- Do not classify missing runtime wrappers as defects merely because the schema/OpenAPI surface describes the endpoint.

## Evidence and classification

For every finding, cite at least one live official page and one repository file/symbol. Use git history or the saved baseline only to establish provenance.

Classifications:

- **confirmed upstream change**: authoritative evidence proves the previous official contract differed;
- **current compatibility mismatch**: live docs and current implementation disagree, without proven history;
- **unsupported capability**: documented behavior is absent but not necessarily required by the library's current scope;
- **implementation bug**: repository components disagree or runtime behavior violates the contract already represented by the repository;
- **ambiguous documentation**: official sources do not establish one safe interpretation;
- **no action required**: checked surface is compatible or deliberately out of scope.

Severity:

- **P1 — Required**: likely authentication/token failure, invalid request or rejected valid response, lost refresh continuity, or security-sensitive incompatibility.
- **P2 — Should address**: meaningful contract discrepancy, error/recovery gap, forward-compatibility weakness, or relevant unsupported behavior that does not normally break authentication immediately.
- **P3 — Optional / cleanup**: optional capability, hardening, docs, naming, generated-description quality, or missing low-risk tests.

Breaking impact must be assessed separately from severity. A necessary P1 schema correction may still be a breaking public API.

## Required report format

Start with exactly one status:

- **Compatible**
- **Compatibility issues found**
- **Unable to verify part of the protocol**

Follow with a short scope summary identifying the packages and current-tree revision/status examined.

Group findings under `P1 — Required`, `P2 — Should address`, and `P3 — Optional / cleanup`. Omit an empty group or state `None`.

Each finding must include:

```text
Finding:
Classification:
Official documentation:
Current repository behavior:
Affected package(s):
Affected file(s) / symbol(s):
Impact:
Recommended change:
Tests to add or update:
Breaking public API?: yes | no | possibly
Confidence: high | medium | low
```

End with:

### Recommended implementation order

Give a dependency-aware order: canonical schema changes before client consumers and generated contracts; security/token-continuity fixes before optional endpoint additions. Mention rollout or migration needs for breaking API changes.

### No-action findings

List important compatible or intentionally out-of-scope surfaces that were actually checked, with concise evidence. Include masking and PKCE when checked.

### Documentation coverage

List every official iRacing page examined during this execution and identify any relevant page that could not be verified.

### Limits and assumptions

State unavailable live sources, unexecuted integration tests, lack of credentials, ambiguous docs, dirty-tree constraints, or history gaps. Never imply that source inspection proves live-server behavior.

## Optional implementation follow-up

If the user explicitly asks to implement findings, first propose or confirm the selected findings and public-API strategy. Add characterization/unit/integration tests as appropriate, update the closest docs, regenerate only affected output, and validate with the narrowest pnpm package commands before broader lint/style/build checks.
