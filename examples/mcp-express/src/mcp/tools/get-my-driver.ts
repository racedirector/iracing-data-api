import { MemberApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import {
  ConfigurationResolver,
  IRacingLinkResolver,
  ResponseResolver,
} from "./resolvers";
import type { McpServer } from "@modelcontextprotocol/server";

const InputSchema = z.object({});

const OutputSchema = z.object({
  cust_id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  display_name: z.string().min(1),
});

type Output = z.infer<typeof OutputSchema>;

/** Request access, linked downloads, and result presentation supplied by the root. */
export interface GetMyDriverToolOptions {
  resolveConfiguration: ConfigurationResolver;
  resolveLink: IRacingLinkResolver<Output>;
  resolveResponse: ResponseResolver<Output>;
}

/** Register the authenticated driver's small, agent-facing identity projection. */
export function createGetMyDriverTool(
  server: McpServer,
  {
    resolveConfiguration,
    resolveLink,
    resolveResponse,
  }: GetMyDriverToolOptions,
) {
  return server.registerTool(
    "get_my_driver",
    {
      description:
        "Identify the authenticated driver. Returns only customer ID and display name; requires iracing.auth.",
      inputSchema: InputSchema,
      outputSchema: OutputSchema,
    },
    async (input, ctx) => {
      const abortSignal = ctx.mcpReq.signal;

      try {
        const configuration = await resolveConfiguration({
          signal: abortSignal,
          auth: ctx.http?.authInfo,
        });

        const result = await resolveLink({
          response: await new MemberApi(configuration).getMemberInfo({
            signal: abortSignal,
          }),
          schema: OutputSchema,
          signal: abortSignal,
        });

        abortSignal.throwIfAborted();

        return resolveResponse.success(result);
      } catch (error) {
        return resolveResponse.error(error);
      }
    },
  );
}
