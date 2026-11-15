import {
  LeagueCustomerSessionsParametersSchema,
  LeagueDirectoryParametersSchema,
  LeagueGetParametersSchema,
  LeagueGetPointsSystemsParametersSchema,
  LeagueMembershipParametersSchema,
  LeagueRosterParametersSchema,
  LeagueSeasonSessionsParametersSchema,
  LeagueSeasonStandingsParametersSchema,
  LeagueSeasonsParametersSchema,
} from "@iracing-data/api-schema";
import { z } from "zod";
import type { CredentialOptions } from "../../credentials.js";

/** Canonical queries paired with the selected league operation. */
export const LeagueRequestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("get"), query: LeagueGetParametersSchema }),
  z.object({
    operation: z.literal("roster"),
    query: LeagueRosterParametersSchema,
  }),
  z.object({
    operation: z.literal("seasons"),
    query: LeagueSeasonsParametersSchema,
  }),
  z.object({
    operation: z.literal("sessions"),
    query: LeagueSeasonSessionsParametersSchema,
  }),
  z.object({
    operation: z.literal("standings"),
    query: LeagueSeasonStandingsParametersSchema,
  }),
  z.object({
    operation: z.literal("points-systems"),
    query: LeagueGetPointsSystemsParametersSchema,
  }),
  z.object({
    operation: z.literal("membership"),
    query: LeagueMembershipParametersSchema,
  }),
  z.object({
    operation: z.literal("directory"),
    query: LeagueDirectoryParametersSchema,
  }),
  z.object({
    operation: z.literal("customer-sessions"),
    query: LeagueCustomerSessionsParametersSchema,
  }),
]);

/** Parsed league operation and query. */
export type LeagueRequest = z.output<typeof LeagueRequestSchema>;

/** Validated invocation with only API credential selection. */
export interface LeagueOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Selected operation and canonical query. */
  request: LeagueRequest;
}
