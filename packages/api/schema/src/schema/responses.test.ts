import { strict as assert } from "node:assert";
import { it } from "node:test";
import {
  ConstantsResponseSchema,
  ServiceMethodDocsResponseSchema,
  ServicesDocsResponseSchema,
} from "./responses";

it("accepts documentation with omitted parameters and retains string or array notes", () => {
  for (const note of [
    "Constant; returned directly as an array of objects",
    ["image paths are relative to https://images-static.iracing.com/"],
  ]) {
    const method = {
      link: "https://members-ng.iracing.com/data/car/get",
      expirationSeconds: 900,
      note,
    };
    assert.deepEqual(
      ServicesDocsResponseSchema.parse({ car: { get: method } }),
      { car: { get: method } },
    );
  }
});
it("accepts empty/populated parameter maps and rejects malformed documents", () => {
  const link = "https://members-ng.iracing.com/data/results/get";
  assert.deepEqual(
    ServiceMethodDocsResponseSchema.parse({ link, parameters: {} }),
    { link, parameters: {} },
  );
  assert.deepEqual(
    ServiceMethodDocsResponseSchema.parse({
      link,
      parameters: { subsession_id: { type: "number", required: true } },
    }).parameters,
    { subsession_id: { type: "number", required: true } },
  );
  for (const value of [
    { link, parameters: null },
    { link, parameters: { x: {} } },
    { link, note: 123 },
  ])
    assert.equal(
      ServiceMethodDocsResponseSchema.safeParse(value).success,
      false,
    );
});

it("validates direct constant object arrays without inventing their field contract", () => {
  const value = [
    { value: 1, label: "Example", unknown_field: { nested: true } },
  ];
  assert.deepEqual(ConstantsResponseSchema.parse(value), value);
  for (const invalid of [{ link: "https://example.com" }, [1], null])
    assert.equal(ConstantsResponseSchema.safeParse(invalid).success, false);
});
