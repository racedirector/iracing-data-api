import { describe, it, expect } from "vitest";
import { resolveOptions } from "./schema.js";

const defaults = { open: true, timeoutSeconds: "300" };

describe("login input schema", () => {
  it.each(["browser", "password-limited"])("accepts method %s", (method) => {
    expect(resolveOptions.parse({ ...defaults, method }).method).toEqual(
      method,
    );
  });

  it("defaults to browser and the CLI scopes", () => {
    const options = resolveOptions.parse(defaults);
    expect(options.method).toEqual("browser");
    expect(options.scopes).toEqual(["iracing.auth", "iracing.profile"]);
    expect(options.timeoutSeconds).toEqual(300);
  });

  it.each([
    ["iracing.auth"],
    ["iracing.profile"],
    ["iracing.profile", "iracing.auth"],
    ["iracing.auth", "iracing.profile"],
    ["iracing.auth", "iracing.profile", "iracing.profile"],
  ])("accepts and deduplicates supported scopes: %j", (...scope) => {
    const options = resolveOptions.parse({ ...defaults, scope });
    expect(options.scopes).toEqual([...new Set(scope)]);
  });

  it.each([
    { method: "unknown" },
    { scope: [] },
    { scope: ["iracing.auth", "iracing.unknown"] },
    { timeoutSeconds: "0" },
    { timeoutSeconds: "bad" },
    { format: "toml" },
    { output: "one.json", credentials: "two.json" },
  ])("rejects invalid inputs without throwing from safeParse: %j", (input) => {
    expect(resolveOptions.safeParse({ ...defaults, ...input }).success).toBe(
      false,
    );
  });
});
