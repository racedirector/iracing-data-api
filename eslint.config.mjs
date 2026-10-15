import { readFileSync } from "node:fs";
import eslintJs from "@eslint/js";
import { rules as eslintCommentRules } from "@eslint-community/eslint-plugin-eslint-comments";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import boundaries from "eslint-plugin-boundaries";
import importPlugin, {
  flatConfigs as importConfigs,
} from "eslint-plugin-import-x";
import jsdocPlugin from "eslint-plugin-jsdoc";
import eslintPluginPrettier from "eslint-plugin-prettier";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import {
  configs as tsConfigs,
  parser as tsParser,
  plugin as tsPlugin,
} from "typescript-eslint";
import workspacePolicy from "./workspace-policy.json" with { type: "json" };

const nodeGlobals = globals.node;
const resolver = createTypeScriptImportResolver({
  project: "tsconfig.json",
  alwaysTryTypes: true,
});

// Workspace policy owns package membership/classification. Read manifests only
// for their public exports; do not maintain a second package inventory here.
const workspacePackages = workspacePolicy.workspaces
  .filter(({ ecosystem, path }) => ecosystem === "npm" && path !== ".")
  .map(({ path, kind }) => {
    const manifest = JSON.parse(
      readFileSync(new URL(`${path}/package.json`, import.meta.url), "utf8"),
    );

    return { path, kind, manifest };
  });

function elementType({ path, kind }) {
  if (kind === "generated-public-client") {
    return "generated";
  }

  if (path.startsWith("apps/")) {
    return "application";
  }

  return kind === "example" ? "example" : "package";
}

// The deepest package must match first: oauth/client/generated is a separate
// package inside oauth/client. Full root matching prevents accidental suffix matches.
const elements = workspacePackages
  .toSorted((left, right) => right.path.length - left.path.length)
  .map((workspace) => ({
    type: elementType(workspace),
    pattern: workspace.path,
    partialMatch: false,
  }));

function supportedImports(manifest) {
  const subpaths = Object.keys(manifest.exports ?? {})
    .filter((key) => key.startsWith("./"))
    .map((key) => `${manifest.name}/${key.slice(2)}`);

  return [manifest.name, ...subpaths];
}

// Boundaries evaluates policies in order; the last matching policy wins.
// Deny crossings into each package, then allow its manifest's public import names.
// Internal imports never match the `from` selector and remain unrestricted.
function publicSurfacePolicies({ path, manifest }) {
  const from = { element: { path: `!${path}` } };
  const to = { element: { path } };

  return [
    {
      from,
      disallow: { to },
      message:
        "Cross-package imports must use the supported package public surface.",
    },
    { from, to, allow: { dependency: { source: supportedImports(manifest) } } },
  ];
}

const publicPackagePolicies = workspacePackages
  .filter(({ path }) => path.startsWith("packages/"))
  .flatMap(publicSurfacePolicies);

const applicationIsolationPolicies = workspacePackages
  .filter(({ path }) => path.startsWith("apps/"))
  .map(({ path }) => ({
    from: { element: { type: "application", path: `!${path}` } },
    disallow: { to: { element: { path } } },
    message: "Applications compose packages, not other applications.",
  }));

// Generated modules carry a blanket ESLint directive. Remove that exact marker
// from lint input, preserving offsets and disk contents, so it cannot disable
// boundary checks. noInlineConfig below rejects all other inline configuration.
const generatedArchitectureProcessor = {
  meta: { name: "generated-architecture", version: "1.0.0" },
  preprocess(source) {
    const marker = "/* eslint-disable */";

    return [source.replaceAll(marker, " ".repeat(marker.length))];
  },
  postprocess(messages) {
    return messages.flat();
  },
};

// The shared configuration assumes ES modules. Remove CommonJS-only globals so
// no-undef can catch accidental use of require or __dirname in JavaScript modules.
// The CommonJS block restores those names for .cjs files.
const nodeModuleGlobals = Object.fromEntries(
  Object.entries(nodeGlobals).filter(
    ([name]) =>
      !["__dirname", "__filename", "exports", "module", "require"].includes(
        name,
      ),
  ),
);

const generatedTypeScript = [
  "packages/**/generated/**",
  "packages/api/client/**",
];

// File globs excluded from both API-documentation and authored-runtime rules.
// Tests and fixtures keep baseline correctness rules; generated files receive
// only architectural checks.
// Top-level examples remain subject to runtime rules, but are outside the
// apps/packages scope of the API-documentation block.
const authoredTypeScriptExclusions = [
  ...generatedTypeScript,
  // Keep executable verification, nested samples, and vendor code outside runtime policy.
  "**/*.test.ts",
  "**/*.spec.ts",
  "**/__tests__/**",
  "**/test/**",
  "**/tests/**",
  "**/fixtures/**",
  "**/__fixtures__/**",
  "apps/**/examples/**",
  "packages/**/examples/**",

  // Preserve the existing vendor exclusions from authored-runtime policy.
  "apps/**/vendor/**",
  "packages/**/vendor/**",
];

// ESLint AST selector for type aliases that need their own API documentation.
// For example, `type Options = { ... }` matches, while a direct projection such as
// `type Options = z.infer<typeof OptionsSchema>` or z.input does not: its schema
// owns the contract. Wrappers such as Partial<z.infer<...>> still match.
// This selector is reused by both JSDoc presence and description checks.
const authoredTypeAliasContext =
  "TSTypeAliasDeclaration:not([typeAnnotation.typeName.left.name='z'][typeAnnotation.typeName.right.name='infer']):not([typeAnnotation.typeName.left.name='z'][typeAnnotation.typeName.right.name='input'])";

// AST selectors identifying inline exported declarations whose existing JSDoc
// must have a meaningful description. Used by jsdoc/require-description and
// jsdoc/match-description; jsdoc/require-jsdoc separately checks comment presence.
//
// Covers named/default functions and classes, named interfaces/enums/type aliases,
// and exported variables initialized with a function or class expression. Ordinary
// exported values and re-exports do not match. For example, `export const run =
// () => {}` matches, while `export const version = "1"` does not.
//
// Selector syntax: :has(...) requires a matching descendant, `>` means a direct
// child, and :not(...) in authoredTypeAliasContext excludes direct Zod projections.
const documentedExportContexts = [
  "ExportNamedDeclaration:has(> FunctionDeclaration)",
  "ExportNamedDeclaration:has(> ClassDeclaration)",
  "ExportNamedDeclaration:has(> TSInterfaceDeclaration)",
  "ExportNamedDeclaration:has(> TSEnumDeclaration)",
  `ExportNamedDeclaration:has(> ${authoredTypeAliasContext})`,
  "ExportNamedDeclaration:has(> VariableDeclaration > VariableDeclarator > ArrowFunctionExpression)",
  "ExportNamedDeclaration:has(> VariableDeclaration > VariableDeclarator > FunctionExpression)",
  "ExportNamedDeclaration:has(> VariableDeclaration > VariableDeclarator > ClassExpression)",
  "ExportDefaultDeclaration:has(> FunctionDeclaration)",
  "ExportDefaultDeclaration:has(> ClassDeclaration)",
  "ExportDefaultDeclaration:has(> ArrowFunctionExpression)",
  "ExportDefaultDeclaration:has(> FunctionExpression)",
  "ExportDefaultDeclaration:has(> ClassExpression)",
];

export default defineConfig([
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },
  // These blocks are cumulative: a file receives every matching block, and later
  // blocks override earlier settings for the same rule. A block's `ignores` only
  // excludes files from that block, except for the global-ignore block below.

  // GLOBAL EXCLUSIONS: skip these paths entirely, before applying any lint rules.
  // This block intentionally contains only `name` and `ignores`, which makes its
  // ignores global. Generated TypeScript is handled separately so dependency
  // direction is checked without imposing authored-code rules on generator output.
  {
    name: "build-and-contract-outputs",
    ignores: [
      "**/dist/**",
      "bin/**",
      "node_modules/**",
      "openapi/**",
      "iracing-proto/**",
    ],
  },
  // BASELINE FOR ALL JAVASCRIPT AND TYPESCRIPT: lint .js, .mjs, .cjs, and .ts files
  // throughout the repository, including scripts, tests, and examples.
  // Uses the TypeScript parser for all four extensions and starts with Node ES
  // module globals; the .cjs block below supplies CommonJS semantics instead.
  // Combines core, TypeScript, and import checks with Prettier formatting, import
  // order, unused-variable checks, equality checks, and restricted console use.
  // Prettier's preset disables conflicting formatting rules before our explicit
  // rules are applied. Resolution follows TypeScript project references, workspace
  // links, path aliases, and package exports through resolver-next.
  {
    name: "shared-code-quality",
    extends: [
      eslintJs.configs.recommended,
      tsConfigs.recommended,
      importConfigs.recommended,
      importConfigs.typescript,
      eslintConfigPrettier,
    ],
    ignores: generatedTypeScript,
    settings: { "import-x/resolver-next": [resolver] },
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tsParser,
      globals: nodeModuleGlobals,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@stylistic": stylistic,
      "import-x": importPlugin,
      unicorn,
      "eslint-comments": { rules: eslintCommentRules },
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
      "eslint-comments/require-description": [
        "error",
        { ignore: ["eslint-enable"] },
      ],
      "unicorn/consistent-function-scoping": "error",
      "unicorn/no-nested-ternary": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-string-starts-ends-with": "error",
      "import-x/no-unresolved": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "parent",
              position: "before",
            },
          ],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "never",
        },
      ],
      "no-console": [
        "error",
        {
          allow: [
            "warn",
            "error",
            "info",
            "debug",
            "group",
            "groupCollapsed",
            "groupEnd",
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  // DEPENDENCY DIRECTION: packages cannot consume application composition;
  // applications cannot consume one another; cross-package imports use exports.
  // The final generated-leaf policy takes precedence over public-surface allows.
  {
    name: "workspace-architecture",
    files: [
      "apps/**/*.{js,mjs,cjs,ts}",
      "packages/**/*.{js,mjs,cjs,ts}",
      "examples/**/*.{js,mjs,cjs,ts}",
    ],
    languageOptions: { parser: tsParser },
    plugins: { boundaries },
    settings: {
      "boundaries/root-path": import.meta.dirname,
      "boundaries/elements": elements,
      // Boundaries uses the resolver's compatibility API; import-x above uses
      // resolver-next. Both read the same project-reference graph.
      "import/resolver": { typescript: { project: "tsconfig.json" } },
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          policies: [
            ...publicPackagePolicies,
            ...applicationIsolationPolicies,
            {
              from: { element: { types: { anyOf: ["package", "generated"] } } },
              disallow: { to: { element: { type: "application" } } },
              message:
                "Reusable and generated packages cannot depend on application composition.",
            },
            {
              from: { element: { type: "generated" } },
              disallow: {
                to: {
                  element: {
                    types: { anyOf: ["application", "example", "package"] },
                  },
                },
              },
              message:
                "Generated clients cannot depend on authored runtime composition.",
            },
          ],
        },
      ],
    },
  },
  // Generated blanket disable comments must not bypass architecture checks.
  // These files receive only parsing and architectural boundary checks.
  {
    name: "generated-architecture-only",
    processor: generatedArchitectureProcessor,
    files: generatedTypeScript.map((pattern) => `${pattern}/*.ts`),
    linterOptions: { noInlineConfig: true },
  },
  // PUBLIC API DOCUMENTATION: require descriptive JSDoc on exported declarations
  // in authored apps/packages TypeScript and the ESLint configuration itself.
  // The selectors above define covered declarations and exempt direct Zod type
  // projections. Comments are checked for
  // presence, a body description, and empty/placeholder wording; missing comments
  // are not automatically inserted by ESLint's fixer.
  // Tests, fixtures, nested examples, and vendor files use the exclusions above;
  // top-level examples do not match this block. Internal helpers need no JSDoc.
  {
    name: "authored-api-documentation",
    files: ["apps/**/*.ts", "packages/**/*.ts", "eslint.config.mjs"],
    ignores: authoredTypeScriptExclusions,
    plugins: {
      jsdoc: jsdocPlugin,
    },
    settings: {
      jsdoc: {
        mode: "typescript",
      },
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "error",
        {
          enableFixer: false,
          publicOnly: {
            cjs: false,
            esm: true,
            window: false,
          },
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: false,
          },
          contexts: [
            "TSEnumDeclaration",
            "TSInterfaceDeclaration",
            authoredTypeAliasContext,
          ],
        },
      ],
      "jsdoc/require-description": [
        "error",
        {
          contexts: documentedExportContexts,
          descriptionStyle: "body",
          exemptedBy: ["inheritdoc", "deprecated"],
        },
      ],
      "jsdoc/match-description": [
        "error",
        {
          contexts: documentedExportContexts,
          mainDescription: {
            match:
              "/^(?!\\s*(?:TODO|TBD|FIXME|placeholder|returns? (?:the )?result|gets? (?:the )?value)\\.?\\s*$)[\\s\\S]*\\S[\\s\\S]*$/iu",
            message:
              "Exported API JSDoc must describe the contract rather than use an empty or placeholder description.",
          },
          nonemptyTags: false,
        },
      ],
    },
  },
  // LET THE TYPESCRIPT COMPILER CHECK TYPESCRIPT LANGUAGE ERRORS: for every .ts
  // file, turn off core JavaScript rules that TypeScript already checks or that
  // can misread TypeScript syntax. Examples include no-undef, no-redeclare,
  // no-dupe-class-members, and no-unreachable. JavaScript keeps the baseline rules.
  // This preset also enables no-var, prefer-const, prefer-rest-params, and
  // prefer-spread as errors (overriding the baseline's prefer-const warning).
  // It does not run the compiler or enable type-aware linting: builds/typechecks
  // remain responsible for the compiler diagnostics delegated here.
  {
    name: "typescript-compiler-compatibility",
    ignores: generatedTypeScript,
    files: ["**/*.ts"],
    rules: {
      ...tsConfigs.eslintRecommended.rules,
      // TypeScript permits re-exporting the same symbol through multiple barrels.
      // import-x/export compares names alone and flags those valid public aliases;
      // the compiler rejects genuinely conflicting exports during the required build.
      "import-x/export": "off",
    },
  },
  // COMMONJS FILES: parse .cjs as CommonJS and recognize Node's require, module,
  // exports, __dirname, and __filename globals. Permit require() imports because
  // they are the normal module-loading mechanism for these scripts and tests.
  // All other matching baseline rules remain enabled.
  {
    name: "commonjs",
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: nodeGlobals,
      parserOptions: {
        sourceType: "commonjs",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // CONSOLE OUTPUT AT USAGE/COMMAND BOUNDARIES: allow all console methods in
  // top-level JavaScript/TypeScript examples and helper src/cli.ts entrypoints,
  // where printing output is part of the program's purpose. This changes only
  // no-console; it does not exempt these files from other matching lint rules.
  {
    name: "console-output-entrypoints",
    files: [
      "examples/**/*.ts",
      "examples/**/*.js",
      "packages/helpers/**/src/cli.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },
  // AUTHORED TYPESCRIPT RUNTIME: apply the same promise-safety, readability, and
  // maintainability checks across apps, packages, and top-level examples, excluding
  // the tests, fixtures, nested samples, and vendor paths listed above.
  // Project Service reads each file's TypeScript project so no-floating-promises
  // and no-misused-promises can check actual types. The explicit virtual-file
  // allowance below keeps the existing in-memory JSDoc policy tests working.
  // Require braces and statement/comment spacing; reject nesting deeper than
  // three levels and more than three nested callbacks. Function length above 60
  // nonblank/noncomment lines is an error;
  // cognitive complexity is enforced while cyclomatic complexity remains advisory.
  // The spacing rules here deliberately override Prettier's disabling preset.
  {
    name: "authored-typescript-runtime",
    extends: [tsConfigs.strictTypeChecked, tsConfigs.stylisticTypeChecked],
    plugins: { sonarjs },
    files: ["apps/**/*.ts", "packages/**/*.ts", "examples/**/*.ts"],
    ignores: authoredTypeScriptExclusions,
    languageOptions: {
      parserOptions: {
        projectService: {
          // Virtual fixtures need strict compiler options too. The root solution
          // tsconfig contains references but supplies no strict compiler options.
          defaultProject: "apps/iracing-data-cli/tsconfig.build.json",
          // The JSDoc policy tests lint these virtual files without writing them to disk.
          allowDefaultProject: [
            "apps/iracing-data-cli/src/__jsdoc-policy-fixture__.ts",
            "packages/oauth/client/src/telemetry.ts",
            "packages/oauth/client/src/session.ts",
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // The presets already enforce floating/misused promises, unnecessary
      // conditions/assertions, and Error-only throws. These are additional rules.
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      // Curated SonarJS policy: intentionally do not enable its full preset.
      "sonarjs/cognitive-complexity": ["error", 12],
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-gratuitous-expressions": "error",
      "sonarjs/no-nested-switch": "error",
      // Runtime structural limits. Tests/fixtures are excluded by this block.
      "max-statements": ["error", 30],
      "max-params": ["error", 4],
      // Core control-flow and expression simplification.
      "array-callback-return": "error",
      "consistent-return": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-lonely-if": "error",
      "no-param-reassign": "error",
      "no-unneeded-ternary": "error",
      "no-useless-assignment": "error",
      "no-useless-concat": "error",
      "object-shorthand": "error",
      "prefer-object-spread": "error",

      curly: ["error", "all"],

      "@stylistic/padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "*",
          next: "return",
        },
        {
          blankLine: "always",
          prev: ["block", "block-like"],
          next: "*",
        },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
        {
          blankLine: "always",
          prev: ["const", "let", "var"],
          next: "*",
        },
      ],

      "@stylistic/lines-around-comment": [
        "error",
        {
          beforeLineComment: true,
          allowBlockStart: true,
          allowInterfaceStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
        },
      ],

      "max-lines-per-function": [
        "error",
        {
          max: 60,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
      "max-nested-callbacks": ["error", { max: 3 }],
      "max-depth": ["error", { max: 3 }],
      complexity: ["warn", 12],
    },
  },
]);
