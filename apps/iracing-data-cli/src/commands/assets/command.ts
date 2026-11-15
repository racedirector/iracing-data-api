import { Command } from "@commander-js/extra-typings";
import { z } from "zod";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/** Supported modeled asset services. */
export const AssetServiceSchema = z.enum(["car", "series", "track"]);

/** Validated asset request and API credential selection. */
export interface AssetsOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Selected asset service. */
  service: z.output<typeof AssetServiceSchema>;
}

/** Host-owned asset retrieval and presentation. */
export interface CreateExecuteOptions {
  /**
   * Retrieve and materialize an asset document.
   * @param {AssetsOptions} options - Validated request and credentials.
   * @returns {Promise<unknown>} Asset JSON.
   */
  fetchAssets(options: AssetsOptions): Promise<unknown>;

  /**
   * Present successfully retrieved assets.
   * @param {unknown} document - Asset JSON.
   */
  present(document: unknown): void;
}

/**
 * Bind asset retrieval to output.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: AssetsOptions) => {
    service.present(await service.fetchAssets(options));
  };
}

/**
 * Build asset leaves without invocation scope factories.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command} Assets group.
 */
export function createAssetsCommand(service: CreateExecuteOptions) {
  const group = new Command("assets").description(
    "Fetch Data API asset metadata as JSON",
  );

  const execute = createExecute(service);

  for (const name of AssetServiceSchema.options) {
    group
      .command(name)
      .description(`Fetch ${name} asset metadata`)
      .action(async (_raw, command) => {
        await execute({
          service: AssetServiceSchema.parse(name),
          ...readCredentialOptions(command),
        });
      });
  }

  return group;
}
