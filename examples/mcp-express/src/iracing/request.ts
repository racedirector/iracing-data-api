import type { Configuration } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import type { CacheStore } from "../services/cache";

/** Request-scoped state shared by every iRacing request stage. */
export interface IRacingRequestContext {
  signal: AbortSignal;
}

/** Materialized upstream data plus an authoritative cache expiration when available. */
export interface IRacingResolvedResponse {
  value: unknown;
  expiresAt?: number;
}

/** Context available while turning an upstream response into validated data. */
export interface IRacingResponseContext<Value> extends IRacingRequestContext {
  schema: z.ZodType<Value>;
}

/**
 * One executable iRacing request.
 *
 * Endpoint/domain resolvers construct these descriptions; the core resolver owns
 * the shared request mechanics without depending on MCP tool context.
 */
export interface IRacingRequest<Response, Value> {
  /** Runtime contract for both cached and materialized values. */
  schema: z.ZodType<Value>;

  /** Optional logical cache identity. Scope is supplied by the injected cache. */
  cache?: {
    key: string;
  };

  /** Execute the generated SDK request using caller-owned configuration. */
  execute(
    configuration: Configuration,
    context: IRacingRequestContext,
  ): Promise<Response>;

  /** Turn the endpoint response into the payload exposed to higher layers. */
  materialize(
    response: Response,
    context: IRacingResponseContext<Value>,
  ): Promise<IRacingResolvedResponse>;
}

/** Resolve endpoint descriptions into validated application data. */
export interface IRacingRequestResolver {
  resolve<Response, Value>(
    request: IRacingRequest<Response, Value>,
    context: IRacingRequestContext,
  ): Promise<Value>;
}

export interface CreateIRacingRequestResolverOptions {
  /**
   * Resolve generated-client configuration for this resolver instance.
   * Authentication/principal semantics may be closed over by composition.
   */
  resolveConfiguration(
    context: IRacingRequestContext,
  ): Configuration | Promise<Configuration>;

  /** Optional cache; policy decorators and principal scoping live outside this core. */
  cache?: CacheStore;
}

/**
 * Create the smallest shared iRacing request pipeline: cache-aside, generated SDK
 * execution, response materialization, runtime validation, and cache population.
 */
export function createIRacingRequestResolver({
  resolveConfiguration,
  cache,
}: CreateIRacingRequestResolverOptions): IRacingRequestResolver {
  return {
    async resolve(request, context) {
      const { signal } = context;

      signal.throwIfAborted();

      if (cache && request.cache) {
        const cached = await cache.get(request.cache.key, { signal });

        signal.throwIfAborted();

        if (cached !== undefined) {
          const parsed = request.schema.safeParse(cached);

          if (parsed.success) {
            return parsed.data;
          }
        }
      }

      const configuration = await resolveConfiguration(context);

      signal.throwIfAborted();

      const response = await request.execute(configuration, context);

      signal.throwIfAborted();

      const resolved = await request.materialize(response, {
        ...context,
        schema: request.schema,
      });

      signal.throwIfAborted();

      const value = request.schema.parse(resolved.value);

      if (
        cache &&
        request.cache &&
        resolved.expiresAt !== undefined
      ) {
        await cache.set(request.cache.key, value, resolved.expiresAt, { signal });

        signal.throwIfAborted();
      }

      signal.throwIfAborted();

      return value;
    },
  };
}
