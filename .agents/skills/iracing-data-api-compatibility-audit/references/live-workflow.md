# Live Data API compatibility workflow

A compatibility audit must start from current authoritative upstream information when access is available. Retrieve the Data API documentation once for the audit run through the repository CLI/generated-client boundary, then perform deterministic structural and semantic review against the current working tree.

## Build the concrete owners

From the repository root:

```bash
pnpm --filter '@iracing-data/cli...' --filter '@iracing-data/api-schema-to-openapi...' build
```

Use the repository Node/pnpm versions and frozen dependencies. This does not require write-mode code generation.

## Retrieve current documentation and compare it

With credentials available through the normal CLI precedence, stream the current documentation directly into the comparator:

```bash
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs \
  | node -r ts-node/register scripts/audit-data-docs.cjs -
```

To select another ignored credential file, add `--credentials <path>` to `docs`.

If inspection of the raw current document is necessary during the same audit run, use a private system-temporary directory rather than a repository evidence convention:

```bash
tmp_dir="$(mktemp -d)"
chmod 700 "$tmp_dir"
node --env-file-if-exists=.env apps/iracing-data-cli/dist/index.js docs --output "$tmp_dir/data-docs.json"
node -r ts-node/register scripts/audit-data-docs.cjs "$tmp_dir/data-docs.json"
rm -rf "$tmp_dir"
```

The temporary file is a convenience for that run, not durable upstream truth. Retrieve current documentation again on a later audit rather than reusing it as authority.

`iracing-data docs` uses the generated Fetch `DocApi`; it does not fetch endpoint links from the returned documentation. The structural comparator performs no network access and writes no files. Exit 0 means no structural candidates, 2 means reviewable discrepancies/schema rejection, and 1 means audit execution failure.

## Deterministic regression checks

```bash
pnpm test:compatibility-audits
pnpm check:service-client-boundary
pnpm test:service-client-boundary
```

These checks establish repository mechanics and ownership rules only. They do not establish current live compatibility.

## Semantic review remains necessary

For every current structural candidate, inspect the maintained schema, endpoint mapping/OpenAPI, generated clients, runtime consumers and tests. Review upstream notes, enum/range constraints, conditional requirements, coercion and wire serialization separately. `/data/doc` does not define complete endpoint response payloads.

Do not infer historical drift merely because current upstream documentation and repository code differ. Report a confirmed upstream change only when independent historical evidence establishes both states.

Application resolution of opaque signed/cache/chunk URLs returned by a typed Data API response is not a modeled-service bypass. Review that behavior under the application owner's host/path validation, expiry, caching, coalescing and retention policy.

## Repair ordering when requested

For modeled endpoints, fix maintained schema/endpoint mapping first, regenerate OpenAPI/clients through the existing pipeline, then update runtime consumers/tests as required. Do not introduce a handwritten HTTP fallback when the generated client is incomplete; fix the maintained generation path.

For application-owned returned links, keep changes with the concrete application owner. Do not move that resolution into a generic repository evidence/transport layer.
