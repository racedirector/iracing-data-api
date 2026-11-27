import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  LeagueDirectoryParametersSchema,
  LeagueSeasonStandingsParametersSchema,
  MemberGetParametersSchema,
  LookupParametersSchema,
  ResultsGetParametersSchema,
  ResultsLapDataParametersSchema,
  ResultsSearchHostedParametersSchema,
  ResultsSearchSeriesParametersSchema,
  ResultsSeasonResultsParametersSchema,
  SeasonSpectatorSubsessionidsParametersSchema,
  SeasonSpectatorSubsessionidsDetailParametersSchema,
  StatsMemberRecapParametersSchema,
  StatsMemberDivisionParametersSchema,
  StatsSeasonDriverStandingsParametersSchema,
  StatsWorldRecordsParametersSchema,
} from "./parameters";

describe("LookupParameters", () => {
  it("preserves repeated selectors and omission without inventing defaults", () => {
    assert.deepEqual(LookupParametersSchema.parse({}), {});
    assert.deepEqual(
      LookupParametersSchema.parse({
        weather: ["weather_wind_speed_units", "weather_wind_speed_max"],
        licenselevels: ["licenselevels"],
      }),
      {
        weather: ["weather_wind_speed_units", "weather_wind_speed_max"],
        licenselevels: ["licenselevels"],
      },
    );
  });

  it("rejects empty selectors and scalar values", () => {
    for (const weather of [[], [""], "weather_wind_speed_units"]) {
      assert.equal(
        LookupParametersSchema.safeParse({ weather }).success,
        false,
      );
    }
  });
});

describe("MemberGetParameters", () => {
  it("preserves typed IDs, order, duplicates and native booleans", () => {
    const input: import("zod").z.input<typeof MemberGetParametersSchema> = {
      cust_ids: ["2", "3", "2"],
      include_licenses: false,
    };
    assert.deepStrictEqual(MemberGetParametersSchema.parse(input), input);
    assert.deepStrictEqual(
      MemberGetParametersSchema.parse({ cust_ids: ["1"] }),
      { cust_ids: ["1"] },
    );
  });

  it("rejects wire strings and invalid application values", () => {
    for (const cust_ids of [
      undefined,
      [],
      1,
      "1,2",
      [1],
      ["bad"],
      ["1,2"],
      [""],
    ]) {
      assert.equal(
        MemberGetParametersSchema.safeParse({ cust_ids }).success,
        false,
      );
    }
    for (const include_licenses of ["true", "false", 1, null]) {
      assert.equal(
        MemberGetParametersSchema.safeParse({
          cust_ids: ["1"],
          include_licenses,
        }).success,
        false,
      );
    }
  });
});

describe("semantic endpoint parameters", () => {
  it("coerces member division event types while retaining the documented 4/5 restriction", () => {
    for (const event_type of [4, 5, "4", "5"]) {
      assert.deepEqual(
        StatsMemberDivisionParametersSchema.parse({
          season_id: "6434",
          event_type,
        }),
        {
          season_id: 6434,
          event_type: Number(event_type),
        },
      );
    }
    for (const event_type of ["", " ", "invalid", 2, 3]) {
      assert.equal(
        StatsMemberDivisionParametersSchema.safeParse({
          season_id: 6434,
          event_type,
        }).success,
        false,
      );
    }
  });
  it("rejects blank required and optional numbers without losing field paths", () => {
    for (const [schema, valid, field] of [
      [ResultsGetParametersSchema, { subsession_id: 42 }, "subsession_id"],
      [ResultsSearchSeriesParametersSchema, {}, "team_id"],
      [ResultsSeasonResultsParametersSchema, { season_id: 42 }, "event_type"],
      [
        StatsSeasonDriverStandingsParametersSchema,
        { season_id: 42, car_class_id: 1 },
        "division",
      ],
    ] as const) {
      assert.equal(schema.safeParse(valid).success, true);
      for (const value of ["", "   ", "foo"]) {
        const result = schema.safeParse({ ...valid, [field]: value });
        assert.equal(result.success, false);
        if (!result.success)
          assert.deepEqual(result.error.issues[0].path, [field]);
      }
    }
  });

  it("coerces canonical result identifiers at the query boundary", () => {
    assert.deepEqual(
      ResultsGetParametersSchema.parse({ subsession_id: "12345" }),
      { subsession_id: 12345 },
    );
    assert.deepEqual(
      ResultsLapDataParametersSchema.parse({
        subsession_id: "12345",
        simsession_number: "-1",
        team_id: "88",
      }),
      {
        subsession_id: 12345,
        simsession_number: -1,
        team_id: 88,
      },
    );
    assert.equal(
      ResultsGetParametersSchema.safeParse({
        subsession_id: "invalid",
      }).success,
      false,
    );
  });

  it("keeps league season identity distinct while preserving wire coercion", () => {
    assert.deepEqual(
      LeagueSeasonStandingsParametersSchema.parse({
        league_id: "9",
        season_id: "10",
        car_class_id: "11",
        car_id: "12",
      }),
      { league_id: 9, season_id: 10, car_class_id: 11, car_id: 12 },
    );
  });

  it("normalizes the previously inconsistent team ID search parameter", () => {
    assert.equal(
      ResultsSearchSeriesParametersSchema.parse({ team_id: "42" }).team_id,
      42,
    );
    assert.equal(
      ResultsSearchHostedParametersSchema.parse({ team_id: "42" }).team_id,
      42,
    );
  });

  it("coerces shared season, series, car, track, and race-week concepts", () => {
    const series = ResultsSearchSeriesParametersSchema.parse({
      season_year: "2026",
      season_quarter: "4",
      series_id: "321",
      race_week_num: "0",
      event_types: "2,5",
      category_ids: "1,5",
    });
    assert.deepEqual(series, {
      season_year: 2026,
      season_quarter: 4,
      series_id: 321,
      race_week_num: 0,
      event_types: "2,5",
      category_ids: "1,5",
    });

    const worldRecords = StatsWorldRecordsParametersSchema.parse({
      car_id: "7",
      track_id: "8",
      season_year: "2026",
      season_quarter: "4",
    });
    assert.deepEqual(worldRecords, {
      car_id: 7,
      track_id: 8,
      season_year: 2026,
      season_quarter: 4,
    });
  });

  it("coerces enum query concepts through their canonical value schemas", () => {
    assert.equal(
      ResultsSeasonResultsParametersSchema.parse({
        season_id: "513",
        event_type: "5",
      }).event_type,
      5,
    );
    assert.equal(
      StatsSeasonDriverStandingsParametersSchema.parse({
        season_id: "513",
        car_class_id: "1",
        division: "10",
      }).division,
      10,
    );
  });
});

describe("documented query wire inputs", () => {
  it("accepts calendar years and optional recap defaults", () => {
    assert.equal(
      StatsMemberRecapParametersSchema.parse({ year: "2026" }).year,
      2026,
    );
    assert.deepEqual(StatsMemberRecapParametersSchema.parse({}), {});
    assert.equal(
      StatsMemberRecapParametersSchema.safeParse({ year: "invalid" }).success,
      false,
    );
  });

  it("keeps spectator filters as validated numeric arrays", () => {
    const filters: import("./parameters").SeasonSpectatorSubsessionidsDetailParameters =
      {
        event_types: [2, 5],
        season_ids: [513, 937],
      };
    assert.deepEqual(
      SeasonSpectatorSubsessionidsDetailParametersSchema.parse(filters),
      filters,
    );
    assert.deepEqual(
      SeasonSpectatorSubsessionidsParametersSchema.parse({}),
      {},
    );
    for (const event_types of [[], [1], ["Practice"], "2,5", [2, "5"]])
      assert.equal(
        SeasonSpectatorSubsessionidsParametersSchema.safeParse({ event_types })
          .success,
        false,
      );
    assert.equal(
      SeasonSpectatorSubsessionidsDetailParametersSchema.safeParse({
        season_ids: [],
      }).success,
      false,
    );
    assert.equal(
      SeasonSpectatorSubsessionidsDetailParametersSchema.safeParse({
        season_ids: ["513"],
      }).success,
      false,
    );
  });

  it("interprets true/false query strings deliberately instead of truthiness", () => {
    assert.equal(
      LeagueDirectoryParametersSchema.parse({ restrict_to_member: "false" })
        .restrict_to_member,
      false,
    );
    assert.equal(
      LeagueDirectoryParametersSchema.parse({ restrict_to_member: "true" })
        .restrict_to_member,
      true,
    );
    assert.equal(
      LeagueDirectoryParametersSchema.parse({ restrict_to_member: false })
        .restrict_to_member,
      false,
    );
    for (const restrict_to_member of ["invalid", "", 1, null])
      assert.equal(
        LeagueDirectoryParametersSchema.safeParse({ restrict_to_member })
          .success,
        false,
      );
  });
});
