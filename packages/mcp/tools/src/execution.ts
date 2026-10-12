import {
  FetchError,
  RequiredError,
  ResponseError,
} from "@iracing-data/api-client-fetch";
import { z } from "zod";
import {
  ApplicationFailure,
  createRequestContext,
  toolError,
} from "./diagnostics/errors.js";
import type {
  IracingDataAccess,
  IracingToolContext,
  IracingToolRegistry,
  IracingToolServices,
} from "./services.js";
import type { completeResult } from "./tools/collections.js";
import type { StandardSchemaWithJSON } from "@modelcontextprotocol/server";
/** Compose the common page fields with each tool's local projected contract. */
export function pageOutput(items: z.ZodType, context: z.ZodRawShape = {}) {
  return z.object({
    ...context,
    items: z.array(items),
    returned_count: z.number().int().nonnegative(),
    complete: z.boolean(),
    next_cursor: z.string().nullable(),
    source_total: z.number().int().nonnegative(),
  });
}
/** Advertise strict input while projecting validation diagnostics inside the safe boundary. */
function safeInput(schema: z.ZodType): StandardSchemaWithJSON {
  const json = { ...z.toJSONSchema(schema, { io: "input" }), type: "object" };
  return {
    "~standard": {
      version: 1,
      vendor: "iracing-data-mcp",
      validate: (value) => ({ value }),
      jsonSchema: { input: () => json, output: () => json },
    },
  };
}
/** Normalize generated errors without reading upstream bodies or exposing causes. */
function executionFailure(error: unknown, signal: AbortSignal): unknown {
  if (error instanceof ApplicationFailure) return error;
  const cause =
    error instanceof Error && error.name === "FetchError"
      ? Object.getOwnPropertyDescriptor(error, "cause")?.value
      : undefined;
  if (cause instanceof ApplicationFailure) return cause;
  if (
    signal.aborted ||
    error instanceof FetchError ||
    (error instanceof Error && error.name === "FetchError")
  )
    return new ApplicationFailure("UPSTREAM_UNAVAILABLE");
  if (
    error instanceof RequiredError ||
    (error instanceof Error && error.name === "RequiredError")
  )
    return new ApplicationFailure("INVALID_INPUT");
  const response =
    error instanceof Error && error.name === "ResponseError"
      ? Object.getOwnPropertyDescriptor(error, "response")?.value
      : undefined;
  if (error instanceof ResponseError || response instanceof Response) {
    const upstream: Response = response ?? (error as ResponseError).response;
    const status = upstream.status;
    return new ApplicationFailure(
      status === 401 || status === 403
        ? "UPSTREAM_UNAUTHORIZED"
        : status === 404
          ? "NOT_FOUND"
          : status === 429
            ? "RATE_LIMITED"
            : status >= 500 || status === 408
              ? "UPSTREAM_UNAVAILABLE"
              : "DATA_RESOLUTION_FAILED",
      {
        retry_after_seconds: /^\d+$/.test(
          upstream.headers.get("retry-after") ?? "",
        )
          ? Number(upstream.headers.get("retry-after"))
          : undefined,
      },
    );
  }
  if (
    error instanceof SyntaxError ||
    error instanceof TypeError ||
    error instanceof z.ZodError
  )
    return new ApplicationFailure("DATA_RESOLUTION_FAILED");
  return error;
}
/** Bind one tool's contract and handler to native SDK registration and structured validation. */
export function registerTool<T>(
  server: IracingToolRegistry,
  services: IracingToolServices,
  name: string,
  description: string,
  inputSchema: z.ZodType<T>,
  outputSchema: z.ZodType,
  work: (
    input: T,
    access: IracingDataAccess,
    context: IracingToolContext,
  ) => Promise<ReturnType<typeof completeResult>>,
): void {
  server.registerTool(
    name,
    {
      description,
      inputSchema: safeInput(inputSchema),
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, ctx) => {
      const context: IracingToolContext = {
        signal: ctx.mcpReq.signal,
        authInfo: ctx.http?.authInfo,
      };
      try {
        const checked = inputSchema.safeParse(input);
        if (!checked.success) throw new ApplicationFailure("INVALID_INPUT");
        context.signal.throwIfAborted();
        if (!services.getDataApiAccess)
          throw new ApplicationFailure("CONFIGURATION_ERROR");
        const access = await services.getDataApiAccess(context);
        const result = await work(checked.data, access, context);
        context.signal.throwIfAborted();
        if (!outputSchema.safeParse(result.structuredContent).success)
          throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
        return result;
      } catch (error) {
        return toolError(
          executionFailure(error, context.signal),
          createRequestContext(),
        );
      }
    },
  );
}
