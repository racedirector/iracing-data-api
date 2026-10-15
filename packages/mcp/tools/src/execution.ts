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
    returned_count: z.int().nonnegative(),
    complete: z.boolean(),
    next_cursor: z.string().nullable(),
    source_total: z.int().nonnegative(),
  });
}

/**
 * Advertise the input schema while deferring validation to the registered handler,
 * where rejected inputs become sanitized tool errors. Schema conversion errors propagate.
 */
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
  if (error instanceof ApplicationFailure) {
    return error;
  }

  const cause: unknown = namedError(error, "FetchError")
    ? Object.getOwnPropertyDescriptor(error, "cause")?.value
    : undefined;

  if (cause instanceof ApplicationFailure) {
    return cause;
  }

  if (
    signal.aborted ||
    error instanceof FetchError ||
    namedError(error, "FetchError")
  ) {
    return new ApplicationFailure("UPSTREAM_UNAVAILABLE");
  }

  if (error instanceof RequiredError || namedError(error, "RequiredError")) {
    return new ApplicationFailure("INVALID_INPUT");
  }

  const responseFailure = generatedResponseFailure(error);

  if (responseFailure) {
    return responseFailure;
  }

  if (invalidPayload(error)) {
    return new ApplicationFailure("DATA_RESOLUTION_FAILED");
  }

  return error;
}

/**
 * Register a tool that validates input, obtains request-local access, and validates
 * structured output. Handler failures become sanitized tool-error results; unknown
 * failures become INTERNAL_ERROR. ProtocolFailure escapes as a protocol rejection
 * unless an aborted signal maps it to UPSTREAM_UNAVAILABLE.
 * Schema conversion and server registration errors propagate to the caller.
 */
export function registerTool<T>(
  server: IracingToolRegistry,
  services: IracingToolServices,
  { name, description, inputSchema, outputSchema, work }: ToolDefinition<T>,
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

        if (!checked.success) {
          throw new ApplicationFailure("INVALID_INPUT");
        }

        context.signal.throwIfAborted();
        if (!("getDataApiAccess" in services)) {
          throw new ApplicationFailure("CONFIGURATION_ERROR");
        }

        const access = await services.getDataApiAccess(context);

        const result = await work(checked.data, access, context);

        context.signal.throwIfAborted();
        if (!outputSchema.safeParse(result.structuredContent).success) {
          throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
        }

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

function responseFailure(upstream: Response) {
  const status = upstream.status;

  return new ApplicationFailure(responseFailureCode(status), {
    retry_after_seconds: /^\d+$/.test(upstream.headers.get("retry-after") ?? "")
      ? Number(upstream.headers.get("retry-after"))
      : undefined,
  });
}

function namedError(error: unknown, name: string): error is Error {
  return error instanceof Error && error.name === name;
}

function generatedResponseFailure(error: unknown) {
  const response: unknown = namedError(error, "ResponseError")
    ? Object.getOwnPropertyDescriptor(error, "response")?.value
    : undefined;

  if (error instanceof ResponseError || response instanceof Response) {
    const upstream: Response =
      response instanceof Response
        ? response
        : (error as ResponseError).response;

    return responseFailure(upstream);
  }

  return undefined;
}

function invalidPayload(error: unknown): boolean {
  return (
    error instanceof SyntaxError ||
    error instanceof TypeError ||
    error instanceof z.ZodError
  );
}

/** A tool's public contract and typed execution capability, independent of its host. */
export interface ToolDefinition<T> {
  name: string;
  description: string;
  inputSchema: z.ZodType<T>;
  outputSchema: z.ZodType;
  work: (
    input: T,
    access: IracingDataAccess,
    context: IracingToolContext,
  ) => Promise<ReturnType<typeof completeResult>>;
}

function responseFailureCode(status: number) {
  if (status === 401 || status === 403) {
    return "UPSTREAM_UNAUTHORIZED";
  }

  if (status === 404) {
    return "NOT_FOUND";
  }

  if (status === 429) {
    return "RATE_LIMITED";
  }

  if (status >= 500 || status === 408) {
    return "UPSTREAM_UNAVAILABLE";
  }

  return "DATA_RESOLUTION_FAILED";
}
