import { z } from "zod";

export const DivisionSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
]);

export type Division = z.infer<typeof DivisionSchema>;

export const CategoryIdEnum = {
  Oval: 1,
  Road: 2,
  DirtOval: 3,
  DirtRoad: 4,
} as const;

export type CategoryIdKey = keyof typeof CategoryIdEnum;
export type CategoryIdValue = (typeof CategoryIdEnum)[CategoryIdKey];

export const CategoryIdKeySchema = z.enum(
  Object.keys(CategoryIdEnum) as [CategoryIdKey, ...CategoryIdKey[]]
);

export const CategoryIdValueSchema = z.union(
  (Object.values(CategoryIdEnum) as readonly number[]).map((n) =>
    z.literal(n)
  ) as [z.ZodLiteral<number>, ...z.ZodLiteral<number>[]]
);

export const CategoryIdEnumSchema = z.enum(CategoryIdEnum);
export type CategoryId = z.infer<typeof CategoryIdEnumSchema>;

export const ChartTypeEnum = {
  iRating: 1,
  TTRating: 2,
  LicenseRating: 3,
} as const;

export type ChartTypeKey = keyof typeof ChartTypeEnum;
export type ChartTypeValue = (typeof ChartTypeEnum)[ChartTypeKey];

export const ChartTypeKeySchema = z.enum(
  Object.keys(ChartTypeEnum) as [ChartTypeKey, ...ChartTypeKey[]]
);

export const ChartTypeValueSchema = z.union(
  (Object.values(ChartTypeEnum) as readonly number[]).map((n) =>
    z.literal(n)
  ) as [z.ZodLiteral<number>, ...z.ZodLiteral<number>[]]
);
