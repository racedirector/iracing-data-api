const assert = require("node:assert/strict");
const { test } = require("node:test");

test("content lookup validates its local consumed fields without a shared wire contract", async () => {
  const { CarProjection, TrackProjection } =
    await import("../dist/tools/lookup-content.js");
  for (const [schema, idKey, nameKey] of [
    [CarProjection, "car_id", "car_name"],
    [TrackProjection, "track_id", "track_name"],
  ]) {
    const minimal = { [idKey]: 7, [nameKey]: "Synthetic" };
    assert.equal(schema.parse(minimal)[idKey], 7);
    assert.equal(schema.safeParse({ ...minimal, [idKey]: "7" }).success, false);
    assert.equal(schema.safeParse({ [idKey]: 7 }).success, false);
    assert.equal(
      "unconsumed_field" in
        schema.parse({ ...minimal, unconsumed_field: true }),
      false,
    );
  }
});
