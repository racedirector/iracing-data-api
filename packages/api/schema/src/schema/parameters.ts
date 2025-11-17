import { z } from "zod";
import {
  IRacingCategorySchema,
  IRacingCustomerIdSchema,
  IRacingCategoryIdParameterSchema,
  IRacingChartTypeParameterSchema,
  CommaSeparatedNumberString,
  IRacingEventTypeSchema,
  IRacingEventTypeTimeTrialSchema,
  IRacingEventTypeRaceSchema,
  IRacingDivisionSchema,
} from "./primitives";

export const IRacingAuthParametersSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const IRacingDriverStatsByCategoryPathSchema = z.object({
  category: IRacingCategorySchema,
});

export const IRacingHostedCombinedSessionsParametersSchema = z.object({
  package_id: z.coerce.number().optional().meta({
    description:
      "If set, return only sessions using this car or track package ID.",
  }),
});

export const IRacingLeagueCustomerSessionsParametersSchema = z.object({
  mine: z.coerce.boolean().optional().meta({
    description: "If true, return only sessions created by this user.",
  }),
  package_id: z.coerce.number().optional().meta({
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
  restrict_to_member: z.coerce.boolean().optional().meta({
    description: "If true include only leagues for which customer is a member.",
  }),
  restrict_to_recruiting: z.coerce.boolean().optional().meta({
    description: "If true include only leagues which are recruiting.",
  }),
  restrict_to_friends: z.coerce
    .boolean()
    .optional()
    .meta({ description: "If true include only leagues owned by a friend." }),
  restrict_to_watched: z.coerce.boolean().optional().meta({
    description: "If true include only leagues owned by a watched member.",
  }),
  minimum_roster_count: z.coerce.number().optional().meta({
    description: "If set include leagues with at least this number of members.",
  }),
  maximum_roster_count: z.coerce.number().optional().meta({
    description:
      "If set include leagues with no more than this number of members.",
  }),
  lowerbound: z.coerce
    .number()
    .optional()
    .meta({ description: "First row of results to return.  Defaults to 1." }),
  upperbound: z.coerce.number().optional().meta({
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
  league_id: z.coerce.number(),
  include_licenses: z.coerce.boolean().optional().meta({
    description: "For faster responses, only request when necessary.",
  }),
});

export const IRacingLeagueGetPointsSystemsParametersSchema = z.object({
  league_id: z.coerce.number(),
  season_id: z.coerce.number().optional().meta({
    description:
      "If included and the season is using custom points (points_system_id:2) then the custom points option is included in the returned list. Otherwise the custom points option is not returned.",
  }),
});

export const IRacingLeagueMembershipParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description:
      "If different from the authenticated member, the following restrictions apply: - Caller cannot be on requested customer's block list or an empty list will result; - Requested customer cannot have their online activity preference set to hidden or an empty list will result; - Only leagues for which the requested customer is an admin and the league roster is not private are returned.",
  }),
  include_league: z.coerce.boolean().optional(),
});

export const IRacingLeagueRosterParametersSchema = z.object({
  league_id: z.coerce.number(),
  include_licenses: z.coerce.boolean().optional().meta({
    description: "For faster responses, only request when necessary.",
  }),
});

export const IRacingLeagueSeasonsParametersSchema = z.object({
  league_id: z.coerce.number(),
  retired: z.coerce.boolean().optional().meta({
    description: "If true include seasons which are no longer active.",
  }),
});

export const IRacingLeagueSeasonStandingsParametersSchema = z.object({
  league_id: z.coerce.number(),
  season_id: z.coerce.number(),
  car_class_id: z.coerce.number().optional(),
  car_id: z.coerce.number().optional().meta({
    description:
      "If car_class_id is included then the standings are for the car in that car class, otherwise they are for the car across car classes.",
  }),
});

export const IRacingLeagueSeasonSessionsParametersSchema = z.object({
  league_id: z.coerce.number(),
  season_id: z.coerce.number(),
  results_only: z.coerce.boolean().optional().meta({
    description:
      "If true include only sessions for which results are available.",
  }),
});

export const IRacingLookupDriversParametersSchema = z.object({
  search_term: z
    .string()
    .meta({ description: "A cust_id or partial name for which to search." }),
  league_id: z.coerce.number().optional().meta({
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
  award_id: z.coerce.number(),
});

export const IRacingMemberChartDataParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  category_id: IRacingCategoryIdParameterSchema.meta({
    description: "1 - Oval; 2 - Road; 3 - Dirt oval; 4 - Dirt road",
  }),
  chart_type: IRacingChartTypeParameterSchema.meta({
    description: "1 - iRating; 2 - TT Rating; 3 - License/SR",
  }),
});

export const IRacingMemberGetParametersSchema = z.object({
  cust_ids: CommaSeparatedNumberString.meta({
    description:
      "Comma-separated list of customer IDs. Example: ?cust_ids=2,3,4",
  }),
  include_licenses: z.coerce.boolean().optional(),
});

export const IRacingMemberProfileParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const IRacingResultsGetParametersSchema = z.object({
  subsession_id: z.coerce.number(),
  include_licenses: z.coerce.boolean().optional(),
});

export const IRacingResultsEventLogParametersSchema = z.object({
  subsession_id: z.coerce.number(),
  simsession_number: z.coerce.number().meta({
    description: "The main event is 0; the preceding event is -1, and so on.",
  }),
});

export const IRacingResultsLapChartDataParametersSchema = z.object({
  subsession_id: z.coerce.number(),
  simsession_number: z.coerce.number().meta({
    description: "The main event is 0; the preceding event is -1, and so on.",
  }),
});

export const IRacingResultsLapDataParametersSchema = z.object({
  subsession_id: z.coerce.number(),
  simsession_number: z.coerce.number().meta({
    description: "The main event is 0; the preceding event is -1, and so on.",
  }),
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description:
      "Required if the subsession was a single-driver event. Optional for team events. If omitted for a team event then the laps driven by all the team's drivers will be included.",
  }),
  team_id: z.coerce
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
  team_id: z.coerce.number().optional().meta({
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
  league_id: z.coerce
    .number()
    .optional()
    .meta({ description: "Include only results for the league with this ID." }),
  league_season_id: z.coerce.number().optional().meta({
    description: "Include only results for the league season with this ID.",
  }),
  car_id: z.coerce
    .number()
    .optional()
    .meta({ description: "One of the cars used by the session." }),
  track_id: z.coerce
    .number()
    .optional()
    .meta({ description: "The ID of the track used by the session." }),
  category_ids: CommaSeparatedNumberString.optional().meta({
    description:
      "Track categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4",
  }),
});

export const IRacingResultsSearchSeriesParametersSchema = z.object({
  season_year: z.coerce
    .number()
    .optional()
    .meta({ description: "Required when using season_quarter." }),
  season_quarter: z.coerce
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
  series_id: z.coerce
    .number()
    .optional()
    .meta({ description: "Include only sessions for series with this ID." }),
  race_week_num: z.coerce
    .number()
    .optional()
    .meta({ description: "Include only sessions with this race week number." }),
  official_only: z.coerce.boolean().optional().meta({
    description:
      "If true, include only sessions earning championship points. Defaults to all.",
  }),
  event_types: CommaSeparatedNumberString.optional().meta({
    description:
      "Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5",
  }),
  category_ids: CommaSeparatedNumberString.optional().meta({
    description:
      "License categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4",
  }),
});

export const IRacingResultsSeasonResultsParametersSchema = z.object({
  season_id: z.coerce.number(),
  event_type: IRacingEventTypeSchema.optional().meta({
    description:
      "Retrict to one event type: 2 - Practice; 3 - Qualify; 4 - Time Trial; 5 - Race",
  }),
  race_week_num: z.coerce
    .number()
    .optional()
    .meta({ description: "The first race week of a season is 0." }),
});

export const IRacingSeasonListParametersSchema = z.object({
  season_year: z.coerce.number(),
  season_quarter: z.coerce.number(),
});

export const IRacingSeasonRaceGuideParametersSchema = z.object({
  from: z.iso.datetime({ offset: true }).optional().meta({
    description:
      "ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time.",
  }),
  include_end_after_from: z.coerce.boolean().optional().meta({
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
  series_id: z.coerce.number(),
});

export const IRacingSeriesSeasonsParametersSchema = z.object({
  include_series: z.coerce.boolean().optional(),
  season_year: z.coerce.number().optional().meta({
    description:
      "To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned.",
  }),
  season_quarter: z.coerce.number().optional().meta({
    description:
      "To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned.",
  }),
});

export const IRacingSeriesSeasonListParametersSchema = z.object({
  include_series: z.coerce.boolean().optional(),
  season_year: z.coerce.number().optional(),
  season_quarter: z.coerce.number().optional(),
});

export const IRacingSeriesSeasonScheduleParametersSchema = z.object({
  season_id: z.coerce.number(),
});

export const IRacingStatsMemberBestsParametersSchema = z.object({
  cust_id: IRacingCustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  car_id: z.coerce.number().optional().meta({
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
  season_id: z.coerce.number(),
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
  season: z.coerce.number().optional().meta({
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
  season_id: z.coerce.number(),
  car_class_id: z.coerce.number(),
  division: IRacingDivisionSchema.optional(),
  race_week_num: z.coerce
    .number()
    .optional()
    .meta({ description: "The first race week of a season is 0." }),
});

export const IRacingStatsSeasonSupersessionStandingsParametersSchema = z.object(
  {
    season_id: z.coerce.number(),
    car_class_id: z.coerce.number(),
    division: IRacingDivisionSchema.optional(),
    race_week_num: z.coerce
      .number()
      .optional()
      .meta({ description: "The first race week of a season is 0." }),
  }
);

export const IRacingStatsSeasonTeamStandingsParametersSchema = z.object({
  season_id: z.coerce.number(),
  car_class_id: z.coerce.number(),
  race_week_num: z.coerce
    .number()
    .optional()
    .meta({ description: "The first race week of a season is 0." }),
});

export const IRacingStatsSeasonTTStandingsParametersSchema = z.object({
  season_id: z.coerce.number(),
  car_class_id: z.coerce.number(),
  division: IRacingDivisionSchema.optional(),
  race_week_num: z.coerce
    .number()
    .optional()
    .meta({ description: "The first race week of a season is 0." }),
});

export const IRacingStatsSeasonTTResultsParametersSchema = z.object({
  season_id: z.coerce.number(),
  car_class_id: z.coerce.number(),
  race_week_num: z.coerce
    .number()
    .meta({ description: "The first race week of a season is 0." }),
  division: IRacingDivisionSchema.optional(),
});

export const IRacingStatsSeasonQualifyResultsParametersSchema = z.object({
  season_id: z.coerce.number(),
  car_class_id: z.coerce.number(),
  race_week_num: z.coerce
    .number()
    .meta({ description: "The first race week of a season is 0." }),
  division: IRacingDivisionSchema.optional(),
});

export const IRacingStatsWorldRecordsParametersSchema = z.object({
  car_id: z.coerce.number(),
  track_id: z.coerce.number(),
  season_year: z.coerce
    .number()
    .optional()
    .meta({ description: "Limit best times to a given year." }),
  season_quarter: z.coerce.number().optional().meta({
    description:
      "Limit best times to a given quarter; only applicable when year is used.",
  }),
});

export const IRacingTeamGetParametersSchema = z.object({
  team_id: z.coerce.number(),
  include_licenses: z.coerce.boolean().optional().meta({
    description: "For faster responses, only request when necessary.",
  }),
});

export const IRacingTimeAttackMemberSeasonResultsParametersSchema = z.object({
  ta_comp_season_id: z.coerce.number(),
});

/**
 * Types
 */
export type IRacingDriverStatsByCategoryPath = z.infer<
  typeof IRacingDriverStatsByCategoryPathSchema
>;
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
