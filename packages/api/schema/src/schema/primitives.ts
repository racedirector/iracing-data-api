import { z } from "zod";

export const AccessTokenSchema = z.jwt().meta({
  description: "JWT ID Token from iRacing OAuth Service",
  id: "iracingAccessToken",
});

export const RateLimitLimitHeaderKey = "x-ratelimit-limit";
export const RateLimitLimitHeaderSchema = z.number().meta({
  title: "Rate limit limit",
  description: "The current total rate limit.",
  header: {
    id: RateLimitLimitHeaderKey,
  },
});

export const RateLimitRemainingHeaderKey = "x-ratelimit-remaining";
export const RateLimitRemainingHeaderSchema = z.number().meta({
  title: "Rate limit remaining",
  description: "How much of the rate limit you have remaining.",
  header: {
    id: RateLimitRemainingHeaderKey,
  },
});

export const RateLimitResetHeaderKey = "x-ratelimit-reset";
export const RateLimitResetHeaderSchema = z
  .codec(z.int().min(0), z.date(), {
    decode: (millis) => new Date(millis),
    encode: (date) => date.getTime(),
  })
  .meta({
    title: "Rate limit reset",
    description: "When the rate limit will reset in epoch timestamp.",
    header: {
      id: RateLimitResetHeaderKey,
    },
  });

export const RateLimitHeadersSchema = z
  .object({
    [RateLimitLimitHeaderKey]: RateLimitLimitHeaderSchema,
    [RateLimitRemainingHeaderKey]: RateLimitRemainingHeaderSchema,
    [RateLimitResetHeaderKey]: RateLimitResetHeaderSchema,
  })
  .meta({
    title: "Rate limit headers",
    description:
      "Headers included with every request, indicating current rate limit status for the requesting session.",
  });

export const CustomerIdSchema = z.coerce.number().meta({
  description: "Numeric ID of a customer on iRacing.",
  id: "customerId",
});

export const CommaSeparatedNumberString = z.coerce
  .string()
  .regex(/^\d+(?:,\d+)*$/, {
    message:
      "Parameter must be a comma-separated list of numbers, e.g. '2,3,4'",
  });

export const EventTypePracticeSchema = z
  .literal(2)
  .meta({ description: "Practice" });

export const EventTypeQualifyingSchema = z
  .literal(3)
  .meta({ description: "Qualifying" });

export const EventTypeTimeTrialSchema = z
  .literal(4)
  .meta({ description: "Time trial" });

export const EventTypeRaceSchema = z.literal(5).meta({ description: "Race" });

export const EventTypeSchema = z
  .union([
    EventTypePracticeSchema,
    EventTypeQualifyingSchema,
    EventTypeTimeTrialSchema,
    EventTypeRaceSchema,
  ])
  .meta({
    id: "iracingEventType",
    description: "iRacing Event Type",
  });

export const ChartTypeSchema = z
  .union([
    z.literal(1).meta({ description: "iRating" }),
    z.literal(2).meta({ description: "Time trial rating" }),
    z.literal(3).meta({ description: "License rating" }),
  ])
  .meta({
    id: "iracingChartType",
    description: "iRacing Chart Type",
  });

export const ChartTypeParameterSchema = z.coerce.number().pipe(ChartTypeSchema);

export const CategorySchema = z
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

export const CategoryIdSchema = z
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

export const CategoryIdParameterSchema = z.coerce
  .number()
  .pipe(CategoryIdSchema);

export const DivisionSchema = z
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

export type AccessToken = z.infer<typeof AccessTokenSchema>;
export type RateLimitLimitHeader = z.infer<typeof RateLimitLimitHeaderSchema>;
export type RateLimitRemainingHeader = z.infer<
  typeof RateLimitRemainingHeaderSchema
>;
export type RateLimitResetHeader = z.infer<typeof RateLimitResetHeaderSchema>;
export type RateLimitHeaders = z.infer<typeof RateLimitHeadersSchema>;
export type CustomerId = z.infer<typeof CustomerIdSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Division = z.infer<typeof DivisionSchema>;
export type EventTypePractice = z.infer<typeof EventTypePracticeSchema>;
export type EventTypeQualifying = z.infer<typeof EventTypeQualifyingSchema>;
export type EventTypeTimeTrial = z.infer<typeof EventTypeTimeTrialSchema>;
export type EventTypeRace = z.infer<typeof EventTypeRaceSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;

export type ChartType = z.infer<typeof ChartTypeSchema>;

// Historical exports stay in their original module for import compatibility.
/** @deprecated Use AccessTokenSchema instead. */
export const IRacingAccessTokenSchema = AccessTokenSchema;
/** @deprecated Use RateLimitLimitHeaderKey instead. */
export const IRacingRateLimitLimitHeaderKey = RateLimitLimitHeaderKey;
/** @deprecated Use RateLimitLimitHeaderSchema instead. */
export const IRacingRateLimitLimitHeaderSchema = RateLimitLimitHeaderSchema;
/** @deprecated Use RateLimitRemainingHeaderKey instead. */
export const IRacingRateLimitRemainingHeaderKey = RateLimitRemainingHeaderKey;
/** @deprecated Use RateLimitRemainingHeaderSchema instead. */
export const IRacingRateLimitRemainingHeaderSchema =
  RateLimitRemainingHeaderSchema;
/** @deprecated Use RateLimitResetHeaderKey instead. */
export const IRacingRateLimitResetHeaderKey = RateLimitResetHeaderKey;
/** @deprecated Use RateLimitResetHeaderSchema instead. */
export const IRacingRateLimitResetHeaderSchema = RateLimitResetHeaderSchema;
/** @deprecated Use RateLimitHeadersSchema instead. */
export const IRacingRateLimitHeadersSchema = RateLimitHeadersSchema;
/** @deprecated Use CustomerIdSchema instead. */
export const IRacingCustomerIdSchema = CustomerIdSchema;
/** @deprecated Use EventTypePracticeSchema instead. */
export const IRacingEventTypePracticeSchema = EventTypePracticeSchema;
/** @deprecated Use EventTypeQualifyingSchema instead. */
export const IRacingEventTypeQualifyingSchema = EventTypeQualifyingSchema;
/** @deprecated Use EventTypeTimeTrialSchema instead. */
export const IRacingEventTypeTimeTrialSchema = EventTypeTimeTrialSchema;
/** @deprecated Use EventTypeRaceSchema instead. */
export const IRacingEventTypeRaceSchema = EventTypeRaceSchema;
/** @deprecated Use EventTypeSchema instead. */
export const IRacingEventTypeSchema = EventTypeSchema;
/** @deprecated Use ChartTypeSchema instead. */
export const IRacingChartTypeSchema = ChartTypeSchema;
/** @deprecated Use ChartTypeParameterSchema instead. */
export const IRacingChartTypeParameterSchema = ChartTypeParameterSchema;
/** @deprecated Use CategorySchema instead. */
export const IRacingCategorySchema = CategorySchema;
/** @deprecated Use CategoryIdSchema instead. */
export const IRacingCategoryIdSchema = CategoryIdSchema;
/** @deprecated Use CategoryIdParameterSchema instead. */
export const IRacingCategoryIdParameterSchema = CategoryIdParameterSchema;
/** @deprecated Use DivisionSchema instead. */
export const IRacingDivisionSchema = DivisionSchema;
/** @deprecated Use AccessToken instead. */
export type IRacingAccessToken = AccessToken;
/** @deprecated Use RateLimitLimitHeader instead. */
export type IRacingRateLimitLimitHeader = RateLimitLimitHeader;
/** @deprecated Use RateLimitRemainingHeader instead. */
export type IRacingRateLimitRemainingHeader = RateLimitRemainingHeader;
/** @deprecated Use RateLimitResetHeader instead. */
export type IRacingRateLimitResetHeader = RateLimitResetHeader;
/** @deprecated Use RateLimitHeaders instead. */
export type IRacingRateLimitHeaders = RateLimitHeaders;
/** @deprecated Use CustomerId instead. */
export type IRacingCustomerId = CustomerId;
/** @deprecated Use Category instead. */
export type IRacingCategory = Category;
/** @deprecated Use Division instead. */
export type IRacingDivision = Division;
/** @deprecated Use EventTypePractice instead. */
export type IRacingEventTypePractice = EventTypePractice;
/** @deprecated Use EventTypeQualifying instead. */
export type IRacingEventTypeQualifying = EventTypeQualifying;
/** @deprecated Use EventTypeTimeTrial instead. */
export type IRacingEventTypeTimeTrial = EventTypeTimeTrial;
/** @deprecated Use EventTypeRace instead. */
export type IRacingEventTypeRace = EventTypeRace;
/** @deprecated Use EventType instead. */
export type IRacingEventType = EventType;
/** @deprecated Use ChartType instead. */
export type IRacingChartType = ChartType;
