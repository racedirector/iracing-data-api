import { strict as assert } from "node:assert";
import { it } from "node:test";
import {
  ConstantsResponseSchema,
  ResultsSearchSeriesResponseSchema,
  ServiceMethodDocsResponseSchema,
  ServicesDocsResponseSchema,
} from "./responses";

it("accepts documentation with omitted parameters and retains string or array notes", () => {
  for (const note of [
    "Constant; returned directly as an array of objects",
    ["image paths are relative to https://images-static.iracing.com/"],
  ]) {
    const method = {
      link: "https://members-ng.iracing.com/data/car/get",
      expirationSeconds: 900,
      note,
    };
    assert.deepEqual(
      ServicesDocsResponseSchema.parse({ car: { get: method } }),
      { car: { get: method } },
    );
  }
});
it("accepts empty/populated parameter maps and rejects malformed documents", () => {
  const link = "https://members-ng.iracing.com/data/results/get";
  assert.deepEqual(
    ServiceMethodDocsResponseSchema.parse({ link, parameters: {} }),
    { link, parameters: {} },
  );
  assert.deepEqual(
    ServiceMethodDocsResponseSchema.parse({
      link,
      parameters: { subsession_id: { type: "number", required: true } },
    }).parameters,
    { subsession_id: { type: "number", required: true } },
  );
  for (const value of [
    { link, parameters: null },
    { link, parameters: { x: {} } },
    { link, note: 123 },
  ])
    assert.equal(
      ServiceMethodDocsResponseSchema.safeParse(value).success,
      false,
    );
});

it("validates direct constant object arrays without inventing their field contract", () => {
  const value = [
    { value: 1, label: "Example", unknown_field: { nested: true } },
  ];
  assert.deepEqual(ConstantsResponseSchema.parse(value), value);
  for (const invalid of [{ link: "https://example.com" }, [1], null])
    assert.equal(ConstantsResponseSchema.safeParse(invalid).success, false);
});

it("validates zero, one, and multi-chunk search-series manifests", () => {
  for (const fixture of [
    { rows: 0, chunkFileNames: [], success: true },
    { rows: 1, chunkFileNames: ["chunk-0.json"], success: true },
    {
      rows: 750,
      chunkFileNames: ["chunk-0.json", "chunk-1.json"],
      success: true,
    },
    { rows: 0, chunkFileNames: [], success: false },
  ]) {
    const value = {
      type: "search_series_results" as const,
      data: {
        success: fixture.success,
        chunk_info: {
          chunk_size: 500,
          num_chunks: fixture.chunkFileNames.length,
          rows: fixture.rows,
          base_download_url: "https://scorpio-assets.s3.amazonaws.com/results/",
          chunk_file_names: fixture.chunkFileNames,
        },
        params: {
          start_range_begin: "2026-10-01T00:00:00Z",
          start_range_end: "2026-10-02T00:00:00Z",
          category_ids: [1, 2],
        },
      },
    };

    assert.deepEqual(ResultsSearchSeriesResponseSchema.parse(value), value);
  }
});

it("rejects link envelopes and malformed search-series manifests", () => {
  const value = {
    type: "search_series_results" as const,
    data: {
      success: true,
      chunk_info: {
        chunk_size: 500,
        num_chunks: 2,
        rows: 750,
        base_download_url: "https://scorpio-assets.s3.amazonaws.com/results/",
        chunk_file_names: ["chunk-0.json", "chunk-1.json"],
      },
      params: {},
    },
  };

  for (const invalid of [
    { link: "https://example.com", expires: "2026-10-01T00:00:00Z" },
    { ...value, type: "search_hosted_results" },
    {
      ...value,
      data: {
        ...value.data,
        chunk_info: { ...value.data.chunk_info, rows: -1 },
      },
    },
    {
      ...value,
      data: {
        ...value.data,
        chunk_info: { ...value.data.chunk_info, chunk_file_names: "chunk.json" },
      },
    },
  ])
    assert.equal(
      ResultsSearchSeriesResponseSchema.safeParse(invalid).success,
      false,
    );
});
