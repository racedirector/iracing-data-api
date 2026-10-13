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
  it("preserves typed IDs, order, duplicates and native booleans", () => {
    const input: import("zod").z.input<typeof MemberGetParametersSchema> = {
      cust_ids: ["2", "3", "2"],
      include_licenses: false,
    };
    assert.deepStrictEqual(MemberGetParametersSchema.parse(input), input);
    assert.deepStrictEqual(
      MemberGetParametersSchema.parse({ cust_ids: ["1"] }),
      {
        cust_ids: ["1"],
      },
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
