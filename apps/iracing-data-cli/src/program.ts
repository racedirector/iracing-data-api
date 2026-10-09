import { Configuration, DocApi } from "@iracing-data/api-client-fetch";
import { Command } from "@commander-js/extra-typings";
import { createAuthCommand } from "./commands/auth/index.js";
import {
  createDocsCommand,
  type DocumentationApi,
} from "./commands/docs.js";
import { createWhoamiCommand } from "./commands/whoami.js";
import type { Diagnostics } from "./diagnostics.js";

export interface ProgramDependencies {
  createDocumentationApi(accessToken: string): DocumentationApi;
}

/**
 * Application composition for modeled Data API interactions.
 *
 * The CLI constructs generated clients here and injects only the narrow capability
 * each command needs. Endpoint paths, bearer-wire behavior, serialization, and
 * response contracts remain owned by the generated client rather than application
 * commands or repository-root scripts.
 */
const defaultDependencies: ProgramDependencies = {
  createDocumentationApi(accessToken) {
    return new DocApi(new Configuration({ accessToken }));
  },
};

export function createProgram(
  diagnostics: Diagnostics,
  dependencies: ProgramDependencies = defaultDependencies,
) {
  const program = new Command("iracing-data").description(
    "Repository CLI for iRacing user workflows",
  );

  program.addCommand(createAuthCommand({ diagnostics }));
  program.addCommand(createDocsCommand({ diagnostics, ...dependencies }));
  program.addCommand(createWhoamiCommand(diagnostics));

  return program;
}
