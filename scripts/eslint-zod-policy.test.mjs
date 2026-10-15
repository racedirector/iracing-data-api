import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eslint = new ESLint({ cwd: root });

async function policyMessages(
  source,
  filePath = "packages/api/schema/src/__zod-policy-fixture__.test.ts",
) {
  const [result] = await eslint.lintText(source, { filePath });
  return result.messages.filter(
    ({ ruleId }) =>
      ruleId?.startsWith("zod/") || ruleId === "no-restricted-imports",
  );
}

test("Zod v4 policy rejects weak schemas and legacy APIs", async (t) => {
  const cases = [
    ["no-any-schema", "z.any()"],
    ["no-coerce-boolean", "z.coerce.boolean()"],
    ["no-empty-custom-schema", "z.custom()"],
    ["no-native-enum", "z.nativeEnum({ Ready: 'ready' })"],
    ["no-number-schema-with-finite", "z.number().finite()"],
    ["no-number-schema-with-int", "z.number().int()"],
    ["no-number-schema-with-is-finite", "z.number().isFinite"],
    ["no-number-schema-with-is-int", "z.number().isInt"],
    ["no-number-schema-with-safe", "z.number().safe()"],
    ["no-number-schema-with-step", "z.number().step(2)"],
    ["no-promise-schema", "z.promise(z.string())"],
    ["no-schema-with-is-nullable", "z.string().isNullable()"],
    ["no-schema-with-is-optional", "z.string().isOptional()"],
    [
      "no-throw-in-refine",
      "z.string().refine(() => { throw new Error('invalid'); })",
    ],
    [
      "no-transform-in-record-key",
      "z.record(z.string().transform(s => s.toLowerCase()), z.string())",
    ],
    ["require-brand-type-parameter", "z.string().brand()"],
    ["prefer-top-level-string-formats", "z.string().email()"],
    ["prefer-meta", "z.string().describe('name')"],
    ["prefer-loose-object", "z.object({}).passthrough()"],
    ["prefer-strict-object", "z.object({}).strict()"],
    ["no-conflicting-checks", "z.string().min(10).max(2)"],
  ];
  for (const [rule, expression] of cases) {
    await t.test(rule, async () => {
      const messages = await policyMessages(
        `import { z } from 'zod'; const schema = ${expression};`,
      );
      assert.ok(
        messages.some((m) => m.ruleId === `zod/${rule}` && m.severity === 2),
        JSON.stringify(messages),
      );
    });
  }
});

test("Zod imports are tracked through aliases without matching unrelated objects", async () => {
  for (const source of [
    "import { z as validation } from 'zod'; validation.any();",
    "import * as validation from 'zod'; validation.any();",
    "import { any as anything } from 'zod'; anything();",
  ]) {
    assert.ok(
      (await policyMessages(source)).some(
        (m) => m.ruleId === "zod/no-any-schema",
      ),
    );
  }
  assert.deepEqual(
    await policyMessages(`
const z = { any: () => 1, number: () => ({ int: () => 1 }) };
z.any(); z.number().int();
`),
    [],
  );
});

test("supported schema semantics and documentation remain permitted", async () => {
  assert.deepEqual(
    await policyMessages(`
import { z } from 'zod';
const unknownPayload = z.record(z.string(), z.unknown());
const queryNumber = z.coerce.number().optional();
const queryBoolean = z.preprocess(value => value === 'true' ? true : value === 'false' ? false : value, z.boolean());
const documentedUnion = z.union([z.string(), z.array(z.string())]).meta({ unionOneOf: true }).optional();
const defaultedOptional = z.enum(['plain', 'S256']).default('plain').optional();
const identifier = z.int().positive().brand<'Identifier'>();
const refined = z.string().refine(value => value.includes(':'), { error: 'Expected colon' });
`),
    [],
  );
});

test("schema-bearing apps, examples and tests receive the policy", async () => {
  for (const filePath of [
    "apps/iracing-data-cli/src/__zod-policy-fixture__.test.ts",
    "apps/iracing-data-mcp/src/__zod-policy-fixture__.test.ts",
    "packages/mcp/tools/src/__zod-policy-fixture__.test.ts",
    "examples/oauth-example/src/__zod-policy-fixture__.test.ts",
    "packages/api/schema/src/schema/__zod-policy-fixture__.test.ts",
  ]) {
    assert.ok(
      (
        await policyMessages("import { z } from 'zod'; z.any();", filePath)
      ).some((m) => m.ruleId === "zod/no-any-schema"),
    );
  }
  for (const filePath of [
    "packages/api/client/fetch/src/apis/ResultsApi.ts",
    "packages/oauth/client/generated/src/runtime.ts",
  ]) {
    const config = await eslint.calculateConfigForFile(filePath);
    assert.equal(config.rules["zod/no-any-schema"], undefined);
  }
  for (const filePath of [
    "packages/api/schema/src/schema/responses.ts",
    "apps/iracing-data-mcp/src/config.ts",
    "packages/mcp/tools/src/tools/primitives.ts",
  ]) {
    const config = await eslint.calculateConfigForFile(filePath);
    assert.equal(config.rules["zod/no-any-schema"][0], 2);
  }
});

test("Zod v3 imports cannot bypass v4 policy", async () => {
  const messages = await policyMessages(
    "import { z } from 'zod/v3'; z.string();",
  );
  assert.ok(
    messages.some(
      (m) => m.ruleId === "no-restricted-imports" && m.severity === 2,
    ),
  );
});

// Deprecated API diagnostics come from the existing semantic rule in runtime code.
test("typed runtime keeps stronger deprecation checking without duplicate reports", async () => {
  const config = await eslint.calculateConfigForFile(
    "packages/api/schema/src/schema/responses.ts",
  );
  assert.equal(config.rules["@typescript-eslint/no-deprecated"][0], 2);
  assert.equal(config.rules["zod/no-native-enum"][0], 0);
  assert.equal(config.rules["zod/prefer-top-level-string-formats"][0], 0);
});
