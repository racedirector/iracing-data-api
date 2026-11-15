import { Command } from "@commander-js/extra-typings";
import { readGlobalOptions } from "../../../schema.js";
import { type Options, resolveOptions } from "./schema.js";

/** Host-owned login and presentation operations. */
export interface CreateExecuteOptions {
  /**
   * Authenticate and persist the returned credentials.
   * @param {Options} options - Validated login invocation.
   * @returns {Promise<string>} Destination of the saved credential document.
   */
  login(options: Options): Promise<string>;

  /**
   * Report success without exposing tokens.
   * @param {string} destination - Saved credential document path.
   */
  present(destination: string): void;
}

/**
 * Bind login and presentation without constructing invocation scopes.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound execution handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: Options) => {
    service.present(await service.login(options));
  };
}

/**
 * Build login input parsing over host-owned operations.
 * @param {CreateExecuteOptions} service - Authentication, persistence and presentation.
 * @returns {Command} Login command with hidden environment-backed credential inputs.
 */
export function createLoginCommand(service: CreateExecuteOptions) {
  const execute = createExecute(service);

  return new Command("login")
    .description("Authenticate with iRacing OAuth")
    .option(
      "--method <browser|password-limited>",
      "Authentication method",
      "browser",
    )
    .option(
      "-o, --output <path>",
      "Write tokens to an alternate file (protected unless --force)",
    )
    .option(
      "--scope <scopes...>",
      "OAuth scopes: iracing.auth, or iracing.auth iracing.profile",
    )
    .option("--format <json|yaml>", "Token serialization format")
    .option("--force", "Replace an existing output file")
    .option("--no-open", "Do not open the browser automatically")
    .option(
      "--timeout-seconds <seconds>",
      "OAuth callback timeout in seconds",
      "300",
    )
    .action(async (raw, command) => {
      const options = resolveOptions.parse({
        ...raw,
        ...readGlobalOptions(command),
      });

      await execute(options);
    });
}
