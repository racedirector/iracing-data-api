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

/**
 * Compose the common page fields with each tool's local projected contract.
 * @param {z.ZodType} items - Schema or projected collection items used to construct the page.
 * @param {z.ZodRawShape} context - Request-local identity, cancellation, or diagnostic context.
 * @returns {z.ZodObject<{ items: z.ZodArray<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>; returned_count: z.ZodNumber; complete: z.ZodBoolean; next_cursor: z.ZodNullable<z.ZodString>; source_total: z.ZodNumber; }, z.core.$strip>} Object schema for the bounded page and its continuation metadata.
 */
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
 * @param {IracingToolRegistry} server - Caller-owned MCP tool registration capability.
 * @param {IracingToolServices} services - Host-owned API access and continuation services.
 * @param {ToolDefinition<T>} root2 - Tool metadata, validation contracts, and execution handler.
 * @param {string} root2.name - MCP tool identifier advertised to clients.
 * @param {string} root2.description - Human-readable explanation advertised with the tool.
 * @param {z.ZodType<T, unknown, z.core.$ZodTypeInternals<T, unknown>>} root2.inputSchema - Runtime contract for incoming tool arguments.
 * @param {z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>} root2.outputSchema - Runtime contract for structured tool results.
 * @param {(input: T, access: IracingDataAccess, context: IracingToolContext) => Promise<ReturnType<typeof completeResult>>} root2.work - Handler executed with validated input and request-local API access.
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
  /** MCP tool name advertised to clients. */
  name: string;

  /** Human-readable explanation advertised alongside the tool. */
  description: string;

  /** Validation contract applied to incoming tool arguments. */
  inputSchema: z.ZodType<T>;

  /** Validation contract applied to structured tool results. */
  outputSchema: z.ZodType;

  /**
   * Runs the validated tool using request-local API access and cancellation.
   * @param {T} input - Untrusted input to validate or project.
   * @param {IracingDataAccess} access - Generated API configuration and continuation ownership for this request.
   * @param {IracingToolContext} context - Request-local identity, cancellation, or diagnostic context.
   * @returns {Promise<ReturnType<typeof completeResult>>} Successful text and structured-content projections within the response limit.
   */
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
