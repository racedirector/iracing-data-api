import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { IRacingMemberGetParametersSchema } from "./parameters";

describe("IRacingMemberGetParameters", () => {
  it("coerces single integers", () => {
    const integerValue = IRacingMemberGetParametersSchema.parse({
      cust_ids: 1,
    });
    assert.deepStrictEqual(integerValue, {
      cust_ids: "1",
    });
  });

  it("preserves cust_ids as a string", () => {
    const singleValue = IRacingMemberGetParametersSchema.parse({
      cust_ids: "1",
    });
    const multipleValues = IRacingMemberGetParametersSchema.parse({
      cust_ids: "1,2,3",
      include_licenses: "true",
    });

    assert.deepStrictEqual(singleValue, {
      cust_ids: "1",
    });
    assert.deepStrictEqual(multipleValues, {
      cust_ids: "1,2,3",
      include_licenses: true,
    });
  });
});
