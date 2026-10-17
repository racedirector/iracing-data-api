import { describe, it, expect } from "vitest";
import { resolveLoginMethod, LoginScopesSchema } from "./schema";

describe("resolveLoginMethod", () => {
  describe("accepts known values", () => {
    it("accepts 'browser'", () => {
      const result = resolveLoginMethod.safeParse("browser");
      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });
    it("accepts 'password-limited'", () => {
      const result = resolveLoginMethod.safeParse("password-limited");
      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });
  });

  describe("rejects unknown values", () => {
    it("rejects arbitrary strings", () => {
      const result = resolveLoginMethod.safeParse("unknown");
      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it("defaults undefined to 'browser'", () => {
      const result = resolveLoginMethod.safeParse(undefined);
      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data).toEqual("browser");
    });
  });
});

describe("LoginScopesSchema", () => {
  describe("accepts known values", () => {
    it("accepts single scopes", () => {
      const result = LoginScopesSchema.safeParse(["iracing.auth"]);
      expect(result.error).toBeUndefined();
    });

    it("accepts all scopes", () => {
      const result = LoginScopesSchema.safeParse([
        "iracing.profile",
        "iracing.auth",
      ]);

      expect(result.error).toBeUndefined();
    });

    it("deduplicates scopes", () => {
      const result = LoginScopesSchema.safeParse([
        "iracing.profile",
        "iracing.auth",
        "iracing.auth",
        "iracing.auth",
      ]);

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(["iracing.profile", "iracing.auth"]);
    });

    it("provides defaults for undefined", () => {
      const result = LoginScopesSchema.safeParse(undefined);

      expect(result.error).toBeUndefined();
      expect(result.data).toContain("iracing.profile");
      expect(result.data).toContain("iracing.auth");
    });
  });

  it("rejects empty arrays", () => {
    const result = LoginScopesSchema.safeParse([]);
    expect(result.error).toBeDefined();
  });

  it("rejects the whole value for invalid items", () => {
    const result = LoginScopesSchema.safeParse([
      "iracing.profile",
      "iracing.auth",
      "iracing.auth",
      "iracing.unknown",
    ]);

    expect(result.error).toBeDefined();
  });
});
