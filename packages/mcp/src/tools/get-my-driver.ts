import { z } from "zod";
import { ApplicationFailure } from "../diagnostics/errors.js";
import { DriverProjection, type DriverQueries } from "../driver.js";
import { registerTool } from "../execution.js";
import { parse } from "../linked-response.js";
import { completeResult } from "./collections.js";
import type { ToolDefinition } from "../execution.js";
import type { IracingToolRegistry, IracingToolServices } from "../services.js";

export { DriverProjection } from "../driver.js";

/** Rejects arguments for the authenticated-member lookup. */
export const SelfInput = z.strictObject({});

/** Register the request-selected driver capability without generated access. */
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
