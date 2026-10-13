import { IracingAPIResponse } from "@iracing-data/api-client-fetch";
import { ToolCallback } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  ConfigurationResolver,
  IRacingLinkResolver,
  ResponseResolver,
  CacheResolver,
} from "./resolvers";

export interface ToolInvocationContext<Input, Output> {
  cacheKey: string;
  outputSchema: z.ZodType<Output>;
  request: (
    configuration: Awaited<ReturnType<ConfigurationResolver>>,
    options: {
      signal: AbortSignal;
    },
  ) => Promise<IracingAPIResponse>;
}

export interface ToolInvocationOptions<Output> {
  /** How to resolve access/configuration for API requests */
  resolveConfiguration: ConfigurationResolver;

  /** How to resolve an IRacing API response link */
  resolveLink: IRacingLinkResolver<Output>;

  /** Formatters for tool output */
  resolveResponse: ResponseResolver<Output>;

  /** Optional cache */
  cache?: CacheResolver;
}

export function createToolInvocation<Input, Output>(
  context: ToolInvocationContext<Input, Output>,
  options: ToolInvocationOptions<Output>,
): ToolCallback<z.ZodType<Input>> {
  return async (input, ctx) => {
    const signal = ctx.mcpReq.signal;

    signal.throwIfAborted();

    try {
      /**
       * Attempt to resolve the request from the cache
       */
      const cached = await options.cache?.get(context.cacheKey, {
        signal,
      });

      signal.throwIfAborted();

      if (cached !== undefined) {
        const parsed = context.outputSchema.safeParse(cached);

        if (parsed.success) {
          signal.throwIfAborted();

          return options.resolveResponse.success(parsed.data);
        }
      }

      /**
       * Attempt to resolve the request from the network
       */
      const configuration = await options.resolveConfiguration({
        signal,
        auth: ctx.http?.authInfo,
      });

      const response = await context.request(configuration, { signal });

      const { value, expiresAt } = await options.resolveLink({
        response,
        signal,
        schema: context.outputSchema,
      });

      signal.throwIfAborted();

      /**
       * Cache the result
       */
      await options.cache?.set(context.cacheKey, value, expiresAt, { signal });

      signal.throwIfAborted();

      return options.resolveResponse.success(value);
    } catch (cause) {
      signal.throwIfAborted();

      return options.resolveResponse.error(cause);
    }
  };
}
