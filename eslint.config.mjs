import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: ["dist/**", "bin/**", "node_modules/**"],
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
      "packages/cli/**/*.ts",
      "packages/helpers/sync-car-assets/**/*.ts",
      "packages/helpers/sync-track-assets/**/*.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["packages/iracing-telemetry-types/*"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
];
