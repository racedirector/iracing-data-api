export type DumpFormat = "json" | "yaml";

export const isDumpFormat = (format: unknown): format is DumpFormat => {
  return typeof format === "string" && (format === "json" || format === "yaml");
};

export const assertDumpFormat = (
  format: unknown
): asserts format is DumpFormat => {
  if (!isDumpFormat(format)) {
    throw new Error(
      `Invalid dump format: ${format}. Must be "json" or "yaml".`
    );
  }
};
