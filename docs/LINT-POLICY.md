# ESLint quality policy

[eslint.config.mjs](../eslint.config.mjs) uses ESLint flat config and the
`typescript-eslint` presets. Run `pnpm lint` for the complete configured surface,
`pnpm test:lint-policy` for the configuration/JSDoc regression tests, and
`pnpm verify` for the repository's full pre-merge contract.

## Authored runtime TypeScript

Authored TypeScript in apps, packages, and top-level examples receives
`strictTypeChecked` and `stylisticTypeChecked` through Project Service. Real files
use their owning TypeScript project. The three existing virtual policy fixtures
retain their explicit `allowDefaultProject` entries; their default project uses
the CLI's strict compiler settings because the root solution only has references.

| Constraint                                    | Limit | Severity |
| --------------------------------------------- | ----- | -------- |
| Function lines, excluding comments and blanks | 60    | Error    |
| Statements per function                       | 30    | Error    |
| Parameters per function                       | 4     | Error    |
| Block nesting                                 | 3     | Error    |
| Nested callbacks                              | 3     | Error    |
| Cognitive complexity                          | 12    | Error    |
| Cyclomatic complexity                         | 12    | Warning  |

Only the selected SonarJS rules are enabled, covering cognitive complexity,
duplicated branches/functions/conditions/expressions, gratuitous expressions,
and nested switches. Core control-flow rules and typed correctness rules apply
alongside the presets. Public API JSDoc coverage, meaningful descriptions,
placeholder rejection, and direct Zod projection handling remain unchanged.

The same public API documentation rules apply to `eslint.config.mjs`: exported
functions and classes require descriptive JSDoc, including rejection of empty or
placeholder descriptions. Internal helpers remain outside public API coverage.

Tests, fixtures, nested verification examples, and vendor paths retain their
runtime-policy exclusions. Tests still receive baseline correctness, import,
Unicorn, and formatting checks. JavaScript/CommonJS receives non-type-aware
rules, with CommonJS globals and require imports enabled only for `.cjs` files.

## Imports and architecture

Import resolution uses `eslint-plugin-import-x` with the TypeScript resolver,
project references, workspace links, package exports, and project path aliases.
Unresolved imports fail lint. Import ordering retains the existing groups,
alphabetization, alias placement, and no-blank-lines policy.

Boundary elements come from `workspace-policy.json`; manifests supply supported
public imports. More deeply nested workspaces are classified first. Policies
allow ordinary dependencies, then enforce these existing directions:

- Reusable packages cannot import application composition.
- Applications cannot import other applications.
- Cross-package imports must use the package name or an exported subpath.
- Generated clients cannot import authored packages, apps, or examples.

Boundary policies use last-match precedence: public-surface allows follow their
corresponding crossing restrictions, and the generated-leaf restriction comes
last. The resolver still checks whether an allowed package/subpath actually exists.
TypeScript checks conflicting exports; `import-x/export` is disabled only for
TypeScript because it incorrectly rejects valid re-exports of the same symbol
through multiple public barrels.

Generated TypeScript receives only architectural checks. Its processor removes
the generator's exact blanket disable marker from lint input without changing
files or diagnostic offsets. Other inline configuration is disabled there.
Generated sources remain outside authored formatting and maintainability rules.

## Suppressions and compatibility

Unused disable directives and unused inline configurations are errors. Authored
disable directives require descriptions. Narrow source exceptions explain
runtime behavior TypeScript cannot model, such as `JSON.stringify` returning
undefined and exceptional cleanup paths retaining temporary files. Other retained
exceptions cover sanitized errors that must discard upstream response objects,
a Promise-only endpoint callback, historical deprecated re-exports, and a Docker
fixture import whose target exists only inside the image.

Generated Fetch clients use `typeof globalThis.fetch` instead of a DOM-only fetch
alias. The authored post-processing hook applies this host-independent declaration
to both Fetch branches; it supports typed Node consumers without adding DOM globals.

The OAuth client's optional protected-request arguments are now grouped in the
fourth argument: `makeProtectedRequest(sessionId, method, path, { headers, body,
options })`. Existing three-argument calls are unchanged; callers using the old
positional optional arguments must migrate. This is a public API change to review
for the independently versioned OAuth client; this tooling task does not publish
or bump any package.

To reapply only the generated Fetch runtime declaration adjustment:

```bash
node scripts/normalize-fetch-runtime.mjs packages/api/client/fetch/src/runtime.ts
node scripts/normalize-fetch-runtime.mjs packages/oauth/client/generated/src/runtime.ts
pnpm verify:generated
```

Only those two generated `runtime.ts` files change. The generator's shared
post-processing hook also applies this adjustment during ordinary regeneration.
ESLint receives an explicit root configuration path there because ESLint 10
searches for configuration from each linted file, including isolated temporary
outputs used by freshness verification.
