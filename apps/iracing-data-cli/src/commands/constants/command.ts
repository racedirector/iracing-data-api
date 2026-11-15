import { Command } from "@commander-js/extra-typings";
import { z } from "zod";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/** Supported direct constant documents. */
export const ConstantOperationSchema = z.enum([
  "categories",
  "divisions",
  "event-types",
]);

/** Validated constant selection and credential inputs. */
export interface ConstantsOptions extends CredentialOptions {
  /** Validated constant document selection. */
  operation: z.infer<typeof ConstantOperationSchema>;
}

/** Command-facing constant retrieval and presentation. */
export interface CreateExecuteOptions {
  /**
   * Retrieve a direct constant array.
   * @param {ConstantsOptions} options - Validated operation and credentials.
   * @returns {Promise<unknown>} Constant rows.
   */
  fetchConstants(options: ConstantsOptions): Promise<unknown>;

  /**
   * Present only a successfully retrieved document.
   * @param {unknown} document - Retrieved rows.
   */
  present(document: unknown): void;
}

/**
 * Bind validated requests to retrieval and presentation.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound execution handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: ConstantsOptions) => {
    service.present(await service.fetchConstants(options));
  };
}

/**
 * Build the constant document leaves.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command} Constants group.
 */
export function createConstantsCommand(service: CreateExecuteOptions) {
  const group = new Command("constants").description(
    "Fetch direct API constant arrays as JSON",
  );

  const execute = createExecute(service);

  for (const operation of ConstantOperationSchema.options) {
    group.addCommand(
      new Command(operation)
        .description(`Fetch ${operation} constants`)
        .action(async (_raw, leaf) => {
          await execute({
            operation: ConstantOperationSchema.parse(operation),
            ...readCredentialOptions(leaf),
          });
        }),
    );
  }

  return group;
}
