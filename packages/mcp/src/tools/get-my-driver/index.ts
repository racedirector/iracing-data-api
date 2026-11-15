import { registerApplicationTool } from "../../execution.js";
import { handleGetMyDriver } from "./operation.js";
import { DriverProjection, SelfInput } from "./schema.js";
import type {
  IracingToolRegistry,
  IracingToolServices,
} from "../../services.js";

/**
 * Register the driver tool with explicit request-local capability selection.
 * @param {IracingToolRegistry} server - MCP registry that receives the tool definition.
 * @param {IracingToolServices} services - Host-provided selectors for request-local capabilities.
 */
export function registerGetMyDriver(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerApplicationTool(server, services, {
    name: "get_my_driver",
    description:
      "Identify the authenticated driver. Returns only customer ID and display name; requires iracing.auth.",
    inputSchema: SelfInput,
    outputSchema: DriverProjection,
    annotations: {
      title: "Get my driver",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async execute(_input, context) {
      const queries = await context.services.getDriverQueries(context);

      return handleGetMyDriver(queries, context);
    },
  });
}
