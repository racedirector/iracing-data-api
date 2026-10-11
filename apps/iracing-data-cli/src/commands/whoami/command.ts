import { Command } from "@commander-js/extra-typings";
import type { CredentialOptions } from "../../credentials.js";
import type { Diagnostics } from "../../diagnostics.js";

/**
 * Minimal identity projection safe for CLI presentation; protocol-specific profile fields
 * remain behind the identity client.
 */
export type WhoamiProfile = {
  iracing_cust_id: number;
  iracing_name: string;
};

/** Credential-selection options accepted by the identity command. */
export type WhoamiOptions = CredentialOptions;

/**
 * Per-invocation boundary that resolves identity and emits it without exposing client
 * construction to the command module.
 */
export interface WhoamiCommandScope {
  identity: {
    getProfile(): Promise<WhoamiProfile>;
  };
  output: {
    write(profile: WhoamiProfile): void;
  };
  diagnostics: Diagnostics;
}

/**
 * Factory contract for constructing an isolated identity-command scope from normalized
 * options.
 */
export type CreateWhoamiCommandScope = (
  options: WhoamiOptions,
) => Promise<WhoamiCommandScope>;

/**
 * Application-registration dependencies for whoami; identity I/O remains delegated to the
 * invocation scope.
 */
export interface WhoamiCommandDependencies {
  createScope: CreateWhoamiCommandScope;
}

/**
 * Build the whoami command, resolving one scope when its action runs to fetch
 * and write the profile. Scope, retrieval, and output failures reject `parseAsync()`.
 */
export function createWhoamiCommand({
  createScope,
}: WhoamiCommandDependencies) {
  return new Command("whoami")
    .description(
      "Check active credentials and show the authenticated iRacing profile",
    )
    .option(
      "--credentials <path>",
      "Override the shared JSON or YAML credential file",
    )
    .action(async (options) => {
      const { identity, output, diagnostics } = await createScope(options);
      const profile = await identity.getProfile();
      output.write(profile);
      diagnostics.info("iRacing identity verified.");
    });
}
