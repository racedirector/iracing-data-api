import { Command } from "@commander-js/extra-typings";
import type { CredentialOptions } from "../../credentials.js";
import type { Diagnostics } from "../../diagnostics.js";

export type WhoamiProfile = {
  iracing_cust_id: number;
  iracing_name: string;
};

export type WhoamiOptions = CredentialOptions;

export interface WhoamiCommandScope {
  identity: {
    getProfile(): Promise<WhoamiProfile>;
  };
  output: {
    write(profile: WhoamiProfile): void;
  };
  diagnostics: Diagnostics;
}

export type CreateWhoamiCommandScope = (
  options: WhoamiOptions,
) => Promise<WhoamiCommandScope>;

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
