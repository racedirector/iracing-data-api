const assert = require("node:assert/strict");
const test = require("node:test");

test("docs schema transforms RawOptions into validated Options", async () => {
  const { RawOptionsSchema, OptionsSchema } =
    await import("../dist/commands/docs/index.js");
  const raw = RawOptionsSchema.parse({
    credentials: "selected.yaml",
    output: "docs.yml",
    force: true,
  });
  assert.deepEqual(raw, {
    credentials: "selected.yaml",
    output: "docs.yml",
    force: true,
  });
  assert.deepEqual(OptionsSchema.parse(raw), {
    credentials: "selected.yaml",
    output: "docs.yml",
    format: "yaml",
    force: true,
  });
});

test("docs schema owns format inference and respects explicit formats", async () => {
  const { OptionsSchema } =
    await import("../dist/commands/docs/index.js");
  assert.equal(OptionsSchema.parse({}).format, "json");
  assert.equal(OptionsSchema.parse({ output: "report.YAML" }).format, "yaml");
  assert.equal(OptionsSchema.parse({ output: "report.yml" }).format, "yaml");
  assert.equal(OptionsSchema.parse({ output: "report.txt" }).format, "json");
  assert.equal(
    OptionsSchema.parse({ output: "report.yml", format: "json" }).format,
    "json",
  );
});

test("docs schema rejects unsupported or unknown raw input", async () => {
  const { RawOptionsSchema, OptionsSchema } =
    await import("../dist/commands/docs/index.js");
  const unsupported = OptionsSchema.safeParse({ format: "toml" });
  assert.equal(unsupported.success, false);
  assert.match(unsupported.error.message, /Unsupported output format: toml/);
  assert.equal(RawOptionsSchema.safeParse({ extra: true }).success, false);
  assert.equal(RawOptionsSchema.safeParse({ force: "yes" }).success, false);
});

test("shared request schema validates normalized input and writer options", async () => {
  const { DocumentInputSchema, DocumentOutputSchema } =
    await import("../dist/services/request.js");
  const normalized = {
    credentials: "selected.json",
    output: "docs.yml",
    format: "yaml",
    force: true,
  };
  assert.deepEqual(DocumentInputSchema.parse(normalized), normalized);
  assert.equal(DocumentInputSchema.safeParse({ format: "toml" }).success, false);
  assert.equal(DocumentInputSchema.safeParse({}).success, false);
  assert.deepEqual(
    DocumentOutputSchema.parse({
      ...normalized,
      outputLabel: "Documentation",
    }),
    { ...normalized, outputLabel: "Documentation" },
  );
});
