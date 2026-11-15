import {
  ApplicationFailure,
  createRequestContext,
  toolError,
} from "../../diagnostics/errors.js";
import { toolInputSchema } from "../../input.js";
import { completeResult } from "../../result.js";
import { DriverProjection, SelfInput } from "./schema.js";
import type {
  IracingToolContext,
  IracingToolRegistry,
  IracingToolServices,
} from "../../services.js";

/**
 * Register the driver tool directly, without a generic executor.
 * @param {IracingToolRegistry} server - MCP registry that receives the tool definition.
 * @param {IracingToolServices} services - Host-provided selectors for request-local capabilities.
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
        title: "Get my driver",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    (input, request) =>
      handleGetMyDriver(input, services, {
        signal: request.mcpReq.signal,
        authInfo: request.http?.authInfo,
      }),
  );
}

/** Explicit request-local input, capability, projection and error handling. */
async function handleGetMyDriver(
  input: unknown,
  services: IracingToolServices,
  context: IracingToolContext,
) {
  try {
    if (!SelfInput.safeParse(input).success) {
      throw new ApplicationFailure("INVALID_INPUT");
    }

    context.signal.throwIfAborted();
    const queries = await services.getDriverQueries(context);

    const driver = await queries.getCurrent({ signal: context.signal });

    context.signal.throwIfAborted();
    const projection = DriverProjection.safeParse(driver);

    if (!projection.success) {
      throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
    }

    return completeResult(projection.data);
  } catch (error) {
    return toolError(
      context.signal.aborted
        ? new ApplicationFailure("UPSTREAM_UNAVAILABLE")
        : error,
      createRequestContext(),
    );
  }
}
