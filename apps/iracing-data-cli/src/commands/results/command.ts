import { Command } from "@commander-js/extra-typings";
import { ResultsGetParametersSchema } from "@iracing-data/api-schema";
import { readCredentialOptions } from "../../schema.js";
import type { ResultsOptions } from "./contracts.js";

/** Host-owned networking and presentation. */
export interface CreateExecuteOptions {
  /**
   * Fetch the materialized results document.
   * @param {ResultsOptions} options - Validated request and credentials.
   * @returns {Promise<unknown>} Downloaded JSON.
   */
  fetchResults(options: ResultsOptions): Promise<unknown>;

  /**
   * Display the results document.
   * @param {unknown} document - Downloaded JSON.
   */
  present(document: unknown): void;
}

/**
 * Bind results retrieval to presentation without owning I/O.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound execution handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: ResultsOptions) => {
    service.present(await service.fetchResults(options));
  };
}

/**
 * Register results request flags and canonical input validation.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command} Configured results command.
 */
export function createResultsCommand(service: CreateExecuteOptions) {
  const execute = createExecute(service);

  return new Command("results")
    .description("Fetch a subsession's results as JSON")
    .requiredOption("--subsession-id <id>", "iRacing subsession ID")
    .option(
      "--include-licenses [boolean]",
      "Include driver licenses (true/false)",
    )
    .action(async (raw, command) => {
      const query = ResultsGetParametersSchema.parse({
        subsession_id: raw.subsessionId,
        include_licenses: raw.includeLicenses,
      });

      await execute({ query, ...readCredentialOptions(command) });
    });
}
