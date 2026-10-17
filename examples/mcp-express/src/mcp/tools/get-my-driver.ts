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
      const signal = ctx.mcpReq.signal;

      signal.throwIfAborted();

      try {
        /**
         * Attempt to resolve the request from the cache
         */
        const cached = await cache?.get(CACHE_KEY, {
          signal,
        });

        signal.throwIfAborted();

        if (cached !== undefined) {
          const parsed = OutputSchema.safeParse(cached);

          if (parsed.success) {
            signal.throwIfAborted();

            return resolveResponse.success(parsed.data);
          }
        }

        /**
         * Attempt to resolve the request from the network
         */

        const configuration = await resolveConfiguration({
          signal,
          auth: ctx.http?.authInfo,
        });

        const response = await new MemberApi(configuration).getMemberInfo({
          signal,
        });

        const { value, expiresAt } = await resolveLink({
          response,
          signal,
          schema: OutputSchema,
        });

        signal.throwIfAborted();

        /**
         * Cache the result
         */
        await cache?.set(CACHE_KEY, value, expiresAt, { signal });

        signal.throwIfAborted();

        return resolveResponse.success(value);
      } catch (cause) {
        signal.throwIfAborted();

        return resolveResponse.error(cause);
      }
    },
  );
}
