import { MemberApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { registerTool } from "../execution.js";
import { materialize, parse } from "../linked-response.js";
import { completeResult } from "./collections.js";
import { Id, text } from "./primitives.js";
import type { ToolDefinition } from "../execution.js";
import type { IracingToolRegistry, IracingToolServices } from "../services.js";

/** Register get_my_driver on the caller-owned server. */
export function registerGetMyDriver(
  server: IracingToolRegistry,
  services: IracingToolServices,
): void {
  registerTool(server, services, definition);
}

export const SelfInput = z.strictObject({});
export const DriverProjection = z.object({
  cust_id: Id,
  display_name: text.min(1),
});

const definition = {
  name: "get_my_driver",
  description:
    "Identify the authenticated driver. Returns only customer ID and display name; requires iracing.auth.",
  inputSchema: SelfInput,
  outputSchema: z.object({ cust_id: Id, display_name: z.string().min(1) }),
  work: async (_input, access, context) =>
    completeResult(
      parse(
        DriverProjection,
        (
          await materialize(
            await new MemberApi(access.configuration).getMemberInfo({
              signal: context.signal,
            }),
            DriverProjection,
            context.signal,
            access.configuration.fetchApi,
          )
        ).data,
      ),
    ),
} satisfies ToolDefinition<z.infer<typeof SelfInput>>;
