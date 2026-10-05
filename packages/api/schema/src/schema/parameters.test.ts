import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  MemberGetParametersSchema,
  LeagueDirectoryParametersSchema,
  StatsMemberRecapParametersSchema,
  SeasonSpectatorSubsessionidsParametersSchema,
  SeasonSpectatorSubsessionidsDetailParametersSchema,
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
