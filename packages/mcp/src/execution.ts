import { z } from "zod";
import {
  ApplicationFailure,
  createRequestContext,
  toolError,
} from "./diagnostics/errors.js";
import { toolInputSchema } from "./input.js";
import { completeResult } from "./result.js";
import type { FailureFor, RequestContext } from "./diagnostics/errors.js";
import type {
  IracingToolContext,
  IracingToolRegistry,
  IracingToolServices,
} from "./services.js";
import type { Result } from "./tools/types.js";
import type { ToolAnnotations } from "@modelcontextprotocol/server";

/** Adapter-owned context; capability selection remains explicit in each tool. */
export interface ToolExecutionContext extends IracingToolContext {
  /** One internally generated correlation handle for this tool call. */
  readonly request: RequestContext;

  /** Host-owned capability selectors, never pre-resolved during registration. */
  readonly services: IracingToolServices;
}

/** One explicitly registered tool, not an entry in a dynamic registry. */
interface ApplicationTool<
  Input extends z.ZodType,
  Output extends z.ZodType<Record<string, unknown>>,
  Failure extends FailureFor,
> {
  readonly name: string;
  readonly description: string;
  readonly annotations: ToolAnnotations;
  readonly inputSchema: Input;
  readonly outputSchema: Output;
  readonly execute: (
    input: z.output<NoInfer<Input>>,
    context: ToolExecutionContext,
  ) => Promise<Result<z.input<NoInfer<Output>>, Failure>>;
}

/**
 * Register one tool with a typed application-to-MCP boundary.
 * @param {IracingToolRegistry} server - Caller-owned SDK registration surface.
 * @param {IracingToolServices} services - Selectors resolved only by the tool's execution callback.
 * @param {ApplicationTool<Input, Output, Failure>} definition - Metadata, canonical schemas and domain execution.
 * @throws {Error} If a schema cannot be advertised as a JSON-compatible object.
 */
export function registerApplicationTool<
  Input extends z.ZodType,
  Output extends z.ZodType<Record<string, unknown>>,
  Failure extends FailureFor,
>(
  server: IracingToolRegistry,
  services: IracingToolServices,
  definition: ApplicationTool<Input, Output, Failure>,
): void {
  // Conversion rejects unrepresentable transforms before publishing the tool.
  if (z.toJSONSchema(definition.outputSchema).type !== "object") {
    throw new TypeError("Tool output must advertise an object schema.");
  }

  server.registerTool(
    definition.name,
    {
      description: definition.description,
      annotations: definition.annotations,
      inputSchema: toolInputSchema(definition.inputSchema),
      outputSchema: definition.outputSchema,
    },
    async (input, request) =>
      executeApplicationTool(definition, input, {
        signal: request.mcpReq.signal,
        authInfo: request.http?.authInfo,
        request: createRequestContext(),
        services,
      }),
  );
}

async function executeApplicationTool<
  Input extends z.ZodType,
  Output extends z.ZodType<Record<string, unknown>>,
  Failure extends FailureFor,
>(
  definition: ApplicationTool<Input, Output, Failure>,
  input: unknown,
  context: ToolExecutionContext,
) {
  try {
    throwIfCancelled(context.signal);
    const checked = await definition.inputSchema.safeParseAsync(input);

    throwIfCancelled(context.signal);
    if (!checked.success) {
      throw new ApplicationFailure("INVALID_INPUT");
    }

    const result = await definition.execute(checked.data, context);

    throwIfCancelled(context.signal);
    if (!result.ok) {
      return toolError(
        new ApplicationFailure(result.error.code, result.error),
        context.request,
      );
    }

    const output = await definition.outputSchema.safeParseAsync(result.data);

    throwIfCancelled(context.signal);
    if (!output.success) {
      throw new ApplicationFailure("DATA_RESOLUTION_FAILED");
    }

    return completeResult(output.data);
  } catch (error) {
    // Do not serialize an arbitrary abort reason or call cancellation an outage.
    // The SDK suppresses responses to cancelled requests.
    throwIfCancelled(context.signal);

    return toolError(error, context.request);
  }
}

function throwIfCancelled(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new DOMException("Request cancelled.", "AbortError");
  }
}
