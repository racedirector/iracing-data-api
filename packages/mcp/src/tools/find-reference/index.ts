import { ApplicationFailure } from "../../diagnostics/errors.js";
import { registerApplicationTool } from "../../execution.js";
import { handleFindReference } from "./operation.js";
import { FindReferenceInput, FindReferenceOutput } from "./schema.js";
import type {
  IracingToolRegistry,
  IracingToolServices,
} from "../../services.js";

/**
 * Register the optional name/ID lookup through the shared execution boundary.
 * @param {IracingToolRegistry} server - Caller-owned tool registry.
 * @param {IracingToolServices} services - Explicit host capability selectors.
 */
export function registerFindReference(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerApplicationTool(server, services, {
    name: "find_reference",
    description:
      "Find cars, tracks, series or car classes by numeric ID or name/manufacturer/model keywords. Use for car logo, image and asset discovery or series metadata, not race-result inference. Returns bounded candidate IDs, names and available metadata/media resource URIs; read those with resource discovery/read support. A car logo is not necessarily a canonical manufacturer logo. Series identity does not guarantee current-season cars or schedules. available=false means the host did not configure that catalog; zero matches describe only its current snapshot. No media downloads.",
    inputSchema: FindReferenceInput,
    outputSchema: FindReferenceOutput,
    annotations: {
      title: "Find reference metadata and assets",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async execute(input, context) {
      const queries = await context.services.getReferenceQueries?.(context);

      if (!queries || typeof queries.list !== "function") {
        throw new ApplicationFailure("CONFIGURATION_ERROR");
      }

      return handleFindReference(queries, input, { signal: context.signal });
    },
  });
}
