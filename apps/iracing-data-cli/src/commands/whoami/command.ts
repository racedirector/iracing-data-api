import { Command } from "@commander-js/extra-typings";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/**
 * Minimal identity projection safe for CLI presentation; protocol-specific profile fields
 * remain behind the identity client.
 */
export interface WhoamiProfile {
  /** Numeric customer identifier returned by the profile endpoint. */
  iracing_cust_id: number;

  /** Display name returned by the profile endpoint. */
  iracing_name: string;
}

/** Credential-selection options accepted by the identity command. */
export type WhoamiOptions = CredentialOptions;

/** Host-owned profile retrieval and presentation. */
export interface CreateExecuteOptions {
  /**
   * Read the authenticated member's minimal profile.
   * @param {WhoamiOptions} options - Parsed API credential selection.
   * @returns {Promise<WhoamiProfile>} Safe identity projection.
   */
  getProfile(options: WhoamiOptions): Promise<WhoamiProfile>;

  /**
   * Write the profile and report completion.
   * @param {WhoamiProfile} profile - Safe identity projection.
   */
  present(profile: WhoamiProfile): void;
}

/**
 * Bind profile retrieval to presentation without invocation scopes.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Function} Bound execution handler.
 */
export function createExecute(service: CreateExecuteOptions) {
  return async (options: WhoamiOptions) => {
    service.present(await service.getProfile(options));
  };
}

/**
 * Parse credential options and call the injected service.
 * @param {CreateExecuteOptions} service - Host profile retrieval and presentation.
 * @returns {Command} Configured CLI command ready for registration.
 */
export function createWhoamiCommand(service: CreateExecuteOptions) {
  const execute = createExecute(service);

  return new Command("whoami")
    .description(
      "Check active credentials and show the authenticated iRacing profile",
    )
    .option(
      "--credentials <path>",
      "Override the shared JSON or YAML credential file",
    )
    .action(async (_raw, command) => {
      await execute(readCredentialOptions(command));
    });
}
