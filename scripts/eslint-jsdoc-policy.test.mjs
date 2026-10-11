import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eslint = new ESLint({ cwd: root });
const authoredFixture = "apps/iracing-data-cli/src/__jsdoc-policy-fixture__.ts";

async function jsdocMessages(source, filePath = authoredFixture) {
  const [result] = await eslint.lintText(source, { filePath });
  return result.messages.filter((message) => message.ruleId?.startsWith("jsdoc/"));
}

async function expectRule(source, ruleId, filePath) {
  const messages = await jsdocMessages(source, filePath);
  assert.ok(
    messages.some((message) => message.ruleId === ruleId),
    `${ruleId} should reject:\n${source}\n${JSON.stringify(messages, null, 2)}`,
  );
}

test("authored exported declaration categories require JSDoc", async (t) => {
  const cases = [
    ["function", "export function run(): void {}"],
    ["arrow function", "export const run = (): void => {};"],
    ["function expression", "export const run = function (): void {};"],
    ["class", "export class Runner {}"],
    ["interface", "export interface Runner { run(): void }"],
    ["type alias", "export type Runner = { run(): void };"],
    ["enum", "export enum RunnerState { Ready = 'ready' }"],
  ];

  for (const [name, source] of cases) {
    await t.test(name, () => expectRule(source, "jsdoc/require-jsdoc"));
  }
});

test("meaningful description satisfies coverage without redundant type tags", async () => {
  const messages = await jsdocMessages(`
/**
 * Resolves one command invocation through the maintained application boundary.
 */
export function run(input: string): number {
  return input.length;
}
`);
  assert.deepEqual(messages, []);
});

test("empty and placeholder JSDoc are rejected", async (t) => {
  await t.test("empty", () =>
    expectRule(
      "/** */\nexport function run(): void {}",
      "jsdoc/require-description",
    ),
  );
  await t.test("placeholder", () =>
    expectRule(
      "/** Returns the result. */\nexport function run(): void {}",
      "jsdoc/match-description",
    ),
  );
});

test("internal helpers do not require JSDoc", async () => {
  const messages = await jsdocMessages(`
function internalHelper(): void {}
export const version = "fixture";
internalHelper();
`);
  assert.deepEqual(messages, []);
});

test("schema-inferred aliases remain owned by their source schema", async () => {
  const messages = await jsdocMessages(`
declare namespace z {
  type infer<T> = T;
}
declare const ExampleSchema: { value: string };
export type Example = z.infer<typeof ExampleSchema>;
`);
  assert.deepEqual(messages, []);
});

test("generated, test and example exports are outside authored API coverage", async (t) => {
  const excluded = [
    [
      "generated",
      "export interface GeneratedContract {}",
      "packages/oauth/client/generated/src/__jsdoc-policy-fixture__.ts",
    ],
    [
      "test",
      "export interface TestContract {}",
      "apps/iracing-data-cli/src/__jsdoc-policy-fixture__.test.ts",
    ],
    [
      "example",
      "export interface ExampleContract {}",
      "examples/__jsdoc-policy-fixture__.ts",
    ],
  ];

  for (const [name, source, filePath] of excluded) {
    await t.test(name, async () => {
      const messages = await jsdocMessages(source, filePath);
      assert.equal(
        messages.some((message) => message.ruleId === "jsdoc/require-jsdoc"),
        false,
      );
    });
  }
});
