import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist/**",
      "bin/**",
      "node_modules/**",
      "openapi/**",
      "iracing-proto/**",
      "packages/**/generated/**",
      "packages/**/src/**/schema.ts",
      "packages/**/src/**/telemetry.ts",
      "packages/**/src/**/session.ts",
      "packages/api/client/**",
      "packages/oauth/client/**",
      "packages/telemetry/client/**",
    ],
  },
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
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
    files: ["**/*.js"],
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
    files: ["packages/iracing-telemetry-types/*"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
];
