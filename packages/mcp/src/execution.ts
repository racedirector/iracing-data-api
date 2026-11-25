import { z } from "zod";
import {
  ApplicationFailure,
  DetailReasonSchema,
  createRequestContext,
  toolError,
} from "./diagnostics/errors.js";
import { toolInputSchema } from "./input.js";
import { completeResult } from "./result.js";
import type {
  DetailReason,
  ErrorDetail,
  FailureFor,
  RequestContext,
} from "./diagnostics/errors.js";
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
      throw invalidInputFailure(checked.error);
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

const fieldSegment = /^[a-z][a-z0-9_]*$/;

/** Built-in schema issue codes that identify a field without exposing messages. */
const builtInReasons: Readonly<Record<string, DetailReason>> = Object.freeze({
  invalid_type: "invalid_value",
  invalid_value: "invalid_value",
  invalid_enum_value: "invalid_value",
  invalid_format: "invalid_format",
  too_small: "invalid_value",
  too_big: "invalid_value",
});

/**
 * Build the canonical `INVALID_INPUT` failure for a rejected schema parse.
 *
 * Host adapters that re-validate caller input use this projection so a second
 * parse reports the same bounded field details instead of surfacing a caller
 * problem as an internal failure.
 * @param {object} error - Rejected parse result carrying the schema issues.
 * @param {readonly z.core.$ZodIssue[]} error.issues - Issues from the rejected parse.
 * @returns {ApplicationFailure} Input failure with projected, bounded details.
 */
export function invalidInputFailure(error: {
  readonly issues: readonly z.core.$ZodIssue[];
}): ApplicationFailure {
  return new ApplicationFailure("INVALID_INPUT", {
    details: inputDetails(error.issues),
  });
}

/**
 * Project schema issues into allowlisted field diagnostics.
 *
 * Only sanitized issue paths and reasons declared by the owning input schema are
 * used. `unrecognized_keys` is the exception: its field echoes the caller's own
 * key name, which by definition is not a schema key, under the same syntax and
 * length limits. Rejected values, raw schema messages, upstream text and
 * unrecognized issue shapes never reach the error envelope. `ApplicationFailure`
 * orders, deduplicates and bounds the retained details.
 */
function inputDetails(issues: readonly z.core.$ZodIssue[]): ErrorDetail[] {
  return issues.flatMap(issueDetails);
}

function issueDetails(issue: z.core.$ZodIssue): readonly ErrorDetail[] {
  if (issue.code === "unrecognized_keys") {
    return issue.keys.flatMap((key) => {
      const field = fieldPath([key]);

      return field ? [{ field, reason: "unknown_field" as const }] : [];
    });
  }

  const field = fieldPath(issue.path);

  if (!field) {
    return [];
  }

  const reason =
    issue.code === "custom"
      ? customReason(issue.params)
      : builtInReasons[issue.code];

  return reason ? [{ field, reason }] : [];
}

function customReason(params: unknown): DetailReason | undefined {
  const candidate =
    typeof params === "object" && params !== null
      ? (params as { reason?: unknown }).reason
      : undefined;

  const parsed = DetailReasonSchema.safeParse(candidate);

  return parsed.success ? parsed.data : undefined;
}

function fieldPath(path: readonly PropertyKey[]): string | undefined {
  const segments: string[] = [];

  for (const segment of path) {
    // Details name fields, not elements, so array indices are collapsed.
    if (typeof segment === "number") {
      continue;
    }

    // Reject the whole path rather than silently retargeting the surviving
    // segments to a different field than the one the issue describes.
    if (typeof segment !== "string" || !fieldSegment.test(segment)) {
      return undefined;
    }

    segments.push(segment);
  }

  const field = segments.join(".");

  return field.length > 0 && field.length <= 64 ? field : undefined;
}
