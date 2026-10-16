import { z } from "zod";
import { CurrentMemberSchema } from "../../iracing/member";
import type {
  ConfigurationResolverOptions,
  ResponseResolver,
} from "./resolvers";
import type { CurrentMember } from "../../iracing/member";
import type { McpServer } from "@modelcontextprotocol/server";

const InputSchema = z.object({});

/** Member lookup and result presentation supplied by composition. */
export interface GetMyDriverToolOptions {
  resolveMember: (
    context: ConfigurationResolverOptions,
  ) => Promise<CurrentMember>;
  resolveResponse: ResponseResolver<CurrentMember>;
}

/** Register the authenticated driver's small, agent-facing identity projection. */
export function createGetMyDriverTool(
  server: McpServer,
  { resolveMember, resolveResponse }: GetMyDriverToolOptions,
) {
  return server.registerTool(
    "get_my_driver",
    {
      description:
        "Identify the authenticated driver. Returns only customer ID and display name; requires iracing.auth.",
      inputSchema: InputSchema,
      outputSchema: CurrentMemberSchema,
    },
    async (_input, ctx) => {
      const signal = ctx.mcpReq.signal;

      signal.throwIfAborted();

      try {
        const member = await resolveMember({
          signal,
          auth: ctx.http?.authInfo,
        });

        signal.throwIfAborted();

        return resolveResponse.success(member);
      } catch (cause) {
        signal.throwIfAborted();

        return resolveResponse.error(cause);
      }
    },
  );
}
