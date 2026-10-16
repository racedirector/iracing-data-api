/**
 * Authored shared Data API wire primitives and parameter conversions.
 *
 * Reuse these values rather than duplicating literals/coercion across endpoint
 * schemas. Zod metadata IDs and descriptions are contract inputs to the authored
 * OpenAPI helper and then generated SDK/model documentation; TypeScript comments
 * are contributor architecture and do not change generated descriptions.
 *
 * Coercion is deliberate per primitive: boolean queries accept native booleans and
 * only exact true/false strings, avoiding JavaScript truthiness; ID/number coercion
 * and enum acceptance must remain compatible with callers. Metadata overrides must
 * represent actual wire shape, not dependency convenience values. A codec can have
 * different input/output types, so inspect both before altering OpenAPI projection.
 * Historical IRacing exports below alias canonical values/types; renaming source
 * symbols alone must not rename stable metadata IDs or downstream public SDKs.
 */
import { z } from "zod";

/** Checks JWT syntax for an OAuth bearer token without verifying its signature. */
export const AccessTokenSchema = z.jwt().meta({
  description: "JWT ID Token from iRacing OAuth Service",
  id: "iracingAccessToken",
});

/** HTTP header carrying the total request allowance. */
export const RateLimitLimitHeaderKey = "x-ratelimit-limit";

/** Validates the numeric total request allowance. */
export const RateLimitLimitHeaderSchema = z.number().meta({
  title: "Rate limit limit",
  description: "The current total rate limit.",
  header: {
    id: RateLimitLimitHeaderKey,
  },
});

/** HTTP header carrying the remaining request allowance. */
export const RateLimitRemainingHeaderKey = "x-ratelimit-remaining";

/** Validates the numeric remaining request allowance. */
export const RateLimitRemainingHeaderSchema = z.number().meta({
  title: "Rate limit remaining",
  description: "How much of the rate limit you have remaining.",
  header: {
    id: RateLimitRemainingHeaderKey,
  },
});

/** HTTP header carrying the rate-limit reset timestamp. */
export const RateLimitResetHeaderKey = "x-ratelimit-reset";

/** Converts a nonnegative reset timestamp in milliseconds to a Date and back. */
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

/** Composes the total, remaining, and reset rate-limit header contracts. */
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

// HTTP query strings need explicit boolean parsing; Boolean("false") is true.
/** Accepts native booleans and exact true/false query strings without truthiness coercion. */
export const BooleanParameterSchema = z
  .preprocess((value) => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  }, z.boolean())
  .meta({ override: { type: "boolean" } });

const NonBlankNumericParameterInputSchema = z.union([
  z.number(),
  z.string().trim().min(1),
]);

// Preprocessing keeps coercion at the query boundary. Unlike a pipe with a
// numeric input override, its OpenAPI projection uses the target schema, keeping
// named enums/references and constraints intact. The input guard also rejects
// non-query values (null/booleans/arrays) and blanks before Number can turn them
// into zero. Its string | number input type matches the accepted wire values.
const numericParameter = <T extends z.ZodType<number>>(schema: T) => {
  const parameter = z.preprocess((value: string | number, ctx) => {
    const input = NonBlankNumericParameterInputSchema.safeParse(value);

    if (!input.success) {
      ctx.addIssue({
        code: "custom",
        message: "Expected a number or a non-blank numeric string.",
      });

      return z.NEVER;
    }

    return Number(input.data);
  }, schema);

  if (!(schema instanceof z.ZodNumber)) {
    return parameter;
  }

  // Match the historical scalar schema's field order as well as its content.
  // Only reorder description; never replace the target's type/constraints/ref.
  return parameter.meta({
    override: ({ jsonSchema }: { jsonSchema: Record<string, unknown> }) => {
      const { description } = jsonSchema;

      if (description === undefined) {
        return;
      }

      delete jsonSchema.description;
      jsonSchema.description = description;
    },
  });
};

/**
 * CustomerIdSchema predates the domain/wire split below and intentionally remains
 * coercive for compatibility. New numeric concepts expose a value schema plus a
 * parameter schema so response/domain validation does not inherit query coercion.
 */
export const CustomerIdSchema = z.coerce.number().meta({
  description: "Numeric ID of a customer on iRacing.",
  id: "customerId",
});

/** Validates numeric package id values without query-string coercion. */
export const PackageIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the package id domain contract. */
export const PackageIdParameterSchema = numericParameter(PackageIdSchema);

/** Validates numeric league id values without query-string coercion. */
export const LeagueIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the league id domain contract. */
export const LeagueIdParameterSchema = numericParameter(LeagueIdSchema);

/** Validates numeric league season id values without query-string coercion. */
export const LeagueSeasonIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the league season id domain contract. */
export const LeagueSeasonIdParameterSchema =
  numericParameter(LeagueSeasonIdSchema);

/** Validates numeric season id values without query-string coercion. */
export const SeasonIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the season id domain contract. */
export const SeasonIdParameterSchema = numericParameter(SeasonIdSchema);

/** Validates numeric series id values without query-string coercion. */
export const SeriesIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the series id domain contract. */
export const SeriesIdParameterSchema = numericParameter(SeriesIdSchema);

/** Validates numeric track id values without query-string coercion. */
export const TrackIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the track id domain contract. */
export const TrackIdParameterSchema = numericParameter(TrackIdSchema);

/** Validates numeric car id values without query-string coercion. */
export const CarIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the car id domain contract. */
export const CarIdParameterSchema = numericParameter(CarIdSchema);

/** Validates numeric car class id values without query-string coercion. */
export const CarClassIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the car class id domain contract. */
export const CarClassIdParameterSchema = numericParameter(CarClassIdSchema);

/** Validates numeric team id values without query-string coercion. */
export const TeamIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the team id domain contract. */
export const TeamIdParameterSchema = numericParameter(TeamIdSchema);

/** Validates numeric subsession id values without query-string coercion. */
export const SubsessionIdSchema = z.number();

/** Coerces nonblank numeric query inputs to the subsession id domain contract. */
export const SubsessionIdParameterSchema = numericParameter(SubsessionIdSchema);

/** Validates numeric race-week number values without query-string coercion. */
export const RaceWeekNumSchema = z.number();

/** Coerces nonblank numeric query inputs to the race-week number domain contract. */
export const RaceWeekNumParameterSchema = numericParameter(RaceWeekNumSchema);

/** Validates numeric season year values without query-string coercion. */
export const SeasonYearSchema = z.number();

/** Coerces nonblank numeric query inputs to the season year domain contract. */
export const SeasonYearParameterSchema = numericParameter(SeasonYearSchema);

/** Validates numeric season quarter values without query-string coercion. */
export const SeasonQuarterSchema = z.number();

/** Coerces nonblank numeric query inputs to the season quarter domain contract. */
export const SeasonQuarterParameterSchema =
  numericParameter(SeasonQuarterSchema);

/** Validates numeric simulation session number values without query-string coercion. */
export const SimSessionNumberSchema = z.number();

/** Coerces nonblank numeric query inputs to the simulation session number domain contract. */
export const SimSessionNumberParameterSchema = numericParameter(
  SimSessionNumberSchema,
);

const commaSeparatedNumberString = () =>
  z.coerce.string().regex(/^\d+(?:,\d+)*$/, {
    error: "Parameter must be a comma-separated list of numbers, e.g. '2,3,4'",
  });

/** Validates comma-separated numeric query values while retaining their string wire representation. */
export const CommaSeparatedNumberString = commaSeparatedNumberString();

/** Validates comma-separated customer identifiers without converting the wire string to an array. */
export const CustomerIdsParameterSchema = commaSeparatedNumberString();

/** Validates comma-separated category identifiers while preserving the query string. */
export const CategoryIdsParameterSchema = commaSeparatedNumberString();

/** Validates comma-separated event-type numbers while preserving the query string. */
export const EventTypesParameterSchema = commaSeparatedNumberString();

/** Accepts event type 2 for practice sessions. */
export const EventTypePracticeSchema = z
  .literal(2)
  .meta({ description: "Practice" });

/** Accepts event type 3 for qualifying sessions. */
export const EventTypeQualifyingSchema = z
  .literal(3)
  .meta({ description: "Qualifying" });

/** Accepts event type 4 for time-trial sessions. */
export const EventTypeTimeTrialSchema = z
  .literal(4)
  .meta({ description: "Time trial" });

/** Accepts event type 5 for race sessions. */
export const EventTypeRaceSchema = z.literal(5).meta({ description: "Race" });

/** Accepts the maintained practice, qualifying, time-trial, and race event numbers. */
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

/** Coerces nonblank numeric query inputs to the event type domain contract. */
export const EventTypeParameterSchema = numericParameter(EventTypeSchema);

/** Accepts the supported rating and license chart category numbers. */
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

// These established adapters expose a number input in OpenAPI while validating
// enum outputs. Keep that historical projection inside the preprocessing step.
/** Coerces nonblank numeric query inputs to the chart type domain contract. */
export const ChartTypeParameterSchema = numericParameter(
  z.number().pipe(ChartTypeSchema),
);

/** Accepts the maintained racing-discipline path literals, including legacy road. */
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

/** Validates numeric category id values without query-string coercion. */
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

/** Coerces nonblank numeric query inputs to the category id domain contract. */
export const CategoryIdParameterSchema = numericParameter(
  z.number().pipe(CategoryIdSchema),
);

/** Accepts the zero-based championship division numbers, including 10 for Rookie. */
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

/** Coerces nonblank numeric query inputs to the division domain contract. */
export const DivisionParameterSchema = numericParameter(DivisionSchema);

/**
 * Types.
 */

export type AccessToken = z.infer<typeof AccessTokenSchema>;
export type RateLimitLimitHeader = z.infer<typeof RateLimitLimitHeaderSchema>;
export type RateLimitRemainingHeader = z.infer<
  typeof RateLimitRemainingHeaderSchema
>;
export type RateLimitResetHeader = z.infer<typeof RateLimitResetHeaderSchema>;
export type RateLimitHeaders = z.infer<typeof RateLimitHeadersSchema>;
export type CustomerId = z.infer<typeof CustomerIdSchema>;
export type PackageId = z.infer<typeof PackageIdSchema>;
export type LeagueId = z.infer<typeof LeagueIdSchema>;
export type LeagueSeasonId = z.infer<typeof LeagueSeasonIdSchema>;
export type SeasonId = z.infer<typeof SeasonIdSchema>;
export type SeriesId = z.infer<typeof SeriesIdSchema>;
export type TrackId = z.infer<typeof TrackIdSchema>;
export type CarId = z.infer<typeof CarIdSchema>;
export type CarClassId = z.infer<typeof CarClassIdSchema>;
export type TeamId = z.infer<typeof TeamIdSchema>;
export type SubsessionId = z.infer<typeof SubsessionIdSchema>;
export type RaceWeekNum = z.infer<typeof RaceWeekNumSchema>;
export type SeasonYear = z.infer<typeof SeasonYearSchema>;
export type SeasonQuarter = z.infer<typeof SeasonQuarterSchema>;
export type SimSessionNumber = z.infer<typeof SimSessionNumberSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategoryId = z.infer<typeof CategoryIdSchema>;
export type Division = z.infer<typeof DivisionSchema>;
export type EventTypePractice = z.infer<typeof EventTypePracticeSchema>;
export type EventTypeQualifying = z.infer<typeof EventTypeQualifyingSchema>;
export type EventTypeTimeTrial = z.infer<typeof EventTypeTimeTrialSchema>;
export type EventTypeRace = z.infer<typeof EventTypeRaceSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;

export type ChartType = z.infer<typeof ChartTypeSchema>;

// Historical exports stay in their original module for import compatibility.
/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use AccessTokenSchema instead.
 */
export const IRacingAccessTokenSchema = AccessTokenSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use RateLimitLimitHeaderKey instead.
 */
export const IRacingRateLimitLimitHeaderKey = RateLimitLimitHeaderKey;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use RateLimitLimitHeaderSchema instead.
 */
export const IRacingRateLimitLimitHeaderSchema = RateLimitLimitHeaderSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use RateLimitRemainingHeaderKey instead.
 */
export const IRacingRateLimitRemainingHeaderKey = RateLimitRemainingHeaderKey;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use RateLimitRemainingHeaderSchema instead.
 */
export const IRacingRateLimitRemainingHeaderSchema =
  RateLimitRemainingHeaderSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use RateLimitResetHeaderKey instead.
 */
export const IRacingRateLimitResetHeaderKey = RateLimitResetHeaderKey;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use RateLimitResetHeaderSchema instead.
 */
export const IRacingRateLimitResetHeaderSchema = RateLimitResetHeaderSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use RateLimitHeadersSchema instead.
 */
export const IRacingRateLimitHeadersSchema = RateLimitHeadersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use CustomerIdSchema instead.
 */
export const IRacingCustomerIdSchema = CustomerIdSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use EventTypePracticeSchema instead.
 */
export const IRacingEventTypePracticeSchema = EventTypePracticeSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use EventTypeQualifyingSchema instead.
 */
export const IRacingEventTypeQualifyingSchema = EventTypeQualifyingSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use EventTypeTimeTrialSchema instead.
 */
export const IRacingEventTypeTimeTrialSchema = EventTypeTimeTrialSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use EventTypeRaceSchema instead.
 */
export const IRacingEventTypeRaceSchema = EventTypeRaceSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use EventTypeSchema instead.
 */
export const IRacingEventTypeSchema = EventTypeSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ChartTypeSchema instead.
 */
export const IRacingChartTypeSchema = ChartTypeSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ChartTypeParameterSchema instead.
 */
export const IRacingChartTypeParameterSchema = ChartTypeParameterSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use CategorySchema instead.
 */
export const IRacingCategorySchema = CategorySchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use CategoryIdSchema instead.
 */
export const IRacingCategoryIdSchema = CategoryIdSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use CategoryIdParameterSchema instead.
 */
export const IRacingCategoryIdParameterSchema = CategoryIdParameterSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use DivisionSchema instead.
 */
export const IRacingDivisionSchema = DivisionSchema;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use AccessToken instead.
 */
export type IRacingAccessToken = AccessToken;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use RateLimitLimitHeader instead.
 */
export type IRacingRateLimitLimitHeader = RateLimitLimitHeader;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use RateLimitRemainingHeader instead.
 */
export type IRacingRateLimitRemainingHeader = RateLimitRemainingHeader;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use RateLimitResetHeader instead.
 */
export type IRacingRateLimitResetHeader = RateLimitResetHeader;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use RateLimitHeaders instead.
 */
export type IRacingRateLimitHeaders = RateLimitHeaders;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use CustomerId instead.
 */
export type IRacingCustomerId = CustomerId;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use Category instead.
 */
export type IRacingCategory = Category;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use Division instead.
 */
export type IRacingDivision = Division;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use EventTypePractice instead.
 */
export type IRacingEventTypePractice = EventTypePractice;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use EventTypeQualifying instead.
 */
export type IRacingEventTypeQualifying = EventTypeQualifying;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use EventTypeTimeTrial instead.
 */
export type IRacingEventTypeTimeTrial = EventTypeTimeTrial;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use EventTypeRace instead.
 */
export type IRacingEventTypeRace = EventTypeRace;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use EventType instead.
 */
export type IRacingEventType = EventType;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ChartType instead.
 */
export type IRacingChartType = ChartType;
