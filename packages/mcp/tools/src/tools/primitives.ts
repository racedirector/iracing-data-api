import { z } from "zod";

/** Accepts positive safe integer identifiers; fractional and zero IDs are rejected. */
export const Id = z.int().positive().max(Number.MAX_SAFE_INTEGER);

/** Trims search text before enforcing a length of 2 to 100 characters. */
export const query = z.string().trim().min(2).max(100);

/** Bounds page size to 1–100 integers and supplies 25 when omitted. */
export const limit = z.int().min(1).max(100).default(25);

/** Accepts integer season years from 2000 through 2100 inclusive. */
export const seasonYear = z.int().min(2000).max(2100);

/** Accepts integer season quarters from one through four inclusive. */
export const seasonQuarter = z.int().min(1).max(4);

/** Rejects extra continuation arguments and bounds the opaque cursor to 1–512 characters. */
export const ContinuationInput = z.strictObject({
  cursor: z.string().min(1).max(512),
});

/** Accepts string fields without trimming, coercion, or an empty-string restriction. */
export const text = z.string();

/** Normalizes omitted and null text fields to null while preserving supplied strings. */
export const optionalText = text.nullish().transform((value) => value ?? null);

/** Normalizes absent IDs to null while enforcing positive safe integers for present IDs. */
export const optionalId = Id.nullish().transform((value) => value ?? null);

/** Normalizes omitted and null counts to null; present values must be integers. */
export const optionalInteger = z
  .int()
  .nullish()
  .transform((value) => value ?? null);

/** Normalizes absent numeric measurements to null without coercing strings. */
export const optionalNumber = z
  .number()
  .nullish()
  .transform((value) => value ?? null);

/** Normalizes absent boolean flags to null without coercing truthy values. */
export const optionalBoolean = z
  .boolean()
  .nullish()
  .transform((value) => value ?? null);

/** Converts zero-based integer positions to one-based positions; missing and negative positions become null. */
export const position = z
  .int()
  .max(Number.MAX_SAFE_INTEGER - 1)
  .nullish()
  .transform((value) => (value == null || value < 0 ? null : value + 1));
