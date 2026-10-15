import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import * as apiSchema from "../index";
import {
  CarClassIdParameterSchema,
  CarClassIdSchema,
  CarIdParameterSchema,
  CarIdSchema,
  CategoryIdParameterSchema,
  CategoryIdsParameterSchema,
  ChartTypeParameterSchema,
  CommaSeparatedNumberString,
  CustomerIdSchema,
  CustomerIdsParameterSchema,
  DivisionParameterSchema,
  EventTypeParameterSchema,
  EventTypesParameterSchema,
  LeagueIdParameterSchema,
  LeagueIdSchema,
  LeagueSeasonIdParameterSchema,
  LeagueSeasonIdSchema,
  PackageIdParameterSchema,
  PackageIdSchema,
  RaceWeekNumParameterSchema,
  RaceWeekNumSchema,
  SeasonIdParameterSchema,
  SeasonIdSchema,
  SeasonQuarterParameterSchema,
  SeasonQuarterSchema,
  SeasonYearParameterSchema,
  SeasonYearSchema,
  SeriesIdParameterSchema,
  SeriesIdSchema,
  SimSessionNumberParameterSchema,
  SimSessionNumberSchema,
  SubsessionIdParameterSchema,
  SubsessionIdSchema,
  TeamIdParameterSchema,
  TeamIdSchema,
  TrackIdParameterSchema,
  TrackIdSchema,
} from "./primitives";

describe("semantic numeric primitives", () => {
  const cases = [
    ["package ID", PackageIdSchema, PackageIdParameterSchema],
    ["league ID", LeagueIdSchema, LeagueIdParameterSchema],
    ["league season ID", LeagueSeasonIdSchema, LeagueSeasonIdParameterSchema],
    ["season ID", SeasonIdSchema, SeasonIdParameterSchema],
    ["series ID", SeriesIdSchema, SeriesIdParameterSchema],
    ["track ID", TrackIdSchema, TrackIdParameterSchema],
    ["car ID", CarIdSchema, CarIdParameterSchema],
    ["car class ID", CarClassIdSchema, CarClassIdParameterSchema],
    ["team ID", TeamIdSchema, TeamIdParameterSchema],
    ["subsession ID", SubsessionIdSchema, SubsessionIdParameterSchema],
    ["race week number", RaceWeekNumSchema, RaceWeekNumParameterSchema],
    ["season year", SeasonYearSchema, SeasonYearParameterSchema],
    ["season quarter", SeasonQuarterSchema, SeasonQuarterParameterSchema],
    [
      "sim session number",
      SimSessionNumberSchema,
      SimSessionNumberParameterSchema,
    ],
  ] as const;

  for (const [name, valueSchema, parameterSchema] of cases) {
    it(`${name} separates domain values from query coercion`, () => {
      assert.equal(valueSchema.parse(42), 42);
      assert.equal(valueSchema.safeParse("42").success, false);
      assert.equal(parameterSchema.parse("42"), 42);
      assert.equal(parameterSchema.parse(42), 42);
      for (const invalid of [
        "foo",
        "",
        "   ",
        "\t\n",
        null,
        undefined,
        true,
        false,
        [],
        ["42"],
        {},
        NaN,
        Infinity,
      ]) {
        assert.equal(parameterSchema.safeParse(invalid).success, false);
      }
    });
  }

  it("preserves meaningful zero and negative values where the API uses them", () => {
    assert.equal(RaceWeekNumParameterSchema.parse("0"), 0);
    assert.equal(SimSessionNumberParameterSchema.parse("-1"), -1);
  });

  it("keeps the historical customer ID coercion contract", () => {
    assert.equal(CustomerIdSchema.parse("42"), 42);
    assert.equal(CustomerIdSchema.parse(""), 0);
    assert.equal(CustomerIdSchema.parse("   "), 0);
    assert.equal(CustomerIdSchema.safeParse("invalid").success, false);
  });
});

describe("semantic parameter primitives", () => {
  it("coerces numeric enum query values through their domain schemas", () => {
    assert.equal(CategoryIdParameterSchema.parse("5"), 5);
    assert.equal(EventTypeParameterSchema.parse("5"), 5);
    assert.equal(DivisionParameterSchema.parse("10"), 10);
    assert.equal(ChartTypeParameterSchema.parse("1"), 1);

    assert.equal(CategoryIdParameterSchema.safeParse("7").success, false);
    assert.equal(EventTypeParameterSchema.safeParse("1").success, false);
    assert.equal(DivisionParameterSchema.safeParse("11").success, false);
    assert.equal(ChartTypeParameterSchema.safeParse("4").success, false);

    for (const schema of [
      CategoryIdParameterSchema,
      EventTypeParameterSchema,
      DivisionParameterSchema,
      ChartTypeParameterSchema,
    ]) {
      for (const invalid of [
        "foo",
        "",
        "   ",
        null,
        undefined,
        true,
        [],
        ["1"],
      ]) {
        assert.equal(schema.safeParse(invalid).success, false);
      }
    }
  });

  it("keeps CSV wire formats semantic without changing serialization", () => {
    for (const schema of [
      CustomerIdsParameterSchema,
      CategoryIdsParameterSchema,
      EventTypesParameterSchema,
    ]) {
      assert.equal(schema.parse(1), "1");
      assert.equal(schema.parse("1,2,3"), "1,2,3");
      assert.equal(schema.safeParse("1,,3").success, false);
      assert.equal(schema.safeParse("one,two").success, false);
    }
  });
});

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

describe("package exports", () => {
  it("exports the canonical primitive vocabulary from the package root", () => {
    for (const name of [
      "CustomerIdSchema",
      "SubsessionIdSchema",
      "SeasonIdSchema",
      "LeagueSeasonIdSchema",
      "SeriesIdSchema",
      "TrackIdSchema",
      "CarIdSchema",
      "CarClassIdSchema",
      "TeamIdSchema",
      "PackageIdSchema",
      "RaceWeekNumSchema",
      "SeasonYearSchema",
      "SeasonQuarterSchema",
      "SimSessionNumberSchema",
      "CustomerIdsParameterSchema",
      "CategoryIdsParameterSchema",
      "EventTypesParameterSchema",
    ]) {
      assert.ok(name in apiSchema, `missing package export ${name}`);
    }
  });
});
