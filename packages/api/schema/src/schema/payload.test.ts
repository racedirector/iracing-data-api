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
  RaceResultPayloadSchema,
  RaceResultSimsessionPayloadSchema,
  RaceResultEntryPayloadSchema,
  RaceResultTeamPayloadSchema,
  RaceResultDriverPayloadSchema,
  RaceResultTrackPayloadSchema,
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

const raceResult = () => ({
  subsession_id: 42,
  event_type: 5,
  root_canary: { future: true },
  session_results: [
    {
      simsession_number: -1,
      simsession_name: "QUALIFY",
      simsession_type: 4,
      session_canary: "kept",
      results: [
        {
          cust_id: 900001,
          display_name: "Driver",
          starting_position: -1,
          reason_out_id: 99,
          entry_canary: [1, 2],
        },
      ],
    },
    {
      simsession_number: 0,
      simsession_name: "FEATURE",
      simsession_type: 6,
      results: [
        {
          cust_id: 900002,
          display_name: "Winner",
          finish_position: 0,
        },
        {
          team_id: -900003,
          display_name: "Team",
          finish_position: 1,
          team_canary: "kept",
          driver_results: [
            {
              cust_id: 900004,
              team_id: -900003,
              display_name: "Team Driver",
              driver_canary: true,
            },
          ],
        },
      ],
    },
  ],
});

it("validates downloaded race results without stripping additive upstream data", () => {
  const document = raceResult();
  assert.deepEqual(RaceResultPayloadSchema.parse(document), document);
  assert.equal(
    RaceResultSimsessionPayloadSchema.safeParse(document.session_results[0])
      .success,
    true,
  );
  assert.equal(
    RaceResultEntryPayloadSchema.safeParse(
      document.session_results[1].results[1],
    ).success,
    true,
  );
  assert.equal(
    RaceResultTeamPayloadSchema.safeParse(
      document.session_results[1].results[1],
    ).success,
    true,
  );
  assert.equal(
    RaceResultDriverPayloadSchema.safeParse({
      cust_id: 900004,
      team_id: -900003,
    }).success,
    true,
  );
  assert.equal(
    RaceResultTrackPayloadSchema.safeParse({
      track_id: 331,
      track_name: "Chili Bowl",
      config_name: "N/A",
    }).success,
    true,
  );
});

it("requires only the race-result protocol essentials", () => {
  const invalid = [
    { ...raceResult(), subsession_id: 0 },
    { ...raceResult(), subsession_id: "42" },
    { ...raceResult(), event_type: "Race" },
    { ...raceResult(), session_results: [] },
    { ...raceResult(), session_results: undefined },
    {
      ...raceResult(),
      session_results: [
        { simsession_number: 0, results: [] },
        { simsession_number: 0, results: [] },
      ],
    },
    {
      ...raceResult(),
      session_results: [{ simsession_number: -1, results: [] }],
    },
    {
      ...raceResult(),
      session_results: [{ simsession_number: 0, results: undefined }],
    },
    {
      ...raceResult(),
      session_results: [
        {
          simsession_number: 0,
          results: [{ team_id: -1, driver_results: [] }],
        },
      ],
    },
    {
      ...raceResult(),
      session_results: [
        {
          simsession_number: 0,
          results: [{ team_id: -1, driver_results: [{ cust_id: 0 }] }],
        },
      ],
    },
    {
      ...raceResult(),
      session_results: [{ simsession_number: 0, results: [{ cust_id: -4 }] }],
    },
    {
      ...raceResult(),
      session_results: [{ simsession_number: 0, results: [{ cust_id: 1.5 }] }],
    },
  ];
  invalid.forEach((document, index) => {
    assert.equal(
      RaceResultPayloadSchema.safeParse(document).success,
      false,
      `case ${index} should fail`,
    );
  });
});

it("accepts negative team identifiers, sentinels and new upstream values", () => {
  const document = raceResult();
  const team = document.session_results[1].results[1] as unknown as {
    team_id: number;
  };
  assert.ok(team.team_id < 0);
  const practice = document.session_results[0].results[0] as unknown as {
    starting_position: number;
    reason_out_id: number;
    simsession_extension?: unknown;
  };
  assert.equal(practice.starting_position, -1);
  assert.equal(practice.reason_out_id, 99);
  practice.simsession_extension = { new: true };
  const qualify = document.session_results[0] as unknown as {
    simsession_name: string;
    simsession_type: number;
  };
  qualify.simsession_name = "ALPHABET SOUP C MAIN";
  qualify.simsession_type = 12345;
  assert.deepEqual(RaceResultPayloadSchema.parse(document), document);
});

it("publishes race-result schemas with extensible boundaries", () => {
  const published = z.toJSONSchema(RaceResultPayloadSchema);
  const serialized = JSON.stringify(published);
  for (const id of [
    "raceResultPayload",
    "raceResultSimsessionPayload",
    "raceResultTeamPayload",
    "raceResultIndividualPayload",
    "raceResultDriverPayload",
    "raceResultTrackPayload",
  ]) {
    const definition = published.$defs?.[id];
    assert.ok(definition, `missing definition ${id}`);
    assert.deepEqual(definition.additionalProperties, {});
  }
  assert.match(serialized, /main event/);
  assert.match(
    serialized,
    /Negative values are valid upstream team identifiers/,
  );
});
