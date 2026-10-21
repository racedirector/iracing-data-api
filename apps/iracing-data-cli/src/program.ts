import { Command } from "@commander-js/extra-typings";
import { makeCarAssetsService } from "./commands/assets/car/index.js";
import { createAssetsCommand } from "./commands/assets/index.js";
import { materializeReturnedDataApiLink } from "./commands/assets/returned-data-api-link.js";
import { makeSeriesAssetsService } from "./commands/assets/series/index.js";
import { makeTrackAssetsService } from "./commands/assets/track/index.js";
import { createAuthCommand } from "./commands/auth/index.js";
import { createDocsCommand, makeDocsService } from "./commands/docs/index.js";
import { createWhoamiCommand } from "./commands/whoami/index.js";
import { resolveAccessToken } from "./credentials.js";
import { makeDocumentRequestService } from "./services/request.js";
import { writeDocumentOutput } from "./token-output.js";
import type { Diagnostics } from "./diagnostics.js";

/**
 * Register CLI adapters and compose shared external I/O without performing it.
 * @param {Diagnostics} diagnostics - Secret-safe diagnostic sink.
 * @returns {Command} Configured CLI command tree.
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

  program.addCommand(
    createAssetsCommand({
      carService: makeCarAssetsService(
        requests,
        materializeReturnedDataApiLink,
      ),
      seriesService: makeSeriesAssetsService(
        requests,
        materializeReturnedDataApiLink,
      ),
      trackService: makeTrackAssetsService(
        requests,
        materializeReturnedDataApiLink,
      ),
    }),
  );
  program.addCommand(createAuthCommand({ diagnostics }));
  program.addCommand(createDocsCommand(makeDocsService(requests)));
  program.addCommand(createWhoamiCommand({ diagnostics }));

  return program;
}
