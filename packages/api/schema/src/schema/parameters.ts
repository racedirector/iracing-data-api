/**
 * Authored endpoint path/query/body acceptance over shared primitives.
 *
 * Each schema owns wire field names, optionality and coercion; omission preserves
 * the upstream default rather than inventing a local one. The OpenAPI helper owns
 * which schema is bound to an endpoint and how query arrays serialize. Spectator
 * filters remain typed nonempty arrays here; helper parameter metadata declares
 * form style with explode:false so generated clients send one CSV value. Do not
 * change validation to a string merely to match serialized HTTP syntax.
 *
 * Field descriptions are authored Zod metadata consumed by generated docs. Official
 * /data/doc evidence informs parameters but does not establish full response shapes.
 * Ranges, enums, conditional requirements and serializer behavior need evidence and
 * separate review; generation cannot supply it. Canonical and historical aliases
 * share validation identity and inferred types without runtime migration warnings.
 */
import { z } from "zod";
import {
  BooleanParameterSchema,
  CarClassIdParameterSchema,
  CarIdParameterSchema,
  CategoryIdParameterSchema,
  CategoryIdsParameterSchema,
  CategorySchema,
  ChartTypeParameterSchema,
  CustomerIdSchema,
  CustomerIdsParameterSchema,
  DivisionParameterSchema,
  EventTypeParameterSchema,
  EventTypeRaceSchema,
  EventTypeSchema,
  EventTypesParameterSchema,
  EventTypeTimeTrialSchema,
  LeagueIdParameterSchema,
  LeagueSeasonIdParameterSchema,
  PackageIdParameterSchema,
  RaceWeekNumParameterSchema,
  SeasonIdParameterSchema,
  SeasonIdSchema,
  SeasonQuarterParameterSchema,
  SeasonYearParameterSchema,
  SeriesIdParameterSchema,
  SimSessionNumberParameterSchema,
  SubsessionIdParameterSchema,
  TeamIdParameterSchema,
  TrackIdParameterSchema,
} from "./primitives";

export const AuthParametersSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const DriverStatsByCategoryPathSchema = z.object({
  category: CategorySchema,
});

export const HostedCombinedSessionsParametersSchema = z.object({
  package_id: PackageIdParameterSchema.optional().meta({
    description:
      "If set, return only sessions using this car or track package ID.",
  }),
});

export const LeagueCustomerSessionsParametersSchema = z.object({
  mine: BooleanParameterSchema.optional().meta({
    description: "If true, return only sessions created by this user.",
  }),
  package_id: PackageIdParameterSchema.optional().meta({
    description:
      "If set, return only sessions using this car or track package ID.",
  }),
});

export const LeagueDirectoryParametersSchema = z.object({
  search: z.string().optional().meta({
    description:
      "Will search against league name, description, owner, and league ID.",
  }),
  tag: z
    .string()
    .optional()
    .meta({ description: "One or more tags, comma-separated." }),
  restrict_to_member: BooleanParameterSchema.optional().meta({
    description: "If true include only leagues for which customer is a member.",
  }),
  restrict_to_recruiting: BooleanParameterSchema.optional().meta({
    description: "If true include only leagues which are recruiting.",
  }),
  restrict_to_friends: BooleanParameterSchema.optional().meta({
    description: "If true include only leagues owned by a friend.",
  }),
  restrict_to_watched: BooleanParameterSchema.optional().meta({
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

export const LeagueGetParametersSchema = z.object({
  league_id: LeagueIdParameterSchema,
  include_licenses: BooleanParameterSchema.optional().meta({
    description: "For faster responses, only request when necessary.",
  }),
});

export const LeagueGetPointsSystemsParametersSchema = z.object({
  league_id: LeagueIdParameterSchema,
  season_id: LeagueSeasonIdParameterSchema.optional().meta({
    description:
      "If included and the season is using custom points (points_system_id:2) then the custom points option is included in the returned list. Otherwise the custom points option is not returned.",
  }),
});

export const LeagueMembershipParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description:
      "If different from the authenticated member, the following restrictions apply: - Caller cannot be on requested customer's block list or an empty list will result; - Requested customer cannot have their online activity preference set to hidden or an empty list will result; - Only leagues for which the requested customer is an admin and the league roster is not private are returned.",
  }),
  include_league: BooleanParameterSchema.optional(),
});

export const LeagueRosterParametersSchema = z.object({
  league_id: LeagueIdParameterSchema,
  include_licenses: BooleanParameterSchema.optional().meta({
    description: "For faster responses, only request when necessary.",
  }),
});

export const LeagueSeasonsParametersSchema = z.object({
  league_id: LeagueIdParameterSchema,
  retired: BooleanParameterSchema.optional().meta({
    description: "If true include seasons which are no longer active.",
  }),
});

export const LeagueSeasonStandingsParametersSchema = z.object({
  league_id: LeagueIdParameterSchema,
  season_id: LeagueSeasonIdParameterSchema,
  car_class_id: CarClassIdParameterSchema.optional(),
  car_id: CarIdParameterSchema.optional().meta({
    description:
      "If car_class_id is included then the standings are for the car in that car class, otherwise they are for the car across car classes.",
  }),
});

export const LeagueSeasonSessionsParametersSchema = z.object({
  league_id: LeagueIdParameterSchema,
  season_id: LeagueSeasonIdParameterSchema,
  results_only: BooleanParameterSchema.optional().meta({
    description:
      "If true include only sessions for which results are available.",
  }),
});

export const LookupDriversParametersSchema = z.object({
  search_term: z
    .string()
    .meta({ description: "A cust_id or partial name for which to search." }),
  league_id: LeagueIdParameterSchema.optional().meta({
    description: "Narrow the search to the roster of the given league.",
  }),
});

export const MemberAwardsParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const MemberAwardInstancesParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  award_id: z.coerce.number(),
});

export const MemberChartDataParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  category_id: CategoryIdParameterSchema.meta({
    description: "1 - Oval; 2 - Road; 3 - Dirt oval; 4 - Dirt road",
  }),
  chart_type: ChartTypeParameterSchema.meta({
    description: "1 - iRating; 2 - TT Rating; 3 - License/SR",
  }),
});

export const MemberGetParametersSchema = z.object({
  cust_ids: CustomerIdsParameterSchema.meta({
    description:
      "Comma-separated list of customer IDs. Example: ?cust_ids=2,3,4",
  }),
  include_licenses: BooleanParameterSchema.optional(),
});

export const MemberProfileParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const ResultsGetParametersSchema = z.object({
  subsession_id: SubsessionIdParameterSchema,
  include_licenses: BooleanParameterSchema.optional(),
});

export const ResultsEventLogParametersSchema = z.object({
  subsession_id: SubsessionIdParameterSchema,
  simsession_number: SimSessionNumberParameterSchema.meta({
    description: "The main event is 0; the preceding event is -1, and so on.",
  }),
});

export const ResultsLapChartDataParametersSchema = z.object({
  subsession_id: SubsessionIdParameterSchema,
  simsession_number: SimSessionNumberParameterSchema.meta({
    description: "The main event is 0; the preceding event is -1, and so on.",
  }),
});

export const ResultsLapDataParametersSchema = z.object({
  subsession_id: SubsessionIdParameterSchema,
  simsession_number: SimSessionNumberParameterSchema.meta({
    description: "The main event is 0; the preceding event is -1, and so on.",
  }),
  cust_id: CustomerIdSchema.optional().meta({
    description:
      "Required if the subsession was a single-driver event. Optional for team events. If omitted for a team event then the laps driven by all the team's drivers will be included.",
  }),
  team_id: TeamIdParameterSchema.optional().meta({
    description: "Required if the subsession was a team event.",
  }),
});

export const ResultsSearchHostedParametersSchema = z.object({
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
  cust_id: CustomerIdSchema.optional().meta({
    description:
      "The participant's customer ID. Ignored if team_id is supplied.",
  }),
  team_id: TeamIdParameterSchema.optional().meta({
    description:
      "The team ID to search for. Takes priority over cust_id if both are supplied.",
  }),
  host_cust_id: CustomerIdSchema.optional().meta({
    description: "The host's customer ID.",
  }),
  session_name: z
    .string()
    .optional()
    .meta({ description: "Part or all of the session's name." }),
  league_id: LeagueIdParameterSchema.optional().meta({
    description: "Include only results for the league with this ID.",
  }),
  league_season_id: LeagueSeasonIdParameterSchema.optional().meta({
    description: "Include only results for the league season with this ID.",
  }),
  car_id: CarIdParameterSchema.optional().meta({
    description: "One of the cars used by the session.",
  }),
  track_id: TrackIdParameterSchema.optional().meta({
    description: "The ID of the track used by the session.",
  }),
  category_ids: CategoryIdsParameterSchema.optional().meta({
    description:
      "Track categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4",
  }),
});

export const ResultsSearchSeriesParametersSchema = z.object({
  season_year: SeasonYearParameterSchema.optional().meta({
    description: "Required when using season_quarter.",
  }),
  season_quarter: SeasonQuarterParameterSchema.optional().meta({
    description: "Required when using season_year.",
  }),
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
  cust_id: CustomerIdSchema.optional().meta({
    description:
      "Include only sessions in which this customer participated. Ignored if team_id is supplied.",
  }),
  team_id: TeamIdParameterSchema.optional().meta({
    description:
      "Include only sessions in which this team participated. Takes priority over cust_id if both are supplied.",
  }),
  series_id: SeriesIdParameterSchema.optional().meta({
    description: "Include only sessions for series with this ID.",
  }),
  race_week_num: RaceWeekNumParameterSchema.optional().meta({
    description: "Include only sessions with this race week number.",
  }),
  official_only: BooleanParameterSchema.optional().meta({
    description:
      "If true, include only sessions earning championship points. Defaults to all.",
  }),
  event_types: EventTypesParameterSchema.optional().meta({
    description:
      "Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5",
  }),
  category_ids: CategoryIdsParameterSchema.optional().meta({
    description:
      "License categories to include in the search.  Defaults to all. ?category_ids=1,2,3,4",
  }),
});

export const ResultsSeasonResultsParametersSchema = z.object({
  season_id: SeasonIdParameterSchema,
  event_type: EventTypeParameterSchema.optional().meta({
    description:
      "Retrict to one event type: 2 - Practice; 3 - Qualify; 4 - Time Trial; 5 - Race",
  }),
  race_week_num: RaceWeekNumParameterSchema.optional().meta({
    description: "The first race week of a season is 0.",
  }),
});

export const SeasonListParametersSchema = z.object({
  season_year: SeasonYearParameterSchema,
  season_quarter: SeasonQuarterParameterSchema,
});

export const SeasonRaceGuideParametersSchema = z.object({
  from: z.iso.datetime({ offset: true }).optional().meta({
    description:
      "ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time.",
  }),
  include_end_after_from: BooleanParameterSchema.optional().meta({
    description: "Include sessions which start before 'from' but end after.",
  }),
});

export const SeasonSpectatorSubsessionidsParametersSchema = z.object({
  event_types: z.array(EventTypeSchema).min(1).optional().meta({
    description:
      "Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5",
  }),
});

export const SeasonSpectatorSubsessionidsDetailParametersSchema = z.object({
  event_types: z.array(EventTypeSchema).min(1).optional().meta({
    description:
      "Types of events to include in the search. Defaults to all. ?event_types=2,3,4,5",
  }),
  season_ids: z.array(SeasonIdSchema).min(1).optional().meta({
    description:
      "Seasons to include in the search. Defaults to all. ?season_ids=513,937",
  }),
});

export const SeriesPastSeasonsParametersSchema = z.object({
  series_id: SeriesIdParameterSchema,
});

export const SeriesSeasonsParametersSchema = z.object({
  include_series: BooleanParameterSchema.optional(),
  season_year: SeasonYearParameterSchema.optional().meta({
    description:
      "To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned.",
  }),
  season_quarter: SeasonQuarterParameterSchema.optional().meta({
    description:
      "To look up past seasons use both a season_year and season_quarter.  Without both, the active seasons are returned.",
  }),
});

export const SeriesSeasonListParametersSchema = z.object({
  include_series: BooleanParameterSchema.optional(),
  season_year: SeasonYearParameterSchema.optional(),
  season_quarter: SeasonQuarterParameterSchema.optional(),
});

export const SeriesSeasonScheduleParametersSchema = z.object({
  season_id: SeasonIdParameterSchema,
});

export const StatsMemberBestsParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  car_id: CarIdParameterSchema.optional().meta({
    description:
      "First call should exclude car_id; use cars_driven list in return for subsequent calls.",
  }),
});

export const StatsMemberCareerParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const StatsMemberDivisionParametersSchema = z.object({
  season_id: SeasonIdParameterSchema,
  event_type: z.union([EventTypeTimeTrialSchema, EventTypeRaceSchema]).meta({
    description:
      "The event type code for the division type: 4 - Time Trial; 5 - Race",
  }),
});

export const StatsMemberRecapParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
  year: SeasonYearParameterSchema.optional().meta({
    description:
      "Season year; if not supplied the current calendar year (UTC) is used.",
  }),
  season: SeasonQuarterParameterSchema.optional().meta({
    description:
      "Season (quarter) within the year; if not supplied the recap will be for the entire year.",
  }),
});

export const StatsMemberRecentRacesParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const StatsMemberSummaryParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const StatsMemberYearlyParametersSchema = z.object({
  cust_id: CustomerIdSchema.optional().meta({
    description: "Defaults to the authenticated member.",
  }),
});

export const StatsSeasonDriverStandingsParametersSchema = z.object({
  season_id: SeasonIdParameterSchema,
  car_class_id: CarClassIdParameterSchema,
  division: DivisionParameterSchema.optional(),
  race_week_num: RaceWeekNumParameterSchema.optional().meta({
    description: "The first race week of a season is 0.",
  }),
});

export const StatsSeasonSupersessionStandingsParametersSchema = z.object({
  season_id: SeasonIdParameterSchema,
  car_class_id: CarClassIdParameterSchema,
  division: DivisionParameterSchema.optional(),
  race_week_num: RaceWeekNumParameterSchema.optional().meta({
    description: "The first race week of a season is 0.",
  }),
});

export const StatsSeasonTeamStandingsParametersSchema = z.object({
  season_id: SeasonIdParameterSchema,
  car_class_id: CarClassIdParameterSchema,
  race_week_num: RaceWeekNumParameterSchema.optional().meta({
    description: "The first race week of a season is 0.",
  }),
});

export const StatsSeasonTTStandingsParametersSchema = z.object({
  season_id: SeasonIdParameterSchema,
  car_class_id: CarClassIdParameterSchema,
  division: DivisionParameterSchema.optional(),
  race_week_num: RaceWeekNumParameterSchema.optional().meta({
    description: "The first race week of a season is 0.",
  }),
});

export const StatsSeasonTTResultsParametersSchema = z.object({
  season_id: SeasonIdParameterSchema,
  car_class_id: CarClassIdParameterSchema,
  race_week_num: RaceWeekNumParameterSchema.meta({
    description: "The first race week of a season is 0.",
  }),
  division: DivisionParameterSchema.optional(),
});

export const StatsSeasonQualifyResultsParametersSchema = z.object({
  season_id: SeasonIdParameterSchema,
  car_class_id: CarClassIdParameterSchema,
  race_week_num: RaceWeekNumParameterSchema.meta({
    description: "The first race week of a season is 0.",
  }),
  division: DivisionParameterSchema.optional(),
});

export const StatsWorldRecordsParametersSchema = z.object({
  car_id: CarIdParameterSchema,
  track_id: TrackIdParameterSchema,
  season_year: SeasonYearParameterSchema.optional().meta({
    description: "Limit best times to a given year.",
  }),
  season_quarter: SeasonQuarterParameterSchema.optional().meta({
    description:
      "Limit best times to a given quarter; only applicable when year is used.",
  }),
});

export const TeamGetParametersSchema = z.object({
  team_id: TeamIdParameterSchema,
  include_licenses: BooleanParameterSchema.optional().meta({
    description: "For faster responses, only request when necessary.",
  }),
});

export const TimeAttackMemberSeasonResultsParametersSchema = z.object({
  ta_comp_season_id: z.coerce.number(),
});

/**
 * Types.
 */
export type DriverStatsByCategoryPath = z.infer<
  typeof DriverStatsByCategoryPathSchema
>;
export type HostedCombinedSessionsParameters = z.infer<
  typeof HostedCombinedSessionsParametersSchema
>;
export type LeagueCustomerSessionsParameters = z.infer<
  typeof LeagueCustomerSessionsParametersSchema
>;
export type LeagueDirectoryParameters = z.infer<
  typeof LeagueDirectoryParametersSchema
>;
export type LeagueGetParameters = z.infer<typeof LeagueGetParametersSchema>;
export type LeagueGetPointsSystemsParameters = z.infer<
  typeof LeagueGetPointsSystemsParametersSchema
>;
export type LeagueMembershipParameters = z.infer<
  typeof LeagueMembershipParametersSchema
>;
export type LeagueRosterParameters = z.infer<
  typeof LeagueRosterParametersSchema
>;
export type LeagueSeasonsParameters = z.infer<
  typeof LeagueSeasonsParametersSchema
>;
export type LeagueSeasonStandingsParameters = z.infer<
  typeof LeagueSeasonStandingsParametersSchema
>;
export type LeagueSeasonSessionsParameters = z.infer<
  typeof LeagueSeasonSessionsParametersSchema
>;

export type LookupDriversParameters = z.infer<
  typeof LookupDriversParametersSchema
>;

export type MemberAwardsParameters = z.infer<
  typeof MemberAwardsParametersSchema
>;
export type MemberAwardInstancesParameters = z.infer<
  typeof MemberAwardInstancesParametersSchema
>;
export type MemberChartDataParameters = z.infer<
  typeof MemberChartDataParametersSchema
>;
export type MemberGetParameters = z.infer<typeof MemberGetParametersSchema>;
export type MemberProfileParameters = z.infer<
  typeof MemberProfileParametersSchema
>;

export type ResultsGetParameters = z.infer<typeof ResultsGetParametersSchema>;
export type ResultsEventLogParameters = z.infer<
  typeof ResultsEventLogParametersSchema
>;
export type ResultsLapChartDataParameters = z.infer<
  typeof ResultsLapChartDataParametersSchema
>;
export type ResultsLapDataParameters = z.infer<
  typeof ResultsLapDataParametersSchema
>;
export type ResultsSearchHostedParameters = z.infer<
  typeof ResultsSearchHostedParametersSchema
>;
export type ResultsSearchSeriesParameters = z.infer<
  typeof ResultsSearchSeriesParametersSchema
>;
export type ResultsSeasonResultsParameters = z.infer<
  typeof ResultsSeasonResultsParametersSchema
>;

export type SeasonListParameters = z.infer<typeof SeasonListParametersSchema>;
export type SeasonRaceGuideParameters = z.infer<
  typeof SeasonRaceGuideParametersSchema
>;
export type SeasonSpectatorSubsessionidsParameters = z.infer<
  typeof SeasonSpectatorSubsessionidsParametersSchema
>;
export type SeasonSpectatorSubsessionidsDetailParameters = z.infer<
  typeof SeasonSpectatorSubsessionidsDetailParametersSchema
>;

export type SeriesPastSeasonsParameters = z.infer<
  typeof SeriesPastSeasonsParametersSchema
>;
export type SeriesSeasonsParameters = z.infer<
  typeof SeriesSeasonsParametersSchema
>;
export type SeriesSeasonListParameters = z.infer<
  typeof SeriesSeasonListParametersSchema
>;
export type SeriesSeasonScheduleParameters = z.infer<
  typeof SeriesSeasonScheduleParametersSchema
>;

export type StatsMemberBestsParameters = z.infer<
  typeof StatsMemberBestsParametersSchema
>;
export type StatsMemberCareerParameters = z.infer<
  typeof StatsMemberCareerParametersSchema
>;
export type StatsMemberDivisionParameters = z.infer<
  typeof StatsMemberDivisionParametersSchema
>;
export type StatsMemberRecapParameters = z.infer<
  typeof StatsMemberRecapParametersSchema
>;
export type StatsMemberRecentRacesParameters = z.infer<
  typeof StatsMemberRecentRacesParametersSchema
>;
export type StatsMemberSummaryParameters = z.infer<
  typeof StatsMemberSummaryParametersSchema
>;
export type StatsMemberYearlyParameters = z.infer<
  typeof StatsMemberYearlyParametersSchema
>;
export type StatsSeasonDriverStandingsParameters = z.infer<
  typeof StatsSeasonDriverStandingsParametersSchema
>;
export type StatsSeasonSupersessionStandingsParameters = z.infer<
  typeof StatsSeasonSupersessionStandingsParametersSchema
>;
export type StatsSeasonTeamStandingsParameters = z.infer<
  typeof StatsSeasonTeamStandingsParametersSchema
>;
export type StatsSeasonTTStandingsParameters = z.infer<
  typeof StatsSeasonTTStandingsParametersSchema
>;
export type StatsSeasonTTResultsParameters = z.infer<
  typeof StatsSeasonTTResultsParametersSchema
>;
export type StatsSeasonQualifyResultsParameters = z.infer<
  typeof StatsSeasonQualifyResultsParametersSchema
>;
export type StatsWorldRecordsParameters = z.infer<
  typeof StatsWorldRecordsParametersSchema
>;

export type TeamGetParameters = z.infer<typeof TeamGetParametersSchema>;
export type TimeAttackMemberSeasonResultsParameters = z.infer<
  typeof TimeAttackMemberSeasonResultsParametersSchema
>;

// Historical exports stay in their original module for import compatibility.
/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use AuthParametersSchema instead.
 */
export const IRacingAuthParametersSchema = AuthParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use DriverStatsByCategoryPathSchema instead.
 */
export const IRacingDriverStatsByCategoryPathSchema =
  DriverStatsByCategoryPathSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use HostedCombinedSessionsParametersSchema instead.
 */
export const IRacingHostedCombinedSessionsParametersSchema =
  HostedCombinedSessionsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LeagueCustomerSessionsParametersSchema instead.
 */
export const IRacingLeagueCustomerSessionsParametersSchema =
  LeagueCustomerSessionsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LeagueDirectoryParametersSchema instead.
 */
export const IRacingLeagueDirectoryParametersSchema =
  LeagueDirectoryParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LeagueGetParametersSchema instead.
 */
export const IRacingLeagueGetParametersSchema = LeagueGetParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LeagueGetPointsSystemsParametersSchema instead.
 */
export const IRacingLeagueGetPointsSystemsParametersSchema =
  LeagueGetPointsSystemsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LeagueMembershipParametersSchema instead.
 */
export const IRacingLeagueMembershipParametersSchema =
  LeagueMembershipParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LeagueRosterParametersSchema instead.
 */
export const IRacingLeagueRosterParametersSchema = LeagueRosterParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LeagueSeasonsParametersSchema instead.
 */
export const IRacingLeagueSeasonsParametersSchema =
  LeagueSeasonsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LeagueSeasonStandingsParametersSchema instead.
 */
export const IRacingLeagueSeasonStandingsParametersSchema =
  LeagueSeasonStandingsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LeagueSeasonSessionsParametersSchema instead.
 */
export const IRacingLeagueSeasonSessionsParametersSchema =
  LeagueSeasonSessionsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use LookupDriversParametersSchema instead.
 */
export const IRacingLookupDriversParametersSchema =
  LookupDriversParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use MemberAwardsParametersSchema instead.
 */
export const IRacingMemberAwardsParametersSchema = MemberAwardsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use MemberAwardInstancesParametersSchema instead.
 */
export const IRacingMemberAwardInstancesParametersSchema =
  MemberAwardInstancesParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use MemberChartDataParametersSchema instead.
 */
export const IRacingMemberChartDataParametersSchema =
  MemberChartDataParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use MemberGetParametersSchema instead.
 */
export const IRacingMemberGetParametersSchema = MemberGetParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use MemberProfileParametersSchema instead.
 */
export const IRacingMemberProfileParametersSchema =
  MemberProfileParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ResultsGetParametersSchema instead.
 */
export const IRacingResultsGetParametersSchema = ResultsGetParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ResultsEventLogParametersSchema instead.
 */
export const IRacingResultsEventLogParametersSchema =
  ResultsEventLogParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ResultsLapChartDataParametersSchema instead.
 */
export const IRacingResultsLapChartDataParametersSchema =
  ResultsLapChartDataParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ResultsLapDataParametersSchema instead.
 */
export const IRacingResultsLapDataParametersSchema =
  ResultsLapDataParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ResultsSearchHostedParametersSchema instead.
 */
export const IRacingResultsSearchHostedParametersSchema =
  ResultsSearchHostedParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ResultsSearchSeriesParametersSchema instead.
 */
export const IRacingResultsSearchSeriesParametersSchema =
  ResultsSearchSeriesParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ResultsSeasonResultsParametersSchema instead.
 */
export const IRacingResultsSeasonResultsParametersSchema =
  ResultsSeasonResultsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use SeasonListParametersSchema instead.
 */
export const IRacingSeasonListParametersSchema = SeasonListParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use SeasonRaceGuideParametersSchema instead.
 */
export const IRacingSeasonRaceGuideParametersSchema =
  SeasonRaceGuideParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use SeasonSpectatorSubsessionidsParametersSchema instead.
 */
export const IRacingSeasonSpectatorSubsessionidsParametersSchema =
  SeasonSpectatorSubsessionidsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use SeasonSpectatorSubsessionidsDetailParametersSchema instead.
 */
export const IRacingSeasonSpectatorSubsessionidsDetailParametersSchema =
  SeasonSpectatorSubsessionidsDetailParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use SeriesPastSeasonsParametersSchema instead.
 */
export const IRacingSeriesPastSeasonsParametersSchema =
  SeriesPastSeasonsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use SeriesSeasonsParametersSchema instead.
 */
export const IRacingSeriesSeasonsParametersSchema =
  SeriesSeasonsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use SeriesSeasonListParametersSchema instead.
 */
export const IRacingSeriesSeasonListParametersSchema =
  SeriesSeasonListParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use SeriesSeasonScheduleParametersSchema instead.
 */
export const IRacingSeriesSeasonScheduleParametersSchema =
  SeriesSeasonScheduleParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsMemberBestsParametersSchema instead.
 */
export const IRacingStatsMemberBestsParametersSchema =
  StatsMemberBestsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsMemberCareerParametersSchema instead.
 */
export const IRacingStatsMemberCareerParametersSchema =
  StatsMemberCareerParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsMemberDivisionParametersSchema instead.
 */
export const IRacingStatsMemberDivisionParametersSchema =
  StatsMemberDivisionParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsMemberRecapParametersSchema instead.
 */
export const IRacingStatsMemberRecapParametersSchema =
  StatsMemberRecapParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsMemberRecentRacesParametersSchema instead.
 */
export const IRacingStatsMemberRecentRacesParametersSchema =
  StatsMemberRecentRacesParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsMemberSummaryParametersSchema instead.
 */
export const IRacingStatsMemberSummaryParametersSchema =
  StatsMemberSummaryParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsMemberYearlyParametersSchema instead.
 */
export const IRacingStatsMemberYearlyParametersSchema =
  StatsMemberYearlyParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsSeasonDriverStandingsParametersSchema instead.
 */
export const IRacingStatsSeasonDriverStandingsParametersSchema =
  StatsSeasonDriverStandingsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsSeasonSupersessionStandingsParametersSchema instead.
 */
export const IRacingStatsSeasonSupersessionStandingsParametersSchema =
  StatsSeasonSupersessionStandingsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsSeasonTeamStandingsParametersSchema instead.
 */
export const IRacingStatsSeasonTeamStandingsParametersSchema =
  StatsSeasonTeamStandingsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsSeasonTTStandingsParametersSchema instead.
 */
export const IRacingStatsSeasonTTStandingsParametersSchema =
  StatsSeasonTTStandingsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsSeasonTTResultsParametersSchema instead.
 */
export const IRacingStatsSeasonTTResultsParametersSchema =
  StatsSeasonTTResultsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsSeasonQualifyResultsParametersSchema instead.
 */
export const IRacingStatsSeasonQualifyResultsParametersSchema =
  StatsSeasonQualifyResultsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use StatsWorldRecordsParametersSchema instead.
 */
export const IRacingStatsWorldRecordsParametersSchema =
  StatsWorldRecordsParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use TeamGetParametersSchema instead.
 */
export const IRacingTeamGetParametersSchema = TeamGetParametersSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use TimeAttackMemberSeasonResultsParametersSchema instead.
 */
export const IRacingTimeAttackMemberSeasonResultsParametersSchema =
  TimeAttackMemberSeasonResultsParametersSchema;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use DriverStatsByCategoryPath instead.
 */
export type IRacingDriverStatsByCategoryPath = DriverStatsByCategoryPath;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use HostedCombinedSessionsParameters instead.
 */
export type IRacingHostedCombinedSessionsParameters =
  HostedCombinedSessionsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LeagueCustomerSessionsParameters instead.
 */
export type IRacingLeagueCustomerSessionsParameters =
  LeagueCustomerSessionsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LeagueDirectoryParameters instead.
 */
export type IRacingLeagueDirectoryParameters = LeagueDirectoryParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LeagueGetParameters instead.
 */
export type IRacingLeagueGetParameters = LeagueGetParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LeagueGetPointsSystemsParameters instead.
 */
export type IRacingLeagueGetPointsSystemsParameters =
  LeagueGetPointsSystemsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LeagueMembershipParameters instead.
 */
export type IRacingLeagueMembershipParameters = LeagueMembershipParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LeagueRosterParameters instead.
 */
export type IRacingLeagueRosterParameters = LeagueRosterParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LeagueSeasonsParameters instead.
 */
export type IRacingLeagueSeasonsParameters = LeagueSeasonsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LeagueSeasonStandingsParameters instead.
 */
export type IRacingLeagueSeasonStandingsParameters =
  LeagueSeasonStandingsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LeagueSeasonSessionsParameters instead.
 */
export type IRacingLeagueSeasonSessionsParameters =
  LeagueSeasonSessionsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use LookupDriversParameters instead.
 */
export type IRacingLookupDriversParameters = LookupDriversParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use MemberAwardsParameters instead.
 */
export type IRacingMemberAwardsParameters = MemberAwardsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use MemberAwardInstancesParameters instead.
 */
export type IRacingMemberAwardInstancesParameters =
  MemberAwardInstancesParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use MemberChartDataParameters instead.
 */
export type IRacingMemberChartDataParameters = MemberChartDataParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use MemberGetParameters instead.
 */
export type IRacingMemberGetParameters = MemberGetParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use MemberProfileParameters instead.
 */
export type IRacingMemberProfileParameters = MemberProfileParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ResultsGetParameters instead.
 */
export type IRacingResultsGetParameters = ResultsGetParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ResultsEventLogParameters instead.
 */
export type IRacingResultsEventLogParameters = ResultsEventLogParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ResultsLapChartDataParameters instead.
 */
export type IRacingResultsLapChartDataParameters =
  ResultsLapChartDataParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ResultsLapDataParameters instead.
 */
export type IRacingResultsLapDataParameters = ResultsLapDataParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ResultsSearchHostedParameters instead.
 */
export type IRacingResultsSearchHostedParameters =
  ResultsSearchHostedParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ResultsSearchSeriesParameters instead.
 */
export type IRacingResultsSearchSeriesParameters =
  ResultsSearchSeriesParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ResultsSeasonResultsParameters instead.
 */
export type IRacingResultsSeasonResultsParameters =
  ResultsSeasonResultsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use SeasonListParameters instead.
 */
export type IRacingSeasonListParameters = SeasonListParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use SeasonRaceGuideParameters instead.
 */
export type IRacingSeasonRaceGuideParameters = SeasonRaceGuideParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use SeasonSpectatorSubsessionidsParameters instead.
 */
export type IRacingSeasonSpectatorSubsessionidsParameters =
  SeasonSpectatorSubsessionidsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use SeasonSpectatorSubsessionidsDetailParameters instead.
 */
export type IRacingSeasonSpectatorSubsessionidsDetailParameters =
  SeasonSpectatorSubsessionidsDetailParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use SeriesPastSeasonsParameters instead.
 */
export type IRacingSeriesPastSeasonsParameters = SeriesPastSeasonsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use SeriesSeasonsParameters instead.
 */
export type IRacingSeriesSeasonsParameters = SeriesSeasonsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use SeriesSeasonListParameters instead.
 */
export type IRacingSeriesSeasonListParameters = SeriesSeasonListParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use SeriesSeasonScheduleParameters instead.
 */
export type IRacingSeriesSeasonScheduleParameters =
  SeriesSeasonScheduleParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsMemberBestsParameters instead.
 */
export type IRacingStatsMemberBestsParameters = StatsMemberBestsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsMemberCareerParameters instead.
 */
export type IRacingStatsMemberCareerParameters = StatsMemberCareerParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsMemberDivisionParameters instead.
 */
export type IRacingStatsMemberDivisionParameters =
  StatsMemberDivisionParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsMemberRecapParameters instead.
 */
export type IRacingStatsMemberRecapParameters = StatsMemberRecapParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsMemberRecentRacesParameters instead.
 */
export type IRacingStatsMemberRecentRacesParameters =
  StatsMemberRecentRacesParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsMemberSummaryParameters instead.
 */
export type IRacingStatsMemberSummaryParameters = StatsMemberSummaryParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsMemberYearlyParameters instead.
 */
export type IRacingStatsMemberYearlyParameters = StatsMemberYearlyParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsSeasonDriverStandingsParameters instead.
 */
export type IRacingStatsSeasonDriverStandingsParameters =
  StatsSeasonDriverStandingsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsSeasonSupersessionStandingsParameters instead.
 */
export type IRacingStatsSeasonSupersessionStandingsParameters =
  StatsSeasonSupersessionStandingsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsSeasonTeamStandingsParameters instead.
 */
export type IRacingStatsSeasonTeamStandingsParameters =
  StatsSeasonTeamStandingsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsSeasonTTStandingsParameters instead.
 */
export type IRacingStatsSeasonTTStandingsParameters =
  StatsSeasonTTStandingsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsSeasonTTResultsParameters instead.
 */
export type IRacingStatsSeasonTTResultsParameters =
  StatsSeasonTTResultsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsSeasonQualifyResultsParameters instead.
 */
export type IRacingStatsSeasonQualifyResultsParameters =
  StatsSeasonQualifyResultsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use StatsWorldRecordsParameters instead.
 */
export type IRacingStatsWorldRecordsParameters = StatsWorldRecordsParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use TeamGetParameters instead.
 */
export type IRacingTeamGetParameters = TeamGetParameters;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use TimeAttackMemberSeasonResultsParameters instead.
 */
export type IRacingTimeAttackMemberSeasonResultsParameters =
  TimeAttackMemberSeasonResultsParameters;
