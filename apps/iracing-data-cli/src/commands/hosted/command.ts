import { Command } from "@commander-js/extra-typings";
import { HostedCombinedSessionsParametersSchema } from "@iracing-data/api-schema";
import { z } from "zod";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/** Canonical hosted session queries. */
export const HostedRequestSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("combined-sessions"),
    query: HostedCombinedSessionsParametersSchema,
  }),
  z.object({ operation: z.literal("sessions"), query: z.object({}) }),
]);

/** Validated invocation and API credentials. */
export interface HostedOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Selected operation and query. */
  request: z.output<typeof HostedRequestSchema>;
}

/** Host-owned retrieval and presentation. */
export interface CreateExecuteOptions {
  /**
   * Fetch hosted sessions.
   * @param {HostedOptions} options - Validated request and credentials.
   * @returns {Promise<unknown>} Downloaded JSON.
   */
  fetchHosted(options: HostedOptions): Promise<unknown>;

  /**
   * Display the document.
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
  return async (options: HostedOptions) => {
    service.present(await service.fetchHosted(options));
  };
}

/**
 * Build endpoint-backed hosted session commands.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command} Hosted group.
 */
export function createHostedCommand(service: CreateExecuteOptions) {
  const group = new Command("hosted").description(
    "Fetch hosted session API documents as JSON",
  );

  const execute = createExecute(service);

  group
    .command("combined-sessions")
    .description(
      "Fetch driver/spectator-joinable sessions and your pending non-league sessions",
    )
    .option("--package-id <id>", "Filter by car or track package ID")
    .action(async (raw, leaf) => {
      const request = HostedRequestSchema.parse({
        operation: "combined-sessions",
        query: { package_id: raw.packageId },
      });

      await execute({ request, ...readCredentialOptions(leaf) });
    });
  group
    .command("sessions")
    .description(
      "Fetch driver-joinable sessions (excludes spectator-only and pending non-league sessions)",
    )
    .action(async (_raw, leaf) => {
      const request = HostedRequestSchema.parse({
        operation: "sessions",
        query: {},
      });

      await execute({ request, ...readCredentialOptions(leaf) });
    });

  return group;
}
