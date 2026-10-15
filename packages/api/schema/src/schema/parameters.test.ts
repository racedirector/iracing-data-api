import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  LeagueDirectoryParametersSchema,
  LeagueSeasonStandingsParametersSchema,
  MemberGetParametersSchema,
  ResultsGetParametersSchema,
  ResultsLapDataParametersSchema,
  ResultsSearchHostedParametersSchema,
  ResultsSearchSeriesParametersSchema,
  ResultsSeasonResultsParametersSchema,
  SeasonSpectatorSubsessionidsParametersSchema,
  SeasonSpectatorSubsessionidsDetailParametersSchema,
  StatsMemberRecapParametersSchema,
  StatsSeasonDriverStandingsParametersSchema,
  StatsWorldRecordsParametersSchema,
} from "./parameters";

describe("MemberGetParameters", () => {
  it("coerces single integers", () => {
    const integerValue = MemberGetParametersSchema.parse({
      cust_ids: 1,
    });
    assert.deepStrictEqual(integerValue, {
      cust_ids: "1",
    });
  });

  it("preserves cust_ids as a string", () => {
    const singleValue = MemberGetParametersSchema.parse({
      cust_ids: "1",
    });
    const multipleValues = MemberGetParametersSchema.parse({
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

describe("semantic endpoint parameters", () => {
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
      ResultsGetParametersSchema.safeParse({ subsession_id: "invalid" }).success,
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
