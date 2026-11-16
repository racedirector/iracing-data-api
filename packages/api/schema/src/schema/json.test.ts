import { strict as assert } from "node:assert";
import { it } from "node:test";
import { z } from "zod";
import {
  CarCatalogJsonSchema,
  TrackCatalogJsonSchema,
  CarClassCatalogJsonSchema,
  CarAssetsJsonSchema,
  TrackAssetsJsonSchema,
  SeriesAssetsJsonSchema,
  CarJsonSchema,
  TrackJsonSchema,
  CarClassJsonSchema,
} from "./json";
import { APIResponseSchema } from "./responses";

it("validates downloaded catalogs without stripping additive upstream data", () => {
  const cases = [
    [
      CarCatalogJsonSchema,
      [{ car_id: 1, car_name: "Example", extra: { future: true } }],
    ],
    [
      TrackCatalogJsonSchema,
      [{ track_id: 1, track_name: "Example", extra: 42 }],
    ],
    [
      CarClassCatalogJsonSchema,
      [{ car_class_id: 0, name: "Hosted All Cars Class", extra: null }],
    ],
  ] as const;
  for (const [schema, value] of cases) {
    assert.deepEqual(schema.parse(value), value);
    assert.equal(schema.safeParse([]).success, false);
    assert.equal(
      schema.safeParse({
        link: "https://example.test/data",
        expires: "2026-11-16T00:00:00Z",
      }).success,
      false,
    );
  }
  assert.equal(
    CarJsonSchema.safeParse({ car_id: "1", car_name: "Example" }).success,
    false,
  );
  assert.equal(TrackJsonSchema.safeParse({ track_id: 1 }).success, false);
  assert.equal(
    CarClassJsonSchema.safeParse({ car_class_id: -1, name: "Example" }).success,
    false,
  );
});

it("models asset documents as ID-keyed objects, not endpoint envelopes or arrays", () => {
  const cases = [
    [
      CarAssetsJsonSchema,
      { "1": { car_id: 1, logo: null, car_rules: [], future: { kept: true } } },
    ],
    [
      TrackAssetsJsonSchema,
      {
        "1": {
          track_id: 1,
          north: "90deg",
          num_svg_images: 6,
          track_map: "https://example.test/maps/",
          track_map_layers: { future: "future.svg" },
        },
      },
    ],
    [
      SeriesAssetsJsonSchema,
      { "32": { series_id: 32, logo: "seriesid_32.png", large_image: null } },
    ],
  ] as const;
  for (const [schema, value] of cases) {
    assert.deepEqual(schema.parse(value), value);
    assert.equal(schema.safeParse([]).success, false);
    assert.equal(
      schema.safeParse({
        link: "https://example.test/data",
        expires: "2026-11-16T00:00:00Z",
      }).success,
      false,
    );
  }
  assert.equal(
    TrackAssetsJsonSchema.safeParse({
      "1": { track_id: 1, num_svg_images: -1 },
    }).success,
    false,
  );
  assert.equal(
    CarAssetsJsonSchema.safeParse({ arbitrary: { car_id: 1 } }).success,
    false,
  );
  assert.equal(
    APIResponseSchema.safeParse({
      link: "https://example.test/data",
      expires: "2026-11-16T00:00:00Z",
    }).success,
    true,
  );
});

it("publishes JSON-compatible schema metadata and extensibility policies", () => {
  for (const schema of [
    CarCatalogJsonSchema,
    TrackCatalogJsonSchema,
    CarClassCatalogJsonSchema,
    CarAssetsJsonSchema,
    TrackAssetsJsonSchema,
    SeriesAssetsJsonSchema,
  ]) {
    const published = z.toJSONSchema(schema);
    const root = published.$defs?.[schema.meta()!.id!] ?? published;
    assert.equal(typeof root === "object" && typeof root.title, "string");
    assert.equal(typeof root === "object" && typeof root.description, "string");
    assert.ok(JSON.stringify(published).length > 0);
  }
  const car = z.toJSONSchema(CarJsonSchema);
  const carRoot = car.$defs?.carJson;
  assert.ok(carRoot && typeof carRoot === "object");
  assert.deepEqual(carRoot.additionalProperties, {});
  assert.match(JSON.stringify(carRoot.properties?.car_id), /car_id/);
  const trackAssets = z.toJSONSchema(TrackAssetsJsonSchema);
  assert.match(JSON.stringify(trackAssets), /Unit: count of images/);
  assert.match(JSON.stringify(trackAssets), /"format":"uri"/);
});
