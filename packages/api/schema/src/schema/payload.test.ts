import { strict as assert } from "node:assert";
import { it } from "node:test";
import { z } from "zod";
import {
  CarCatalogPayloadSchema,
  TrackCatalogPayloadSchema,
  CarClassCatalogPayloadSchema,
  CarAssetsPayloadSchema,
  TrackAssetsPayloadSchema,
  SeriesAssetsPayloadSchema,
  CarPayloadSchema,
  TrackPayloadSchema,
  CarClassPayloadSchema,
  SeriesCatalogPayloadSchema,
  SeriesPayloadSchema,
  ReferenceValuesPayloadSchema,
  LicenseDefinitionsPayloadSchema,
} from "./payload";
import { APIResponseSchema } from "./responses";

it("validates downloaded catalogs without stripping additive upstream data", () => {
  const cases = [
    [
      CarCatalogPayloadSchema,
      [{ car_id: 1, car_name: "Example", extra: { future: true } }],
    ],
    [
      TrackCatalogPayloadSchema,
      [{ track_id: 1, track_name: "Example", extra: 42 }],
    ],
    [
      CarClassCatalogPayloadSchema,
      [{ car_class_id: 0, name: "Hosted All Cars Class", extra: null }],
    ],
    [
      SeriesCatalogPayloadSchema,
      [
        {
          series_id: 17,
          series_name: "Example",
          allowed_licenses: [],
          upstream_extra: true,
        },
      ],
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
    CarPayloadSchema.safeParse({ car_id: "1", car_name: "Example" }).success,
    false,
  );
  assert.equal(TrackPayloadSchema.safeParse({ track_id: 1 }).success, false);
  assert.equal(
    CarClassPayloadSchema.safeParse({ car_class_id: -1, name: "Example" })
      .success,
    false,
  );
});

it("preserves reference sentinel values, license groups and additive metadata", () => {
  const values = [
    { label: "ALL", value: -1, future: true },
    { label: "Division 1", value: 0 },
  ];
  assert.deepEqual(ReferenceValuesPayloadSchema.parse(values), values);
  assert.equal(
    ReferenceValuesPayloadSchema.safeParse([{ label: "Bad", value: "1" }])
      .success,
    false,
  );
  assert.equal(SeriesPayloadSchema.safeParse({ series_id: 17 }).success, false);
  const licenses = [
    {
      license_group: 1,
      group_name: "Example",
      min_sr_to_fast_track: 300,
      levels: [
        {
          license_id: 4,
          license_group: 1,
          license: "Example 4.0",
          extra: { kept: true },
        },
      ],
    },
  ];
  assert.deepEqual(LicenseDefinitionsPayloadSchema.parse(licenses), licenses);
  assert.equal(
    LicenseDefinitionsPayloadSchema.safeParse([
      { license_group: 0, group_name: "Bad" },
    ]).success,
    false,
  );
});

it("models asset documents as ID-keyed objects, not endpoint envelopes or arrays", () => {
  const cases = [
    [
      CarAssetsPayloadSchema,
      { "1": { car_id: 1, logo: null, car_rules: [], future: { kept: true } } },
    ],
    [
      TrackAssetsPayloadSchema,
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
      SeriesAssetsPayloadSchema,
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
    TrackAssetsPayloadSchema.safeParse({
      "1": { track_id: 1, num_svg_images: -1 },
    }).success,
    false,
  );
  assert.equal(
    CarAssetsPayloadSchema.safeParse({ arbitrary: { car_id: 1 } }).success,
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
    CarCatalogPayloadSchema,
    TrackCatalogPayloadSchema,
    CarClassCatalogPayloadSchema,
    CarAssetsPayloadSchema,
    TrackAssetsPayloadSchema,
    SeriesAssetsPayloadSchema,
  ]) {
    const published = z.toJSONSchema(schema);
    const root = published.$defs?.[schema.meta()!.id!] ?? published;
    assert.equal(typeof root === "object" && typeof root.title, "string");
    assert.equal(typeof root === "object" && typeof root.description, "string");
    assert.ok(JSON.stringify(published).length > 0);
  }
  const car = z.toJSONSchema(CarPayloadSchema);
  const carRoot = car.$defs?.carPayload;
  assert.ok(carRoot && typeof carRoot === "object");
  assert.deepEqual(carRoot.additionalProperties, {});
  assert.match(JSON.stringify(carRoot.properties?.car_id), /car_id/);
  const trackAssets = z.toJSONSchema(TrackAssetsPayloadSchema);
  assert.match(JSON.stringify(trackAssets), /Unit: count of images/);
  assert.match(JSON.stringify(trackAssets), /"format":"uri"/);
});
