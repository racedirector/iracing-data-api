import { Command } from "@commander-js/extra-typings";
import { Configuration, DocApi } from "@iracing-data/api-client-fetch";
import { createAssetsCommand } from "./commands/assets/index.js";
import { createAuthCommand } from "./commands/auth/index.js";
import { executeDocs } from "./commands/docs/execute.js";
import { createDocsCommand } from "./commands/docs/index.js";
import { createWhoamiCommand } from "./commands/whoami/index.js";
import { resolveAccessToken } from "./credentials.js";
import { writeDocumentOutput } from "./token-output.js";
import type { Diagnostics } from "./diagnostics.js";

/**
 * Build the CLI with assets, auth, docs, and whoami commands, ready for argument parsing.
 * @param {Diagnostics} diagnostics - Secret-safe sink for command progress and failure messages.
 * @returns {Command} Configured root CLI command and its subcommands.
 */
export function createProgram(diagnostics: Diagnostics) {
  const program = new Command("iracing-data").description(
    "Repository CLI for iRacing user workflows",
  );

  program.addCommand(createAssetsCommand({ diagnostics }));
  program.addCommand(createAuthCommand({ diagnostics }));
  program.addCommand(
    createDocsCommand({
      diagnostics,
      resolveAccessToken,
      execute: (options, context) =>
        executeDocs(options, context, {
          fetchDocumentation: (accessToken) =>
            new DocApi(new Configuration({ accessToken })).getDocs(),
          writeDocumentOutput,
        }),
    }),
  );
  program.addCommand(createWhoamiCommand({ diagnostics }));

  return program;
}
