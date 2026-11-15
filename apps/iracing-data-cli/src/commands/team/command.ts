import { Command } from "@commander-js/extra-typings";
import { TeamGetParametersSchema } from "@iracing-data/api-schema";
import { z } from "zod";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/** Canonical team queries paired with their operation. */
export const TeamRequestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("get"), query: TeamGetParametersSchema }),
  z.object({ operation: z.literal("membership"), query: z.object({}) }),
]);

/** Validated team invocation and API credentials. */
export interface TeamOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Selected operation and query. */
  request: z.output<typeof TeamRequestSchema>;
}

/** Host-owned team retrieval and presentation. */
export interface CreateExecuteOptions {
  /**
   * Fetch the selected team document.
   * @param {TeamOptions} options - Validated request and credentials.
   * @returns {Promise<unknown>} Downloaded JSON.
   */
  fetchTeam(options: TeamOptions): Promise<unknown>;

  /**
   * Display the downloaded JSON.
   * @param {unknown} document - Downloaded JSON.
   */
  present(document: unknown): void;
}

/**
 * Bind retrieval to presentation.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Execution handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: TeamOptions) => {
    service.present(await service.fetchTeam(options));
  };
}

/**
 * Build the team API command group.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command} Team commands.
 */
export function createTeamCommand(service: CreateExecuteOptions) {
  const group = new Command("team").description(
    "Fetch team API documents as JSON",
  );

  const execute = createExecute(service);

  group
    .command("get")
    .description("Fetch team details")
    .requiredOption("--team-id <id>", "iRacing team ID")
    .option(
      "--include-licenses [boolean]",
      "Include driver licenses (true/false)",
    )
    .action(async (raw, leaf) => {
      const request = TeamRequestSchema.parse({
        operation: "get",
        query: { team_id: raw.teamId, include_licenses: raw.includeLicenses },
      });

      await execute({ request, ...readCredentialOptions(leaf) });
    });
  group
    .command("membership")
    .description("Fetch the authenticated member's team memberships")
    .action(async (_raw, leaf) => {
      await execute({
        request: TeamRequestSchema.parse({
          operation: "membership",
          query: {},
        }),
        ...readCredentialOptions(leaf),
      });
    });

  return group;
}
