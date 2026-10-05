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
  it("uses comma-separated spectator filters and preserves array callers through coercion", () => {
    assert.deepEqual(
      SeasonSpectatorSubsessionidsParametersSchema.parse({
        event_types: "2,3,4,5",
      }),
      { event_types: "2,3,4,5" },
    );
    assert.deepEqual(
      SeasonSpectatorSubsessionidsDetailParametersSchema.parse({
        event_types: [2, 3],
        season_ids: "513,937",
      }),
      { event_types: "2,3", season_ids: "513,937" },
    );
    for (const event_types of ["2,,3", "invalid", ""])
      assert.equal(
        SeasonSpectatorSubsessionidsParametersSchema.safeParse({ event_types })
          .success,
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
