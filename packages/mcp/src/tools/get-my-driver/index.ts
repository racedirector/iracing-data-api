import { ApplicationFailure } from "../../diagnostics/errors.js";
import { registerTool } from "../../execution.js";
import { parse } from "../../linked-response.js";
import { completeResult } from "../collections.js";
import { DriverProjection, SelfInput } from "./schema.js";
import type { ToolDefinition } from "../../execution.js";
import type { IracingToolRegistry, IracingToolServices } from "../../services.js";
import type { DriverQueries } from "./service.js";
import type { z } from "zod";

/** Register get_my_driver against the host-selected driver capability. */
export function registerGetMyDriver(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerTool(server, services, definition, (owner, context) => {
    if (typeof owner.getDriverQueries !== "function") {
      throw new ApplicationFailure("CONFIGURATION_ERROR");
    }

    return owner.getDriverQueries(context);
  });
}

const definition = {
  name: "get_my_driver",
  description:
    "Identify the authenticated driver. Returns only customer ID and display name; requires iracing.auth.",
  inputSchema: SelfInput,
  outputSchema: DriverProjection,
  work: async (_input, queries, context) =>
    completeResult(
      parse(DriverProjection, await queries.getCurrent({ signal: context.signal })),
    ),
} satisfies ToolDefinition<z.infer<typeof SelfInput>, DriverQueries>;
