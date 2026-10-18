import { Command } from "@commander-js/extra-typings";
import { createAssetsCommand } from "./commands/assets/index.js";
import { createAuthCommand } from "./commands/auth/index.js";
import { createDocsCommand } from "./commands/docs.js";
import { createWhoamiCommand } from "./commands/whoami/index.js";
import { resolveAccessToken } from "./credentials.js";
import { makeDocsService } from "./services/docs.js";
import { makeDocumentRequestService } from "./services/request.js";
import { writeDocumentOutput } from "./token-output.js";
import type { Diagnostics } from "./diagnostics.js";

/**
 * Register CLI adapters and compose shared external I/O without performing it.
 * @param {Diagnostics} diagnostics - Secret-safe sink for command messages.
 * @returns {Command} Configured CLI command and its subcommands.
 */
export function createProgram(diagnostics: Diagnostics) {
  const program = new Command("iracing-data").description(
    "Repository CLI for iRacing user workflows",
  );

  const requests = makeDocumentRequestService({
    diagnostics,
    resolveAccessToken,
    writeDocumentOutput,
  });

  program.addCommand(createAssetsCommand({ diagnostics }));
  program.addCommand(createAuthCommand({ diagnostics }));
  program.addCommand(createDocsCommand(makeDocsService(requests)));
  program.addCommand(createWhoamiCommand({ diagnostics }));

  return program;
}
