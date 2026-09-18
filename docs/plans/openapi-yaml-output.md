# Plan: YAML Output Support for `*-schema-to-openapi` Helpers

> **Status: Complete as of 2026-09-18 — all phases done; plan retired**

## Problem Statement

Today `@iracing-data/api-schema-to-openapi` and `@iracing-data/oauth-schema-to-openapi`
can only emit OpenAPI as JSON. Consumers that prefer a YAML spec (manual review, git diffs,
Redoc/spec tooling default workflows) must post-convert the JSON themselves, adding a
fragile extra step. Neither the library API nor the `iracing-api-openapi` /
`iracing-oauth-api-openapi` CLIs expose a format choice.

## Proposal

Add opt-in YAML serialization to both helper packages. The in-memory document produced by
`zod-openapi`'s `createDocument()` stays the single source of truth; serialization is a thin
branch — `JSON.stringify` (today) vs `yaml.stringify` (new) — inside `generateOpenAPISpec`.

Scope is bounded to:

- the two helper packages (`src/index.ts`, `src/cli.ts`, `package.json`, `README.md`)
- root `package.json` codegen scripts (additive `:yaml` variants; existing JSON scripts untouched)

This implements the tooling change described in the repo's codegen stack (root `package.json`
`codegen*` scripts). No PRD or FEATURE_STATE exists in this repo yet; if/product-planning
work is introduced later, this plan should be cross-referenced there.

## Decisions

| Decision                     | Choice                                                                                                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| YAML library                 | `yaml` (eemeli) over `js-yaml` — `yaml.stringify` calls `toJSON()` exactly like `JSON.stringify`, guaranteeing serialization parity; `js-yaml` does not, which risks silent output divergence |
| Format selection             | Infer from `fileName` extension (`.yaml`/`.yml`) with an explicit `--format json\|yaml` / `format` override; default remains `"json"`                                                         |
| Backward compatibility       | Default output stays JSON; existing root `codegen:openapi:*` and downstream `codegen:client:*` scripts are untouched                                                                          |
| Where serialization lives    | Inside `generateOpenAPISpec`; CLIs stay thin pass-throughs of one option                                                                                                                      |
| Shared code between packages | No shared helper extracted — each package already duplicates the same small pattern, and per AGENTS.md changes stay scoped to the nearest package                                             |
| Root scripts                 | Add new `codegen:openapi:*:yaml` scripts rather than modifying existing ones                                                                                                                  |

## Component Architecture

### Layer Separation

```text
CLI layer (cli.ts)            ← commander flags, path/format resolution
  Generator (index.ts)         ← createDocument() → serialize → write
    Schema packages             ← @iracing-data/*-schema (zod schemas)
```

The generator layer owns the full pipeline today (build → serialize → write). This change
only modifies the serialize step; no new layers are introduced.

### Layer Table

| Layer     | Responsibility                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------- |
| CLI       | Parse `-o/--output`, `-f/--file`, `--format`; forward to generator; log output path                |
| Generator | Build OpenAPI doc via `createDocument()`; serialize as JSON or YAML; ensure output dir; write file |
| Schema    | Provide zod schemas consumed by `createDocument()`                                                 |

### File Structure Tree

```text
package.json                                            MODIFY  add `yaml` dep to api-schema-to-openapi
packages/helpers/api-schema-to-openapi/
  ├── package.json                                      MODIFY  add `yaml` dependency
  ├── README.md                                         UPDATE  document `format` + YAML flag
  └── src/
      ├── index.ts                                      MODIFY  `format` option + YAML serialization branch
      └── cli.ts                                        MODIFY  `--format` flag + extension inference

packages/helpers/oauth-schema-to-openapi/
  ├── package.json                                      MODIFY  add `yaml` dependency
  ├── README.md                                         UPDATE  document `format` + YAML flag
  └── src/
      ├── index.ts                                      MODIFY  `format` option + YAML serialization branch
      └── cli.ts                                        MODIFY  `--format` flag + extension inference

package.json (root)                                     MODIFY  add `codegen:openapi:api:yaml` / `codegen:openapi:oauth:yaml` scripts
docs/plans/openapi-yaml-output.md                       NEW     this plan
```

Both helper packages receive identical, parallel edits; the oauth variant is smaller because
its `createDocument()` input is smaller, but the diff shape is the same.

## Data Access Patterns

There is no external data source; zod schemas are imported statically at build time.

### Reads Table

| Data             | Preferred approach                                     | Fallback |
| ---------------- | ------------------------------------------------------ | -------- |
| OpenAPI document | `createDocument()` in-memory from imported zod schemas | n/a      |

### Mutations Table

The only writes are filesystem outputs inside `generateOpenAPISpec`.

| File                           | Function name         | Method                         | Body / Notes                                                                     |
| ------------------------------ | --------------------- | ------------------------------ | -------------------------------------------------------------------------------- |
| `src/index.ts` (both packages) | `generateOpenAPISpec` | synchronous `fs.writeFileSync` | resolves `outputDir/fileName`, unlinks existing file, writes serialized document |

## Role Guards

| Required role | Page or Action                                                                         |
| ------------- | -------------------------------------------------------------------------------------- |
| n/a           | These are build-time CLI helper packages — no routes, auth, or user-facing pages exist |

## Risks & Mitigations

| Risk                                                                              | Likelihood | Mitigation                                                                                                                    |
| --------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| YAML/JSON serialization divergence (`undefined`, arrays, `Date`, custom `toJSON`) | Medium     | Use `yaml` (calls `toJSON` like `JSON.stringify`); verify via round-trip test parsing YAML and deep-equal against JSON output |
| `$ref` / keys starting with special characters render unquoted                    | Low        | `yaml` quotes `$`-prefixed keys automatically; confirm in validation                                                          |
| Default behavior changes break downstream `openapi-generator-cli` consumers       | Low        | Default stays JSON; add only new `:yaml` scripts                                                                              |
| New `yaml` dependency surface                                                     | Low        | Single, dependency-free-ish, widely used package; per-package scoped install                                                  |
| YAML file loses formatting/large-spec readability                                 | Low        | `yaml.stringify` emits indented flow by default; acceptable for generated artifacts                                           |

## Definition of Done

### User Stories

- As a CLI consumer, I can run `iracing-api-openapi -o ./openapi -f iracing.yaml` so that I get a YAML OpenAPI spec.
- As a CLI consumer, I can run `iracing-api-openapi -o ./openapi -f f.yaml --format json` so that I can force a format regardless of the file extension.
- As a library consumer, I can call `generateOpenAPISpec({ format: "yaml", ... })` so that output is YAML without changing the file extension.
- As an existing consumer, I can keep my current JSON output unchanged so that the client codegen pipeline is not affected.

### Validation

Must include:

- `pnpm build --filter @iracing-data/api-schema-to-openapi --filter @iracing-data/oauth-schema-to-openapi`
- `pnpm lint` and `pnpm style` (or `pnpm format`) per AGENTS.md
- Smoke test per phase:
  - Phase 1 smoke: emit `openapi.yaml` via a node one-liner through `generateOpenAPISpec({ format: "yaml" })`; parse the file back with `yaml.parse` and deep-equal against the JSON document.
  - Phase 2 smoke: run both CLIs with `-f iracing.yaml` / `-f oauth.yaml` and `--format json`; confirm files match expected shape.
  - Phase 3 smoke: run root `pnpm codegen:openapi:api:yaml` and `pnpm codegen:openapi:oauth:yaml`; diff-extract YAML != existing JSON uname output is expected, and client `codegen:client:*` scripts still consume existing JSON.

## Phased Delivery

### Summary Table

| Phase   | Goal                         | Key Outputs                                                                 |
| ------- | ---------------------------- | --------------------------------------------------------------------------- |
| Phase 1 | YAML serializer + API option | `yaml` dep, `format` option + serialization branch in both `index.ts`       |
| Phase 2 | CLI + root script support    | `--format` flag, extension inference, `codegen:openapi:*:yaml` root scripts |
| Phase 3 | Docs + full validation       | README updates, plan retirement, full smoke checks                          |

### Phase 1 — YAML Serializer + API Option

Status: Complete as of 2026-09-18

- [x] `packages/helpers/api-schema-to-openapi/package.json` — criterion: `yaml` present in `dependencies` and `pnpm install` resolves it
- [x] `packages/helpers/oauth-schema-to-openapi/package.json` — criterion: `yaml` present in `dependencies` and `pnpm install` resolves it
- [x] `packages/helpers/api-schema-to-openapi/src/index.ts` — criterion: `GenerateOpenAPISpecOptions` accepts `format?: "json" | "yaml"` (default `"json"`, inferred from `.yaml`/`.yml` extension); `fs.writeFileSync` writes `yaml.stringify(document)` when YAML, `JSON.stringify(document)` otherwise; behavior unchanged when option is absent
- [x] `packages/helpers/oauth-schema-to-openapi/src/index.ts` — criterion: identical option/serialization branch as the api package
- [x] `pnpm build --filter @iracing-data/api-schema-to-openapi --filter @iracing-data/oauth-schema-to-openapi` — criterion: both packages compile clean

Phase 1 smoke: `generateOpenAPISpec({ format: "yaml" })` wrote `openapi.yaml` (via `yaml` pkg, `dist/index.js`); parsing the file and deep-equaling against JSON emission passed (151 paths, api package). Note: `pnpm` was unavailable on PATH in this environment, so the build was validated by running each package's `tsc --build tsconfig.build.json` directly.

### Phase 2 — CLI + Root Script Support

Status: Complete as of 2026-09-18

- [x] `packages/helpers/api-schema-to-openapi/src/cli.ts` — criterion: adds `--format <json|yaml>`; resolves `formatFlag ?? inferFrom(file) ?? "json"`; help text documents it; `-f` default description mentions `.yaml`/`.yml` inference
- [x] `packages/helpers/oauth-schema-to-openapi/src/cli.ts` — criterion: same CLI change as the api package
- [x] `package.json` (root) — criterion: `codegen:openapi:api:yaml` → `iracing-api-openapi -o ./openapi -f iracing.yaml` and `codegen:openapi:oauth:yaml` → `iracing-oauth-api-openapi -o ./openapi -f oauth.yaml` run successfully; existing `codegen:openapi:*` scripts unchanged

Phase 2 smoke: ran both CLIs with `-f openapi.yaml`, `-f openapi.yml`, and `-f forced.yaml --format json`. Emitted YAML parses to `openapi: 3.1.1` with expected `info`/`paths` (api: 151 paths; oauth: 7 paths); `--format json` on a `.yaml` filename produces JSON with identical shape. Invalid `--format xml` rejected by commander choices (`error: option '--format <format>' argument 'xml' is invalid`). `--help` documents `--format (choices: "json", "yaml")` and `.yaml/.yml` inference in the `-f` description. Note: packages built with `pnpm --filter <pkg> build` (pnpm v12 requires `--filter` before the script name).

### Phase 3 — Docs + Full Validation

Status: Complete as of 2026-09-18

- [x] `packages/helpers/api-schema-to-openapi/README.md` — criterion: documents `format` option and `--format` flag with examples
- [x] `packages/helpers/oauth-schema-to-openapi/README.md` — criterion: documents `format` option and `--format` flag with examples
- [x] `docs/plans/openapi-yaml-output.md` — criterion: all Phase 1–3 tasks `[x]`, smoke tests recorded, status lines updated to `Complete as of YYYY-MM-DD`
- [x] Validation run — criterion: `pnpm lint`, `pnpm style`, both smoke narratives above pass; a PR description notes generated artifacts and the codegen command used to produce them

Phase 3 smoke: `pnpm codegen:openapi:api:yaml` and `pnpm codegen:openapi:oauth:yaml` both ran successfully, emitting `openapi/iracing.yaml` and `openapi/oauth.yaml`; raw YAML differs from the existing JSON (as expected) while parsed YAML deep-equals the JSON doc (iracing: 151 paths; oauth: 7 paths). Client codegen still consumes JSON: `scripts/openapi-generator-{axios,fetch,rust}.sh` all reference `openapi/iracing.json`; the typescript-axios generator was run end-to-end against `openapi/iracing.json` (to a temp output) and produced a client successfully.

Validation run notes: packages build clean with `pnpm --filter @iracing-data/api-schema-to-openapi --filter @iracing-data/oauth-schema-to-openapi build`; `pnpm exec eslint` and `pnpm exec prettier --check` pass on every changed file. Repo-wide `pnpm lint` / `pnpm style` remain red on pre-existing artifacts unrelated to this work — lint on nested `dist/**` outputs (the ESLint config only ignores a root-level `dist/**`) and style on generated output (crates/client docs, example outputs, `pnpm-lock.yaml`, `tsconfigs`, existing `openapi/*.json`). No changed source, README, or plan file appears in either failure set.

Generated artifacts for the PR description: `openapi/iracing.yaml` and `openapi/oauth.yaml`, regenerated with `pnpm codegen:openapi:api:yaml` and `pnpm codegen:openapi:oauth:yaml` after `pnpm --filter @iracing-data/api-schema-to-openapi --filter @iracing-data/oauth-schema-to-openapi build`. (pnpm was enabled in this environment via `corepack prepare pnpm@12.4.2 --activate`; `pnpm-lock.yaml` carries the `yaml@2.9.1` addition from package.json.)

## Cross-References

- PRD: none exists in this repo — reference this plan from any future product-planning or FEATURE_STATE doc describing codegen capabilities
- FEATURE_STATE: none exists in this repo — create an entry when the registry is introduced
- Dependent plans: none
