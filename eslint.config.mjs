import stylistic from "@stylistic/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
  {
    ignores: [
      "**/dist/**",
      "bin/**",
      "node_modules/**",
      "openapi/**",
      "iracing-proto/**",
      "packages/**/generated/**",
      "packages/**/src/**/schema.ts",
      "packages/**/src/**/telemetry.ts",
      "packages/**/src/**/session.ts",
      "packages/api/client/**",
      "packages/telemetry/client/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,ts}"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "@stylistic": stylistic,
      import: importPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...tseslint.configs["eslint-recommended"].overrides[0].rules,
      ...tseslint.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      ...eslintConfigPrettier.rules,
      "prettier/prettier": "error",
      "import/no-unresolved": "off",
      "prefer-const": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "import/order": [
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
              pattern: "react",
              group: "builtin",
              position: "before",
            },
            {
              pattern: "react-native",
              group: "builtin",
              position: "before",
            },
            {
              pattern: "#/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "parent",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
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
  {
    files: ["**/*.{js,mjs}"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    files: [
      "apps/sync-*-cli/**/*.ts",
      "examples/**/*.ts",
      "examples/**/*.js",
      "packages/cli/**/*.ts",
      "packages/helpers/**/src/cli.ts",
      "packages/helpers/api-schema-to-openapi/src/index.ts",
      "packages/helpers/oauth-schema-to-openapi/src/index.ts",
      "packages/helpers/sync-car-assets/**/*.ts",
      "packages/helpers/sync-track-assets/**/*.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["examples/**/*.ts", "examples/**/*.js"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: [
      "packages/helpers/sync-telemetry-json-schema/src/constants/google/protobuf/struct.ts",
    ],
    rules: {
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-explicit-any": "off",
      eqeqeq: "off",
    },
  },
  {
    files: ["apps/**/*.{js,mjs,ts}"],
    rules: {
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
        "warn",
        {
          max: 80,
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
];
