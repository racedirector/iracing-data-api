import { z } from "zod";

export const IRacingAccessTokenSchema = z.jwt().meta({
  description: "JWT ID Token from iRacing OAuth Service",
  id: "iracingAccessToken",
});

export const IRacingRateLimitLimitHeaderKey = "x-ratelimit-limit";
export const IRacingRateLimitLimitHeaderSchema = z.number().meta({
  title: "Rate limit limit",
  description: "The current total rate limit.",
  header: {
    id: IRacingRateLimitLimitHeaderKey,
  },
});

export const IRacingRateLimitRemainingHeaderKey = "x-ratelimit-remaining";
export const IRacingRateLimitRemainingHeaderSchema = z.number().meta({
  title: "Rate limit remaining",
  description: "How much of the rate limit you have remaining.",
  header: {
    id: IRacingRateLimitRemainingHeaderKey,
  },
});

export const IRacingRateLimitResetHeaderKey = "x-ratelimit-reset";
export const IRacingRateLimitResetHeaderSchema = z
  .codec(z.int().min(0), z.date(), {
    decode: (millis) => new Date(millis),
    encode: (date) => date.getTime(),
  })
  .meta({
    title: "Rate limit reset",
    description: "When the rate limit will reset in epoch timestamp.",
    header: {
      id: IRacingRateLimitResetHeaderKey,
    },
  });

export const IRacingRateLimitHeadersSchema = z
  .object({
    [IRacingRateLimitLimitHeaderKey]: IRacingRateLimitLimitHeaderSchema,
    [IRacingRateLimitRemainingHeaderKey]: IRacingRateLimitRemainingHeaderSchema,
    [IRacingRateLimitResetHeaderKey]: IRacingRateLimitResetHeaderSchema,
  })
  .meta({
    title: "Rate limit headers",
    description:
      "Headers included with every request, indicating current rate limit status for the requesting session.",
  });

export const IRacingCustomerIdSchema = z.coerce.number().meta({
  description: "Numeric ID of a customer on iRacing.",
  id: "customerId",
});

export const CommaSeparatedNumberString = z.string().regex(/^\d+(?:,\d+)*$/, {
  message: "Parameter must be a comma-separated list of numbers, e.g. '2,3,4'",
});

export const IRacingEventTypePracticeSchema = z
  .literal(2)
  .meta({ description: "Practice" });

export const IRacingEventTypeQualifyingSchema = z
  .literal(3)
  .meta({ description: "Qualifying" });

export const IRacingEventTypeTimeTrialSchema = z
  .literal(4)
  .meta({ description: "Time trial" });

export const IRacingEventTypeRaceSchema = z
  .literal(5)
  .meta({ description: "Race" });

export const IRacingEventTypeSchema = z
  .union([
    IRacingEventTypePracticeSchema,
    IRacingEventTypeQualifyingSchema,
    IRacingEventTypeTimeTrialSchema,
    IRacingEventTypeRaceSchema,
  ])
  .meta({
    id: "iracingEventType",
    description: "iRacing Event Type",
  });

export const IRacingChartTypeSchema = z
  .union([
    z.literal(1).meta({ description: "iRating" }),
    z.literal(2).meta({ description: "Time trial rating" }),
    z.literal(3).meta({ description: "License rating" }),
  ])
  .meta({
    id: "iracingChartType",
    description: "iRacing Chart Type",
  });

export const IRacingChartTypeParameterSchema = z.coerce
  .number()
  .pipe(IRacingChartTypeSchema);

export const IRacingCategorySchema = z
  .union([
    z.literal("oval").meta({ description: "Oval discipline" }),
    z.literal("road").meta({
      description:
        "Road discipline. Legacy, use `sports_car` or `formula_car` instead.",
    }),
    z.literal("dirt_road").meta({ description: "Dirt road discipline." }),
    z.literal("dirt_oval").meta({ description: "Dirt oval discipline." }),
    z.literal("sports_car").meta({ description: "Sports car discipline." }),
    z.literal("formula_car").meta({ description: "Formula car discipline." }),
  ])
  .meta({
    description: "Racing category.",
    id: "iracingCategory",
  });

export const IRacingCategoryIdSchema = z
  .union([
    z.literal(1).meta({ description: "Oval" }),
    z.literal(2).meta({ description: "Road" }),
    z.literal(3).meta({ description: "Dirt Oval" }),
    z.literal(4).meta({ description: "Dirt Road" }),
    z.literal(5).meta({ description: "Sports car" }),
    z.literal(6).meta({ description: "Formula" }),
  ])
  .meta({
    description: "Racing category ID.",
    id: "iracingCategoryId",
  });

export const IRacingCategoryIdParameterSchema = z.coerce
  .number()
  .pipe(IRacingCategoryIdSchema);

export const IRacingDivisionSchema = z
  .union([
    z.literal(0).meta({
      description: "Division 1",
    }),
    z.literal(1).meta({
      description: "Division 2",
    }),
    z.literal(2).meta({
      description: "Division 3",
    }),
    z.literal(3).meta({
      description: "Division 4",
    }),
    z.literal(4).meta({
      description: "Division 5",
    }),
    z.literal(5).meta({
      description: "Division 6",
    }),
    z.literal(6).meta({
      description: "Division 7",
    }),
    z.literal(7).meta({
      description: "Division 8",
    }),
    z.literal(8).meta({
      description: "Division 9",
    }),
    z.literal(9).meta({
      description: "Division 10",
    }),
    z.literal(10).meta({
      description: "Rookie",
    }),
  ])
  .meta({
    description:
      "iRacing Divisions. Divisions are 0-based: 0 is Division 1, 10 is Rookie. See /data/constants/divisons for more information.",
    id: "iracingDivision",
  });

/**
 * Types
 */

export type IRacingAccessToken = z.infer<typeof IRacingAccessTokenSchema>;
export type IRacingRateLimitLimitHeader = z.infer<
  typeof IRacingRateLimitLimitHeaderSchema
>;
export type IRacingRateLimitRemainingHeader = z.infer<
  typeof IRacingRateLimitRemainingHeaderSchema
>;
export type IRacingRateLimitResetHeader = z.infer<
  typeof IRacingRateLimitResetHeaderSchema
>;
export type IRacingRateLimitHeaders = z.infer<
  typeof IRacingRateLimitHeadersSchema
>;
export type IRacingCustomerId = z.infer<typeof IRacingCustomerIdSchema>;
export type IRacingCategory = z.infer<typeof IRacingCategorySchema>;
export type IRacingDivision = z.infer<typeof IRacingDivisionSchema>;
export type IRacingEventTypePractice = z.infer<
  typeof IRacingEventTypePracticeSchema
>;
export type IRacingEventTypeQualifying = z.infer<
  typeof IRacingEventTypeQualifyingSchema
>;
export type IRacingEventTypeTimeTrial = z.infer<
  typeof IRacingEventTypeTimeTrialSchema
>;
export type IRacingEventTypeRace = z.infer<typeof IRacingEventTypeRaceSchema>;
export type IRacingEventType = z.infer<typeof IRacingEventTypeSchema>;

export type IRacingChartType = z.infer<typeof IRacingChartTypeSchema>;
