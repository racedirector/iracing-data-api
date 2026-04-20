import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { CommaSeparatedNumberString } from "./primitives";

describe("CommaSeparatedNumberString", () => {
  it("coerces single integers", () => {
    const integerValue = CommaSeparatedNumberString.parse(1);

    assert.strictEqual(integerValue, "1");
    assert.strictEqual(typeof integerValue, "string");
  });

  it("preserves comma-separated strings", () => {
    const singleValue = CommaSeparatedNumberString.parse("1");
    const multipleValues = CommaSeparatedNumberString.parse("1,2,3");

    assert.strictEqual(singleValue, "1");
    assert.strictEqual(typeof singleValue, "string");
    assert.strictEqual(multipleValues, "1,2,3");
    assert.strictEqual(typeof multipleValues, "string");
  });
});
