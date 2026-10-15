import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint({ cwd: import.meta.dirname + "/.." });
const runtime = "apps/iracing-data-cli/src/__jsdoc-policy-fixture__.ts";

async function messages(source, filePath = runtime) {
  const [result] = await eslint.lintText(source, { filePath });
  assert.ok(!result.fatalErrorCount, JSON.stringify(result.messages));

  return result.messages;
}

async function rejects(source, ruleId, filePath) {
  const results = await messages(source, filePath);
  assert.ok(
    results.some(
      (message) => message.ruleId === ruleId && message.severity === 2,
    ),
    `${ruleId}: ${JSON.stringify(results)}`,
  );
}

test("ESLint configuration lints itself with shared correctness rules", async () => {
  const filePath = "eslint.config.mjs";
  assert.equal(await eslint.isPathIgnored(filePath), false);
  await rejects(
    'const unusedConfigValue = "unused";',
    "@typescript-eslint/no-unused-vars",
    filePath,
  );
  await rejects("fabricatedGlobal();", "no-undef", filePath);
  const [result] = await eslint.lintFiles([filePath]);
  assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
  assert.equal(result.warningCount, 0, JSON.stringify(result.messages));
});

test("runtime structural limits are errors", async () => {
  await rejects(
    `function oversized() {\n${Array.from({ length: 61 }, () => 'console.info("line");').join("\n")}\n}`,
    "max-lines-per-function",
  );
  await rejects(
    `function statements() { ${'console.info("statement");'.repeat(31)} }`,
    "max-statements",
  );
  await rejects(
    "function broad(a: number, b: number, c: number, d: number, e: number) {}",
    "max-params",
  );
  await rejects(
    "function nested(a: boolean) { if (a) { while (a) { for (;;) { if (a) { break; } } } } }",
    "max-depth",
  );
  await rejects(
    "function complex(a: boolean, b: boolean) { if (a) { if (b) { while (a) { if (b) { if (a) { console.info(a); } } } } } }",
    "sonarjs/cognitive-complexity",
  );
  await rejects(
    "function callbacks() { [1].forEach(() => { [1].forEach(() => { [1].forEach(() => { [1].forEach(() => {}); }); }); }); }",
    "max-nested-callbacks",
  );
});

test("runtime type information enforces promise and condition safety", async () => {
  await rejects(
    'Promise.resolve("ignored");',
    "@typescript-eslint/no-floating-promises",
  );
  await rejects(
    'const value = "present"; if (value !== undefined) { console.info(value); }',
    "@typescript-eslint/no-unnecessary-condition",
  );
});

test("fabricated workspace imports fail resolution", async () => {
  await rejects(
    'import "@iracing-data/oauth-client/fabricated-entrypoint";',
    "import-x/no-unresolved",
  );
});

test("suppression directives must be used and explained", async () => {
  const unused = await messages(
    "// eslint-disable-next-line no-console -- Output is an intentional command response.\nconst value = 1;",
  );
  assert.ok(
    unused.some(
      (message) =>
        message.severity === 2 &&
        /Unused eslint-disable directive/.test(message.message),
    ),
  );
  await rejects(
    '// eslint-disable-next-line no-console\nconsole.log("output");',
    "eslint-comments/require-description",
  );
});

test("tests keep correctness rules without runtime structural limits", async () => {
  const config = await eslint.calculateConfigForFile(
    "apps/iracing-data-cli/test/quality.test.ts",
  );
  for (const rule of [
    "max-lines-per-function",
    "max-statements",
    "max-params",
    "max-depth",
    "max-nested-callbacks",
    "sonarjs/cognitive-complexity",
  ]) {
    assert.ok(!config.rules[rule] || config.rules[rule][0] === 0, rule);
  }
  assert.equal(config.rules["@typescript-eslint/no-unused-vars"][0], 2);
});

test("workspace boundaries prohibit runtime composition and private imports", async () => {
  const reusable = "packages/oauth/client/src/session.ts";
  await rejects(
    'import "../../../../apps/iracing-data-mcp/src/production.js";',
    "boundaries/dependencies",
    reusable,
  );
  await rejects(
    'import "../../../mcp/tools/src/services.js";',
    "boundaries/dependencies",
    reusable,
  );
  const allowed = await messages(
    'import "@iracing-data/oauth-schema";',
    reusable,
  );
  assert.ok(
    !allowed.some((message) => message.ruleId?.startsWith("boundaries/")),
    JSON.stringify(allowed),
  );
});

test("generated clients remain dependency leaves without runtime style policy", async () => {
  const filePath = "packages/api/client/fetch/src/runtime.ts";
  await rejects(
    '/* eslint-disable */\nimport "../../../../../apps/iracing-data-mcp/src/production.js";',
    "boundaries/dependencies",
    filePath,
  );
  await rejects(
    'import "../../../../oauth/client/src/client.js";',
    "boundaries/dependencies",
    filePath,
  );
  const config = await eslint.calculateConfigForFile(filePath);
  assert.equal(config.rules["max-lines-per-function"], undefined);
  assert.equal(config.rules["prettier/prettier"], undefined);
});

test("JavaScript keeps core correctness without Project Service", async () => {
  await rejects(
    "fabricatedGlobal();",
    "no-undef",
    "scripts/__quality-policy-fixture__.mjs",
  );
  const config = await eslint.calculateConfigForFile(
    "scripts/__quality-policy-fixture__.cjs",
  );
  assert.equal(config.languageOptions.parserOptions.projectService, undefined);
  assert.equal(config.rules["@typescript-eslint/no-require-imports"][0], 0);
});
