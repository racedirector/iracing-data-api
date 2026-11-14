import { Command } from "@commander-js/extra-typings";
import { readGlobalOptions } from "../../schema.js";
import type { HistoryOptions, HistoryReceipt } from "./contracts.js";

/** Handler-owned operations supplied by the host, as in FTR Discord createExecute. */
export interface CreateExecuteOptions {
  /**
   * Capture history using host-owned networking and storage.
   * @param {HistoryOptions} options - Validated invocation.
   * @returns {Promise<HistoryReceipt & { directory: string }>} Completed capture location and counts.
   */
  capture(
    options: HistoryOptions,
  ): Promise<HistoryReceipt & { directory: string }>;

  /**
   * Display the completion receipt.
   * @param {HistoryReceipt & { directory: string }} receipt - Completed capture summary.
   * @returns {void} Output is emitted synchronously.
   */
  present(receipt: HistoryReceipt & { directory: string }): void;
}

/**
 * Bind narrow service operations without importing network or filesystem implementations.
 * @param {CreateExecuteOptions} service - Host-supplied capture and presentation operations.
 * @returns {(options: HistoryOptions) => Promise<void>} Bound execution handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: HistoryOptions) => {
    const receipt = await service.capture(options);

    service.present(receipt);
  };
}

/**
 * Register argument parsing and orchestration only; all I/O is supplied by the service.
 * @param {CreateExecuteOptions} service - Host-supplied command operations.
 * @returns {Command} Configured Commander command.
 */
export function createLeagueHistoryCommand(service: CreateExecuteOptions) {
  const execute = createExecute(service);

  return new Command("league-history")
    .description(
      "Capture completed league sessions and results for historical matching",
    )
    .requiredOption("--league-id <id>", "iRacing league ID")
    .option("-o, --output <directory>", "New private capture directory")
    .action(async (raw, command) => {
      const { credentials, accessToken } = readGlobalOptions(command);

      const leagueId = Number(raw.leagueId);

      if (!Number.isSafeInteger(leagueId) || leagueId <= 0) {
        throw new Error("--league-id must be a positive safe integer.");
      }

      await execute({
        leagueId,
        output: raw.output,
        credentials,
        ...(accessToken !== undefined ? { accessToken } : {}),
      });
    });
}
