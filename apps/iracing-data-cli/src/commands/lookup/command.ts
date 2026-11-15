import { Command } from "@commander-js/extra-typings";
import {
  LookupDriversParametersSchema,
  LookupParametersSchema,
} from "@iracing-data/api-schema";
import { z } from "zod";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/** Canonical lookup requests. */
export const LookupRequestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("countries"), query: z.object({}) }),
  z.object({ operation: z.literal("current-season"), query: z.object({}) }),
  z.object({ operation: z.literal("flairs"), query: z.object({}) }),
  z.object({ operation: z.literal("licenses"), query: z.object({}) }),
  z.object({ operation: z.literal("get"), query: LookupParametersSchema }),
  z.object({
    operation: z.literal("drivers"),
    query: LookupDriversParametersSchema,
  }),
]);

/** Validated operation and API-only credentials. */
export interface LookupOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Selected lookup operation and query. */
  request: z.output<typeof LookupRequestSchema>;
}

/** Host-owned lookup operations. */
export interface CreateExecuteOptions {
  /**
   * Retrieve a lookup document.
   * @param {LookupOptions} options - Validated request and credentials.
   * @returns {Promise<unknown>} Lookup JSON.
   */
  fetchLookup(options: LookupOptions): Promise<unknown>;

  /**
   * Display a successful lookup document.
   * @param {unknown} document - Lookup JSON.
   */
  present(document: unknown): void;
}

/**
 * Bind lookup retrieval to presentation.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: LookupOptions) => {
    service.present(await service.fetchLookup(options));
  };
}

/**
 * Build lookup leaves for reference and driver discovery.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command} Lookup group.
 */
export function createLookupCommand(service: CreateExecuteOptions) {
  const group = new Command("lookup").description(
    "Fetch API lookup documents as JSON",
  );

  const execute = createExecute(service);

  for (const operation of [
    "countries",
    "current-season",
    "flairs",
    "licenses",
  ]) {
    group.addCommand(
      new Command(operation)
        .description(`Fetch ${operation} lookup data`)
        .action(async (_raw, leaf) => {
          await execute({
            request: LookupRequestSchema.parse({ operation, query: {} }),
            ...readCredentialOptions(leaf),
          });
        }),
    );
  }

  group
    .command("get")
    .description("Fetch selected weather and license-level lookup tables")
    .option(
      "--weather <names...>",
      "Weather lookup names (repeated query values)",
    )
    .option("--licenselevels <names...>", "License-level lookup names")
    .action(async (raw, leaf) => {
      await execute({
        request: LookupRequestSchema.parse({ operation: "get", query: raw }),
        ...readCredentialOptions(leaf),
      });
    });

  group
    .command("drivers")
    .description("Find drivers by customer ID or partial name")
    .requiredOption("--search-term <text>", "Customer ID or partial name")
    .option("--league-id <id>", "Restrict search to this league roster")
    .action(async (raw, leaf) => {
      await execute({
        request: LookupRequestSchema.parse({
          operation: "drivers",
          query: { search_term: raw.searchTerm, league_id: raw.leagueId },
        }),
        ...readCredentialOptions(leaf),
      });
    });

  return group;
}
