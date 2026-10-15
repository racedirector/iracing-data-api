import { z } from "zod";
export const Id = z.int().positive().max(Number.MAX_SAFE_INTEGER);
export const query = z.string().trim().min(2).max(100);
export const limit = z.int().min(1).max(100).default(25);
export const seasonYear = z.int().min(2000).max(2100);
export const seasonQuarter = z.int().min(1).max(4);
export const ContinuationInput = z.strictObject({
  cursor: z.string().min(1).max(512),
});
export const text = z.string();
export const optionalText = text.nullish().transform((value) => value ?? null);
export const optionalId = Id.nullish().transform((value) => value ?? null);
export const optionalInteger = z
  .int()
  .nullish()
  .transform((value) => value ?? null);
export const optionalNumber = z
  .number()
  .nullish()
  .transform((value) => value ?? null);
export const optionalBoolean = z
  .boolean()
  .nullish()
  .transform((value) => value ?? null);
export const position = z
  .int()
  .max(Number.MAX_SAFE_INTEGER - 1)
  .nullish()
  .transform((value) => (value == null || value < 0 ? null : value + 1));
