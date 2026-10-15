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
  assert.equal(
    result.messages.some((message) => message.fatal),
    false,
    JSON.stringify(result.messages),
  );
  return result.messages.filter((message) =>
    message.ruleId?.startsWith("jsdoc/"),
  );
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

test("authored schema, telemetry and session filenames remain covered", async (t) => {
  for (const filePath of [
    "packages/oauth/schema/src/schema.ts",
    "packages/oauth/client/src/telemetry.ts",
    "packages/oauth/client/src/session.ts",
  ]) {
    await t.test(filePath, async () => {
      const source = "export interface AuthoredContract {}";
      await expectRule(source, "jsdoc/require-jsdoc", filePath);
      await expectRule(
        `/** */\n${source}`,
        "jsdoc/require-description",
        filePath,
      );
      await expectRule(
        `/** Returns the result. */\n${source}`,
        "jsdoc/match-description",
        filePath,
      );
    });
  }
});

test("explicit typed annotations document the public contract", async () => {
  const messages = await jsdocMessages(`
/**
 * Counts UTF-16 code units without normalizing the supplied text.
 * @param {string} input - Text whose code units should be counted.
 * @returns {number} Length in UTF-16 code units.
 */
export function run(input: string): number {
  return input.length;
}
`);
  assert.deepEqual(messages, []);
});

test("ESLint configuration uses the authored documentation rules", async () => {
  const filePath = "eslint.config.mjs";
  const source = "export function configure() {}";
  await expectRule(source, "jsdoc/require-jsdoc", filePath);
  await expectRule(`/** */\n${source}`, "jsdoc/require-description", filePath);
  await expectRule(
    `/** Returns the result. */\n${source}`,
    "jsdoc/match-description",
    filePath,
  );
  assert.deepEqual(
    await jsdocMessages(
      `/** Builds the shared lint configuration. */\n${source}`,
      filePath,
    ),
    [],
  );
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
const version = "fixture";
internalHelper();
`);
  assert.deepEqual(messages, []);
});

test("direct schema projections remain owned by their source schema", async () => {
  for (const projection of ["infer", "input"]) {
    const messages = await jsdocMessages(`
declare namespace z {
  type infer<T> = T;
  type input<T> = T;
}
declare const ExampleSchema: { value: string };
export type Example = z.${projection}<typeof ExampleSchema>;
`);
    assert.deepEqual(messages, []);
  }
});

test("generated, test and example exports are outside authored API coverage", async (t) => {
  const excluded = [
    [
      "generated",
      "export interface GeneratedContract {}",
      "packages/oauth/client/generated/src/__jsdoc-policy-fixture__.ts",
    ],
    [
      "generated Fetch client",
      "export interface GeneratedContract {}",
      "packages/api/client/fetch/src/__jsdoc-policy-fixture__.ts",
    ],
    [
      "generated Axios client",
      "export interface GeneratedContract {}",
      "packages/api/client/axios/src/__jsdoc-policy-fixture__.ts",
    ],
    [
      "fixture",
      "export interface FixtureContract {}",
      "packages/oauth/schema/fixtures/__jsdoc-policy-fixture__.ts",
    ],
    [
      "vendor",
      "export interface VendorContract {}",
      "packages/oauth/schema/vendor/__jsdoc-policy-fixture__.ts",
    ],
    [
      "nested example",
      "export interface ExampleContract {}",
      "packages/oauth/schema/examples/__jsdoc-policy-fixture__.ts",
    ],
    [
      "test",
      "export interface TestContract {}",
      "apps/iracing-data-cli/src/__jsdoc-policy-fixture__.test.ts",
    ],
    [
      "example",
      "export interface ExampleContract {}",
      "examples/data-api-first-call/src/index.ts",
    ],
  ];

  for (const [name, source, filePath] of excluded) {
    await t.test(name, async (t) => {
      for (const [description, comment] of [
        ["no JSDoc", ""],
        ["empty JSDoc", "/** */\n"],
        ["placeholder description", "/** Returns the result. */\n"],
      ]) {
        await t.test(description, async () => {
          const messages = await jsdocMessages(`${comment}${source}`, filePath);
          assert.deepEqual(messages, []);
        });
      }
    });
  }
});

const documentedFunction = `/**
 * Counts UTF-16 code units without normalizing the supplied text.
 * @param {string} input - Text whose code units should be counted.
 * @returns {number} Length in UTF-16 code units.
 * @throws {RangeError} When the supplied text is empty.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length|String length}
 */
export function count(input: string): number {
  if (!input.length) throw new RangeError("Empty text");
  return input.length;
}`;

test("typed public contracts reject incomplete or invalid tags", async (t) => {
  const cases = [
    ["parameter presence", / \* @param[^\n]*\n/u, "", "require-param"],
    ["parameter name", "input - Text", "other - Text", "check-param-names"],
    ["parameter type", "@param {string}", "@param", "require-param-type"],
    [
      "parameter description",
      " - Text whose code units should be counted.",
      "",
      "require-param-description",
    ],
    ["return presence", / \* @returns[^\n]*\n/u, "", "require-returns"],
    ["return type", "@returns {number}", "@returns", "require-returns-type"],
    [
      "return description",
      " Length in UTF-16 code units.",
      "",
      "require-returns-description",
    ],
    ["throw presence", / \* @throws[^\n]*\n/u, "", "require-throws"],
    ["throw type", "@throws {RangeError}", "@throws", "valid-types"],
    [
      "throw description",
      " When the supplied text is empty.",
      "",
      "match-description",
    ],
    ["invalid tag", "@param", "@pram", "check-tag-names"],
    ["invalid type", "{string}", "{string[}", "valid-types"],
    ["canonical return tag", "@returns", "@return", "check-tag-names"],
    [
      "source link",
      "{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length|String length}",
      "[String length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length)",
      "normalize-see-links",
    ],
  ];
  for (const [name, before, after, rule] of cases) {
    await t.test(name, () =>
      expectRule(documentedFunction.replace(before, after), `jsdoc/${rule}`),
    );
  }
});

test("thoroughly documented callable passes", async () => {
  assert.deepEqual(await jsdocMessages(documentedFunction), []);
});

test("public constants and members require documentation", async (t) => {
  for (const source of [
    "export const DEFAULT_TIMEOUT_MS = 5000;",
    "/** A caller-selected timeout for each network attempt. */ export interface Policy { timeoutMs: number }",
    "/** Coordinates caller-owned network attempts. */ export class Runner { run() {} }",
  ]) {
    await t.test(source, () => expectRule(source, "jsdoc/require-jsdoc"));
  }
});

test("descriptions that repeat a symbol are rejected", async () => {
  await expectRule(
    "/** The configuration. */ export const configuration = {};",
    "jsdoc/informative-docs",
  );
});

test("private and protected implementation members remain outside presence checks", async () => {
  assert.deepEqual(
    await jsdocMessages(`
/** Coordinates request execution through a caller-owned transport. */
export class Runner {
  private run() {}
  protected retry() {}
  #release() {}
}
`),
    [],
  );
});

test("separately exported runtime declarations remain public", async () => {
  for (const declaration of ["function run() {}", "const timeoutMs = 5000;"]) {
    let name = "timeoutMs";
    if (declaration.includes("run")) name = "run";
    await expectRule(
      `${declaration}\nexport { ${name} };`,
      "jsdoc/require-jsdoc",
    );
  }
});

test("default classes expose their public methods", async () => {
  await expectRule(
    "/** Coordinates request execution. */ export default class Runner { run() {} }",
    "jsdoc/require-jsdoc",
  );
});

test("property tags require explicit types and descriptions", async () => {
  for (const [tag, rule] of [
    [
      "@property timeoutMs - Deadline in milliseconds.",
      "require-property-type",
    ],
    ["@property {number} timeoutMs", "require-property-description"],
  ]) {
    await expectRule(
      `/** Caller policy for bounded network requests.\n * @typedef {object} Policy\n * ${tag}\n */\nexport const policy = {};`,
      `jsdoc/${rule}`,
    );
  }
});

test("interface call contracts require return annotations", async () => {
  await expectRule(
    `/** Resolves names through the caller's lookup policy. */
export interface Resolver {
  /** Resolves a name without case normalization.
   * @param {string} name - Exact lookup key sent to the resolver.
   */
  resolve(name: string): string;
}`,
    "jsdoc/require-returns",
  );
});

test("public class fields require documentation", async () => {
  await expectRule(
    "/** Coordinates request deadlines. */ export class Runner { timeoutMs = 5000; }",
    "jsdoc/require-jsdoc",
  );
});

test("wrapping a Zod projection creates a separately documented contract", async () => {
  await expectRule(
    "export type Patch = Partial<z.infer<typeof Schema>>;",
    "jsdoc/require-jsdoc",
  );
});

test("placeholder parameter descriptions are rejected", async () => {
  await expectRule(
    documentedFunction.replace(
      "Text whose code units should be counted.",
      "The configuration.",
    ),
    "jsdoc/match-description",
  );
});
