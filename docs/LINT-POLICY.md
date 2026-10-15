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
alongside the presets. Public API documentation follows the JSDoc policy below.

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

## Explicit public API documentation

The authored documentation block uses `eslint-plugin-jsdoc` 65.3.4 directly,
with TypeScript parsing but without a preset that removes JSDoc types. Authored
production TypeScript under `apps/**` and `packages/**` requires documentation
for exported functions, callable values, classes, interfaces, enums, type aliases,
public constants, and directly declared public class and interface members.
Private, protected, and ECMAScript private class members are outside presence
checks. Direct `z.infer` and `z.input` aliases remain owned by their source schema;
wrappers around those aliases still need their own documentation.

`require-param`, `check-param-names`, and `require-param-name/type/description`
check parameter coverage and explicit annotations. `require-returns` and
`require-returns-type/description` check value-returning functions, async functions,
and interface call signatures. `require-throws` detects explicit throw statements;
`valid-types` requires a type for every throws tag, and `match-description` requires
an error condition. Property tags have corresponding presence, name, type, and
description checks. Void interface signatures currently require an explicit
`@returns {void}` tag as well.

`require-description`, `informative-docs`, and `match-description` reject empty,
name-repeating, and known placeholder descriptions. Complete-sentence and asterisk
prefix rules keep prose consistent. Alignment, tag names, type expressions, and
supported tag values are checked by the plugin. Preferred tags are `@param`,
`@returns`, `@throws`, `@see`, and `@deprecated`; deprecated APIs still need a body
description and a deprecation explanation.

Use the authoritative contract defining the behavior in `@see`, with official
JSDoc inline links: `@see {@link https://example.org/contract|Contract title}`.
`normalize-see-links` normalizes labeled links to the pipe form and wraps bare
HTTP URLs. It does not fetch links, verify availability, decide authority, or
require a source link where semantics derive from an upstream contract. Those
remain review responsibilities. See the [official JSDoc link syntax](https://jsdoc.app/tags-see).

Static checks do not establish prose accuracy or discover all delegated,
propagated, asynchronous, transport, validation, or authentication failures.
Read implementations and callers before adding error tags; document supported
error conditions and types without inventing generic guarantees. The installed
plugin also cannot identify separately exported TypeScript interfaces/type aliases
through its runtime export map; declare these contracts inline with `export` so
presence and member checks can see them. Separately exported runtime functions
and initialized constants are covered.

Tests, fixtures, generated clients/code, vendored files, build output, and examples
retain their existing exclusions because they are not authored production API
contracts. Existing JSDoc comments in authored code receive tag validity checks,
but private implementation helpers do not acquire a blanket documentation
requirement. `pnpm test:jsdoc-policy` exercises the actual ESLint configuration.
