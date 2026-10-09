# Workspace ownership and publication policy

Read [workspace-policy.json](../workspace-policy.json) for classifications and maintenance areas, [pnpm membership](../pnpm-workspace.yaml) and [Cargo membership](../Cargo.toml) for workspace inclusion, and [managed releases](../dist-workspace.toml) for publication membership. Read package identities, versions, dependencies and scripts from manifests.

The authoritative enforcement and rationale live in [check-topology.js](../scripts/check-topology.js), with [mutation tests](../scripts/check-topology.test.js). Classification alone does not establish a publishing workflow. Publishing a private tool requires an explicit policy and release-model decision. For an ineligible release request, stop publication and use the read-only impact report to explain affected dependents; neither their involvement nor a package name authorizes a release.

## Validation

Install dependencies with the pinned pnpm version, then run:

```bash
pnpm check:topology
pnpm test:topology
# Validate a prospective npm release target too:
pnpm check:topology --release @iracing-data/oauth-client
```

## Changing topology

1. Add or remove the package and its policy entry, including name, ecosystem, kind and ownership area.
2. Update pnpm or Cargo membership and root TypeScript references as appropriate. Remove globs that no longer match a package.
3. Set publication flags consistently with the reviewed classification. Public runtime workspace dependencies must also be public.
4. Review managed release membership and workflow suitability. Preserve generator ownership when changing generated packages; a Cargo classification does not add Cargo publishing automation.
5. Run both validation commands and [change impact](CHANGE-IMPACT.md), then the [verification contract](VERIFICATION.md). Follow [release procedures](RELEASING.md) separately if publication is intended.
