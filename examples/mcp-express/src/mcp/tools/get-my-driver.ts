import { MemberApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import {
  CacheResolver,
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

const CACHE_KEY = "get_my_driver:v1";

/** Request access, linked downloads, and result presentation supplied by the root. */
export interface GetMyDriverToolOptions {
  resolveConfiguration: ConfigurationResolver;
  resolveLink: IRacingLinkResolver<Output>;
  resolveResponse: ResponseResolver<Output>;
  cache?: CacheResolver;
}

/** Register the authenticated driver's small, agent-facing identity projection. */
export function createGetMyDriverTool(
  server: McpServer,
  {
    resolveConfiguration,
    resolveLink,
    resolveResponse,
    cache,
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
        /**
         * Check for a cached value before executing a network request
         */
        const cached = await cache?.get(CACHE_KEY, {
          signal: abortSignal,
        });

        if (cached !== undefined) {
          const parsed = OutputSchema.safeParse(cached);

          if (parsed.success) {
            return resolveResponse.success(parsed.data);
          }

          // !!!: We may want to remove the cached value if it doesn't
          // parse correctly, but that's a later problem.
        }

        const configuration = await resolveConfiguration({
          signal: abortSignal,
          auth: ctx.http?.authInfo,
        });

        const response = await new MemberApi(configuration).getMemberInfo({
          signal: abortSignal,
        });

        const { value, expiresAt } = await resolveLink({
          response,
          schema: OutputSchema,
          signal: abortSignal,
        });

        abortSignal.throwIfAborted();

        await cache?.set(CACHE_KEY, value, expiresAt, { signal: abortSignal });

        abortSignal.throwIfAborted();

        return resolveResponse.success(value);
      } catch (error) {
        return resolveResponse.error(error);
      }
    },
  );
}
