import { ApplicationFailure } from "../../diagnostics/errors.js";
import { registerApplicationTool } from "../../execution.js";
import { handleStaticCacheRefresh } from "./operation.js";
import { RefreshInput, RefreshOutput } from "./schema.js";
import type {
  IracingToolRegistry,
  IracingToolServices,
} from "../../services.js";

/**
 * Register optional static snapshot maintenance through the shared boundary.
 * @param {IracingToolRegistry} server - Caller-owned tool registry.
 * @param {IracingToolServices} services - Host capability selectors.
 */
export function registerStaticCacheRefresh(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerApplicationTool(server, services, {
    name: "refresh_static_cache",
    description:
      "Refetch one static dataset, validate and atomically persist it, then replace its live index. No bulk refresh or dynamic result caches. Failed refresh retains last-good data.",
    inputSchema: RefreshInput,
    outputSchema: RefreshOutput,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    async execute(input, context) {
      const maintenance =
        await context.services.getStaticCacheRefresh?.(context);

      if (!maintenance || typeof maintenance.refresh !== "function") {
        throw new ApplicationFailure("CONFIGURATION_ERROR");
      }

      return handleStaticCacheRefresh(maintenance, input, {
        signal: context.signal,
      });
    },
  });
}
