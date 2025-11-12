import { z } from "zod";

/**
 * `/data` API schema
 */

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

export const IRacingErrorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string().optional(),
    note: z.string().optional(),
  })
  .meta({
    id: "errorResponse",
  });

export const IRacingCustomerIdSchema = z.coerce.number().meta({
  description: "Numeric ID of a customer on iRacing.",
  id: "customerId",
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

export const IRacingAPIResponseSchema = z
  .object({
    link: z.url().meta({ description: "A link to the cached data" }),
    expires: z.iso.datetime(),
  })
  .meta({
    description: "Response from iRacing `/data` API.",
    id: "iracingAPIResponse",
  });

export const IRacingDriverStatsByCategoryPathSchema = z.object({
  category: IRacingCategorySchema,
});

export const IRacingHostedCombinedSessionsParametersSchema = z.object({
  package_id: z.number().optional().meta({
    description:
      "If set, return only sessions using this car or track package ID.",
  }),
});

export const IRacingLeagueCustomerSessionsParametersSchema = z.object({
  mine: z.boolean().optional().meta({
    description: "If true, return only sessions created by this user.",
  }),
  package_id: z.number().optional().meta({
    description:
      "If set, return only sessions using this car or track package ID.",
  }),
});

export const IRacingLeagueDirectoryParametersSchema = z.object({
  search: z.string().optional().meta({
    description:
      "Will search against league name, description, owner, and league ID.",
  }),
  tag: z
    .string()
    .optional()
    .meta({ description: "One or more tags, comma-separated." }),
  restrict_to_member: z.boolean().optional().meta({
    description: "If true include only leagues for which customer is a member.",
  }),
  restrict_to_recruiting: z.boolean().optional().meta({
    description: "If true include only leagues which are recruiting.",
  }),
  restrict_to_friends: z
    .boolean()
    .optional()
    .meta({ description: "If true include only leagues owned by a friend." }),
  restrict_to_watched: z.boolean().optional().meta({
    description: "If true include only leagues owned by a watched member.",
  }),
  minimum_roster_count: z.number().optional().meta({
    description: "If set include leagues with at least this number of members.",
  }),
  maximum_roster_count: z.number().optional().meta({
    description:
      "If set include leagues with no more than this number of members.",
  }),
  lowerbound: z
    .number()
    .optional()
    .meta({ description: "First row of results to return.  Defaults to 1." }),
  upperbound: z.number().optional().meta({
    description: "Last row of results to return. Defaults to lowerbound + 39.",
  }),
  sort: z.string().optional().meta({
    description:
      "One of relevance, leaguename, displayname, rostercount. displayname is owners's name. Defaults to relevance.",
  }),
  order: z
    .string()
    .optional()
    .meta({ description: "One of asc or desc.  Defaults to asc." }),
});

export const IRacingLeagueGetParametersSchema = z.object({
  league_id: z.number(),
  include_licenses: z.boolean().optional().meta({
    description: "For faster responses, only request when necessary.",
  }),
});

export const IRacingLeagueGetPointsSystemsParametersSchema = z.object({
  league_id: z.number(),
  season_id: z.number().optional().meta({
    description:
      "If included and the season is using custom points (points_system_id:2) then the custom points option is included in the returned list. Otherwise the custom points option is not returned.",
  }),
});

export const IRacingLeagueMembershipParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description:
      "If different from the authenticated member, the following restrictions apply: - Caller cannot be on requested customer's block list or an empty list will result; - Requested customer cannot have their online activity preference set to hidden or an empty list will result; - Only leagues for which the requested customer is an admin and the league roster is not private are returned.",
  }),
  include_league: z.boolean().optional(),
});

export const IRacingLeagueRosterParametersSchema = z.object({
  league_id: z.number(),
  include_licenses: z.boolean().optional().meta({
    description: "For faster responses, only request when necessary.",
  }),
});

export const IRacingLeagueSeasonsParametersSchema = z.object({
  league_id: z.number(),
  retired: z.boolean().optional().meta({
    description: "If true include seasons which are no longer active.",
  }),
});

export const IRacingLeagueSeasonStandingsParametersSchema = z.object({
  league_id: z.number(),
  season_id: z.number(),
  car_class_id: z.number().optional(),
  car_id: z.number().optional().meta({
    description:
      "If car_class_id is included then the standings are for the car in that car class, otherwise they are for the car across car classes.",
  }),
});

export const IRacingLeagueSeasonSessionsParametersSchema = z.object({
  league_id: z.number(),
  season_id: z.number(),
  results_only: z.boolean().optional().meta({
    description:
      "If true include only sessions for which results are available.",
  }),
});

export const IRacingLookupDriversParametersSchema = z.object({
  search_term: z
    .string()
    .meta({ description: "A cust_id or partial name for which to search." }),
  league_id: z.number().optional().meta({
    description: "Narrow the search to the roster of the given league.",
  }),
});

export const IRacingMemberAwardsParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const IRacingMemberAwardInstancesParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  award_id: z.number(),
});

export const IRacingMemberChartDataParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  category_id: z
    .number()
    .meta({ description: "1 - Oval; 2 - Road; 3 - Dirt oval; 4 - Dirt road" }),
  chart_type: IRacingChartTypeSchema.meta({
    description: "1 - iRating; 2 - TT Rating; 3 - License/SR",
  }),
});

export const IRacingMemberGetParametersSchema = z.object({
  cust_ids: z.array(z.number()).meta({ description: "?cust_ids=2,3,4" }),
  include_licenses: z.boolean().optional(),
});

export const IRacingMemberProfileParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const IRacingResultsGetParametersSchema = z.object({
  subsession_id: z.number(),
  include_licenses: z.boolean().optional(),
});

export const IRacingResultsEventLogParametersSchema = z.object({
  subsession_id: z.number(),
  simsession_number: z.number().meta({
    description: "The main event is 0; the preceding event is -1, and so on.",
  }),
});

export const IRacingResultsLapChartDataParametersSchema = z.object({
  subsession_id: z.number(),
  simsession_number: z.number().meta({
    description: "The main event is 0; the preceding event is -1, and so on.",
  }),
});

export const IRacingResultsLapDataParametersSchema = z.object({
  subsession_id: z.number(),
  simsession_number: z.number().meta({
    description: "The main event is 0; the preceding event is -1, and so on.",
  }),
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description:
      "Required if the subsession was a single-driver event. Optional for team events. If omitted for a team event then the laps driven by all the team's drivers will be included.",
  }),
  team_id: z
    .number()
    .optional()
    .meta({ description: "Required if the subsession was a team event." }),
});

export const IRacingResultsSearchHostedParametersSchema = z.object({
  start_range_begin: z.iso.datetime().optional().meta({
    description:
      'Session start times. ISO-8601 UTC time zero offset: "2022-04-01T15:45Z".',
  }),
  start_range_end: z.iso.datetime().optional().meta({
    description:
      'ISO-8601 UTC time zero offset: "2022-04-01T15:45Z". Exclusive. May be omitted if start_range_begin is less than 90 days in the past.',
  }),
  finish_range_begin: z.iso.datetime().optional().meta({
    description:
      'Session finish times. ISO-8601 UTC time zero offset: "2022-04-01T15:45Z".',
  }),
  finish_range_end: z.iso.datetime().optional().meta({
    description:
      'ISO-8601 UTC time zero offset: "2022-04-01T15:45Z". Exclusive. May be omitted if finish_range_begin is less than 90 days in the past.',
  }),
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description:
      "The participant's customer ID. Ignored if team_id is supplied.",
  }),
  team_id: z.number().optional().meta({
    description:
      "The team ID to search for. Takes priority over cust_id if both are supplied.",
  }),
  host_cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "The host's customer ID.",
  }),
  session_name: z
    .string()
    .optional()
    .meta({ description: "Part or all of the session's name." }),
  league_id: z
    .number()
    .optional()
    .meta({ description: "Include only results for the league with this ID." }),
  league_season_id: z.number().optional().meta({
    description: "Include only results for the league season with this ID.",
  }),
  car_id: z
    .number()
    .optional()
    .meta({ description: "One of the cars used by the session." }),
  track_id: z
    .number()
    .optional()
    .meta({ description: "The ID of the track used by the session." }),
  category_ids: z.array(z.number()).optional().meta({
    description:
      "Track categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4",
  }),
});

export const IRacingResultsSearchSeriesParametersSchema = z.object({
  season_year: z
    .number()
    .optional()
    .meta({ description: "Required when using season_quarter." }),
  season_quarter: z
    .number()
    .optional()
    .meta({ description: "Required when using season_year." }),
  start_range_begin: z.iso.datetime().optional().meta({
    description:
      'Session start times. ISO-8601 UTC time zero offset: "2022-04-01T15:45Z".',
  }),
  start_range_end: z.iso.datetime().optional().meta({
    description:
      'ISO-8601 UTC time zero offset: "2022-04-01T15:45Z". Exclusive. May be omitted if start_range_begin is less than 90 days in the past.',
  }),
  finish_range_begin: z.iso.datetime().optional().meta({
    description:
      'Session finish times. ISO-8601 UTC time zero offset: "2022-04-01T15:45Z".',
  }),
  finish_range_end: z.iso.datetime().optional().meta({
    description:
      'ISO-8601 UTC time zero offset: "2022-04-01T15:45Z". Exclusive. May be omitted if finish_range_begin is less than 90 days in the past.',
  }),
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description:
      "Include only sessions in which this customer participated. Ignored if team_id is supplied.",
  }),
  team_id: z.number().optional().meta({
    description:
      "Include only sessions in which this team participated. Takes priority over cust_id if both are supplied.",
  }),
  series_id: z
    .number()
    .optional()
    .meta({ description: "Include only sessions for series with this ID." }),
  race_week_num: z
    .number()
    .optional()
    .meta({ description: "Include only sessions with this race week number." }),
  official_only: z.boolean().optional().meta({
    description:
      "If true, include only sessions earning championship points. Defaults to all.",
  }),
  event_types: z.array(z.number()).optional().meta({
    description:
      "Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5",
  }),
  category_ids: z.array(z.number()).optional().meta({
    description:
      "License categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4",
  }),
});

export const IRacingResultsSeasonResultsParametersSchema = z.object({
  season_id: z.number(),
  event_type: IRacingEventTypeSchema.optional().meta({
    description:
      "Retrict to one event type: 2 - Practice; 3 - Qualify; 4 - Time Trial; 5 - Race",
  }),
  race_week_num: z
    .number()
    .optional()
    .meta({ description: "The first race week of a season is 0." }),
});

export const IRacingSeasonListParametersSchema = z.object({
  season_year: z.number(),
  season_quarter: z.number(),
});

export const IRacingSeasonRaceGuideParametersSchema = z.object({
  from: z.iso.datetime({ offset: true }).optional().meta({
    description:
      "ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time.",
  }),
  include_end_after_from: z.boolean().optional().meta({
    description: "Include sessions which start before 'from' but end after.",
  }),
});

export const IRacingSeasonSpectatorSubsessionidsParametersSchema = z.object({
  event_types: z.array(IRacingEventTypeSchema).optional().meta({
    description:
      "Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5",
  }),
});

export const IRacingSeasonSpectatorSubsessionidsDetailParametersSchema =
  z.object({
    event_types: z.array(IRacingEventTypeSchema).optional().meta({
      description:
        "Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5",
    }),
    season_ids: z.array(z.number()).optional().meta({
      description:
        "Seasons to include in the search. Defaults to all. ?season_ids=513,937",
    }),
  });

export const IRacingSeriesPastSeasonsParametersSchema = z.object({
  series_id: z.number(),
});

export const IRacingSeriesSeasonsParametersSchema = z.object({
  include_series: z.boolean().optional(),
  season_year: z.number().optional().meta({
    description:
      "To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned.",
  }),
  season_quarter: z.number().optional().meta({
    description:
      "To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned.",
  }),
});

export const IRacingSeriesSeasonListParametersSchema = z.object({
  include_series: z.boolean().optional(),
  season_year: z.number().optional(),
  season_quarter: z.number().optional(),
});

export const IRacingSeriesSeasonScheduleParametersSchema = z.object({
  season_id: z.number(),
});

export const IRacingStatsMemberBestsParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  car_id: z.number().optional().meta({
    description:
      "First call should exclude car_id; use cars_driven list in return for subsequent calls.",
  }),
});

export const IRacingStatsMemberCareerParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const IRacingStatsMemberDivisionParametersSchema = z.object({
  season_id: z.number(),
  event_type: z
    .union([IRacingEventTypeTimeTrialSchema, IRacingEventTypeRaceSchema])
    .meta({
      description:
        "The event type code for the division type: 4 - Time Trial; 5 - Race",
    }),
});

export const IRacingStatsMemberRecapParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  year: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
    .optional()
    .meta({
      description:
        "Season year; if not supplied the current calendar year (UTC) is used.",
    }),
  season: z.number().optional().meta({
    description:
      "Season (quarter) within the year; if not supplied the recap will be for the entire year.",
  }),
});

export const IRacingStatsMemberRecentRacesParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const IRacingStatsMemberSummaryParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const IRacingStatsMemberYearlyParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const IRacingStatsSeasonDriverStandingsParametersSchema = z.object({
  season_id: z.number(),
  car_class_id: z.number(),
  division: IRacingDivisionSchema.optional(),
  race_week_num: z
    .number()
    .optional()
    .meta({ description: "The first race week of a season is 0." }),
});

export const IRacingStatsSeasonSupersessionStandingsParametersSchema = z.object(
  {
    season_id: z.number(),
    car_class_id: z.number(),
    division: IRacingDivisionSchema.optional(),
    race_week_num: z
      .number()
      .optional()
      .meta({ description: "The first race week of a season is 0." }),
  }
);

export const IRacingStatsSeasonTeamStandingsParametersSchema = z.object({
  season_id: z.number(),
  car_class_id: z.number(),
  race_week_num: z
    .number()
    .optional()
    .meta({ description: "The first race week of a season is 0." }),
});

export const IRacingStatsSeasonTTStandingsParametersSchema = z.object({
  season_id: z.number(),
  car_class_id: z.number(),
  division: IRacingDivisionSchema.optional(),
  race_week_num: z
    .number()
    .optional()
    .meta({ description: "The first race week of a season is 0." }),
});

export const IRacingStatsSeasonTTResultsParametersSchema = z.object({
  season_id: z.number(),
  car_class_id: z.number(),
  race_week_num: z
    .number()
    .meta({ description: "The first race week of a season is 0." }),
  division: IRacingDivisionSchema.optional(),
});

export const IRacingStatsSeasonQualifyResultsParametersSchema = z.object({
  season_id: z.number(),
  car_class_id: z.number(),
  race_week_num: z
    .number()
    .meta({ description: "The first race week of a season is 0." }),
  division: IRacingDivisionSchema.optional(),
});

export const IRacingStatsWorldRecordsParametersSchema = z.object({
  car_id: z.number(),
  track_id: z.number(),
  season_year: z
    .number()
    .optional()
    .meta({ description: "Limit best times to a given year." }),
  season_quarter: z.number().optional().meta({
    description:
      "Limit best times to a given quarter; only applicable when year is used.",
  }),
});

export const IRacingTeamGetParametersSchema = z.object({
  team_id: z.number(),
  include_licenses: z.boolean().optional().meta({
    description: "For faster responses, only request when necessary.",
  }),
});

export const IRacingTimeAttackMemberSeasonResultsParametersSchema = z.object({
  ta_comp_season_id: z.number(),
});

export const IRacingServiceMethodParametersDocsResponseSchema = z
  .object({
    type: z.string(),
    note: z.string().optional(),
    required: z.boolean().optional(),
  })
  .meta({
    description: "An iRacing API Service Method Parameters object.",
    id: "iracingServiceMethodParametersDocs",
  });

export const IRacingServiceMethodDocsResponseSchema = z
  .object({
    link: z.url(),
    parameters: z.record(
      z.string(),
      IRacingServiceMethodParametersDocsResponseSchema
    ),
    expirationSeconds: z.number().optional(),
  })
  .meta({
    description: "An iRacing API Service Method object.",
    id: "iracingServiceMethodDocs",
  });

export const IRacingServiceDocsResponseSchema = z
  .record(z.string(), IRacingServiceMethodDocsResponseSchema)
  .meta({
    description:
      "An index of service methods available for the requested service.",
    id: "iracingServiceDocs",
  });

export const IRacingServicesDocsResponseSchema = z
  .record(z.string(), IRacingServiceDocsResponseSchema)
  .meta({
    description: "An index of available services on the iRacing API.",
    id: "iracingServicesDocs",
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
export type IRacingAPIResponse = z.infer<typeof IRacingAPIResponseSchema>;
export type IRacingDriverStatsByCategoryPath = z.infer<
  typeof IRacingDriverStatsByCategoryPathSchema
>;

export type IRacingErrorResponse = z.infer<typeof IRacingErrorResponseSchema>;

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

export type IRacingHostedCombinedSessionsParameters = z.infer<
  typeof IRacingHostedCombinedSessionsParametersSchema
>;
export type IRacingLeagueCustomerSessionsParameters = z.infer<
  typeof IRacingLeagueCustomerSessionsParametersSchema
>;
export type IRacingLeagueDirectoryParameters = z.infer<
  typeof IRacingLeagueDirectoryParametersSchema
>;
export type IRacingLeagueGetParameters = z.infer<
  typeof IRacingLeagueGetParametersSchema
>;
export type IRacingLeagueGetPointsSystemsParameters = z.infer<
  typeof IRacingLeagueGetPointsSystemsParametersSchema
>;
export type IRacingLeagueMembershipParameters = z.infer<
  typeof IRacingLeagueMembershipParametersSchema
>;
export type IRacingLeagueRosterParameters = z.infer<
  typeof IRacingLeagueRosterParametersSchema
>;
export type IRacingLeagueSeasonsParameters = z.infer<
  typeof IRacingLeagueSeasonsParametersSchema
>;
export type IRacingLeagueSeasonStandingsParameters = z.infer<
  typeof IRacingLeagueSeasonStandingsParametersSchema
>;
export type IRacingLeagueSeasonSessionsParameters = z.infer<
  typeof IRacingLeagueSeasonSessionsParametersSchema
>;

export type IRacingLookupDriversParameters = z.infer<
  typeof IRacingLookupDriversParametersSchema
>;

export type IRacingMemberAwardsParameters = z.infer<
  typeof IRacingMemberAwardsParametersSchema
>;
export type IRacingMemberAwardInstancesParameters = z.infer<
  typeof IRacingMemberAwardInstancesParametersSchema
>;
export type IRacingMemberChartDataParameters = z.infer<
  typeof IRacingMemberChartDataParametersSchema
>;
export type IRacingMemberGetParameters = z.infer<
  typeof IRacingMemberGetParametersSchema
>;
export type IRacingMemberProfileParameters = z.infer<
  typeof IRacingMemberProfileParametersSchema
>;

export type IRacingResultsGetParameters = z.infer<
  typeof IRacingResultsGetParametersSchema
>;
export type IRacingResultsEventLogParameters = z.infer<
  typeof IRacingResultsEventLogParametersSchema
>;
export type IRacingResultsLapChartDataParameters = z.infer<
  typeof IRacingResultsLapChartDataParametersSchema
>;
export type IRacingResultsLapDataParameters = z.infer<
  typeof IRacingResultsLapDataParametersSchema
>;
export type IRacingResultsSearchHostedParameters = z.infer<
  typeof IRacingResultsSearchHostedParametersSchema
>;
export type IRacingResultsSearchSeriesParameters = z.infer<
  typeof IRacingResultsSearchSeriesParametersSchema
>;
export type IRacingResultsSeasonResultsParameters = z.infer<
  typeof IRacingResultsSeasonResultsParametersSchema
>;

export type IRacingSeasonListParameters = z.infer<
  typeof IRacingSeasonListParametersSchema
>;
export type IRacingSeasonRaceGuideParameters = z.infer<
  typeof IRacingSeasonRaceGuideParametersSchema
>;
export type IRacingSeasonSpectatorSubsessionidsParameters = z.infer<
  typeof IRacingSeasonSpectatorSubsessionidsParametersSchema
>;
export type IRacingSeasonSpectatorSubsessionidsDetailParameters = z.infer<
  typeof IRacingSeasonSpectatorSubsessionidsDetailParametersSchema
>;

export type IRacingSeriesPastSeasonsParameters = z.infer<
  typeof IRacingSeriesPastSeasonsParametersSchema
>;
export type IRacingSeriesSeasonsParameters = z.infer<
  typeof IRacingSeriesSeasonsParametersSchema
>;
export type IRacingSeriesSeasonListParameters = z.infer<
  typeof IRacingSeriesSeasonListParametersSchema
>;
export type IRacingSeriesSeasonScheduleParameters = z.infer<
  typeof IRacingSeriesSeasonScheduleParametersSchema
>;

export type IRacingStatsMemberBestsParameters = z.infer<
  typeof IRacingStatsMemberBestsParametersSchema
>;
export type IRacingStatsMemberCareerParameters = z.infer<
  typeof IRacingStatsMemberCareerParametersSchema
>;
export type IRacingStatsMemberDivisionParameters = z.infer<
  typeof IRacingStatsMemberDivisionParametersSchema
>;
export type IRacingStatsMemberRecapParameters = z.infer<
  typeof IRacingStatsMemberRecapParametersSchema
>;
export type IRacingStatsMemberRecentRacesParameters = z.infer<
  typeof IRacingStatsMemberRecentRacesParametersSchema
>;
export type IRacingStatsMemberSummaryParameters = z.infer<
  typeof IRacingStatsMemberSummaryParametersSchema
>;
export type IRacingStatsMemberYearlyParameters = z.infer<
  typeof IRacingStatsMemberYearlyParametersSchema
>;
export type IRacingStatsSeasonDriverStandingsParameters = z.infer<
  typeof IRacingStatsSeasonDriverStandingsParametersSchema
>;
export type IRacingStatsSeasonSupersessionStandingsParameters = z.infer<
  typeof IRacingStatsSeasonSupersessionStandingsParametersSchema
>;
export type IRacingStatsSeasonTeamStandingsParameters = z.infer<
  typeof IRacingStatsSeasonTeamStandingsParametersSchema
>;
export type IRacingStatsSeasonTTStandingsParameters = z.infer<
  typeof IRacingStatsSeasonTTStandingsParametersSchema
>;
export type IRacingStatsSeasonTTResultsParameters = z.infer<
  typeof IRacingStatsSeasonTTResultsParametersSchema
>;
export type IRacingStatsSeasonQualifyResultsParameters = z.infer<
  typeof IRacingStatsSeasonQualifyResultsParametersSchema
>;
export type IRacingStatsWorldRecordsParameters = z.infer<
  typeof IRacingStatsWorldRecordsParametersSchema
>;

export type IRacingTeamGetParameters = z.infer<
  typeof IRacingTeamGetParametersSchema
>;
export type IRacingTimeAttackMemberSeasonResultsParameters = z.infer<
  typeof IRacingTimeAttackMemberSeasonResultsParametersSchema
>;
export type IRacingServiceMethodParametersDocsResponse = z.infer<
  typeof IRacingServiceMethodParametersDocsResponseSchema
>;
export type IRacingServiceMethodDocsResponse = z.infer<
  typeof IRacingServiceMethodDocsResponseSchema
>;
export type IRacingServiceDocsResponse = z.infer<
  typeof IRacingServiceDocsResponseSchema
>;
export type IRacingServicesDocsResponse = z.infer<
  typeof IRacingServicesDocsResponseSchema
>;
