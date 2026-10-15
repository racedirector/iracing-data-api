import { Command } from "@commander-js/extra-typings";
import type { CredentialOptions } from "../../../credentials.js";
import type { Diagnostics } from "../../../diagnostics.js";

/** Credential options accepted by the car-assets command. */
export type CarAssetsOptions = CredentialOptions;

/** Per-invocation capabilities required by the car-assets command handler. */
export interface CarAssetsCommandScope {
  assets: {
    get(): Promise<unknown>;
  };
  output: {
    write(payload: unknown): void;
  };
  diagnostics: Diagnostics;
}

/** Factory contract for one isolated car-assets invocation scope. */
export type CreateCarAssetsCommandScope = (
  options: CarAssetsOptions,
) => Promise<CarAssetsCommandScope>;

/** Application-registration dependencies for the car-assets command. */
export interface CarAssetsCommandDependencies {
  createScope: CreateCarAssetsCommandScope;
}

/** Build `iracing-data assets car` around one command-scoped dependency resolution. */
export function createCarAssetsCommand({
  createScope,
}: CarAssetsCommandDependencies) {
  return new Command("car")
    .description("Fetch and materialize Data API car asset metadata")
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .action(async (options) => {
      const { assets, output, diagnostics } = await createScope(options);

      const payload = await assets.get();

      output.write(payload);
      diagnostics.info("Car assets fetched.");
    });
}
