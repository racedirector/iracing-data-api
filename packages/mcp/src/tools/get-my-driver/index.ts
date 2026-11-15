import {
  ApplicationFailure,
  createRequestContext,
  toolError,
} from "../../diagnostics/errors.js";
import { toolInputSchema } from "../../input.js";
import { completeResult } from "../../result.js";
import { DriverProjection, SelfInput } from "./schema.js";
import type { IracingToolContext, IracingToolRegistry, IracingToolServices } from "../../services.js";

/**
 * Register the authenticated driver's query. Input validation precedes service
 * resolution; the host selects the principal, credentials and data implementation.
 */
export function registerGetMyDriver(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  server.registerTool(
    "get_my_driver",
    {
      description:
        "Identify the authenticated driver. Returns only customer ID and display name; requires iracing.auth.",
      inputSchema: toolInputSchema(SelfInput),
      outputSchema: DriverProjection,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (arguments_, request) => {
      const context: IracingToolContext = {
        signal: request.mcpReq.signal,
        authInfo: request.http?.authInfo,
      };

      try {
        if (!SelfInput.safeParse(arguments_).success) {
          throw new ApplicationFailure("INVALID_INPUT");
        }

        context.signal.throwIfAborted();

        if (!services.getDriverQueries) {
          throw new ApplicationFailure("CONFIGURATION_ERROR");
        }

        const queries = await services.getDriverQueries(context);
        const driver = await queries.getCurrent({ signal: context.signal });

        context.signal.throwIfAborted();

        // Project public fields even when the injected implementation returns more.
        const projection = DriverProjection.safeParse(driver);
        if (!projection.success) {
          throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
        }

        return completeResult(projection.data);
      } catch (error) {
        return toolError(
          context.signal.aborted ? new ApplicationFailure("UPSTREAM_UNAVAILABLE") : error,
          createRequestContext(),
        );
      }
    },
  );
}
