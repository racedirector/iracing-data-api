import { Command } from "@commander-js/extra-typings";
import { IRacingAPI } from "./api.js";
import { createAssetsCommand } from "./commands/assets/index.js";
import { createAuthCommand } from "./commands/auth/index.js";
import { createDocsCommand } from "./commands/docs.js";
import { createWhoamiCommand } from "./commands/whoami/index.js";
import { resolveAccessToken } from "./credentials.js";
import { makeDocsService } from "./services/docs.js";
import { writeDocumentOutput } from "./token-output.js";
import type { Diagnostics } from "./diagnostics.js";

/**
 * Register CLI adapters and compose their application services without I/O.
 * @param {Diagnostics} diagnostics - Secret-safe sink for command progress and failures.
 * @returns {Command} Configured root CLI command.
 */
export function createProgram(diagnostics: Diagnostics) {
  const program = new Command("iracing-data").description(
    "Repository CLI for iRacing user workflows",
  );

  program.addCommand(createAssetsCommand({ diagnostics }));
  program.addCommand(createAuthCommand({ diagnostics }));
  program.addCommand(
    createDocsCommand(
      makeDocsService({
        diagnostics,
        resolveAccessToken,
        createApi: (accessToken) => IRacingAPI.withAccessToken(accessToken),
        writeDocumentOutput,
      }),
    ),
  );
  program.addCommand(createWhoamiCommand({ diagnostics }));

  return program;
}
