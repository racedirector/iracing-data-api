import { z } from "zod";
import { registerApplicationTool } from "../../src/execution.js";
import type { FailureFor } from "../../src/diagnostics/errors.js";
import type {
  IracingToolRegistry,
  IracingToolServices,
} from "../../src/services.js";
import type { OperationContext } from "../../src/tools/types.js";

declare const server: IracingToolRegistry;
declare const services: IracingToolServices;

const inputSchema = z.strictObject({
  count: z.string().transform(Number),
  limit: z.int().default(10),
});
const outputSchema = z.object({ count: z.number() });
const definition = {
  name: "type-test",
  description: "Type-only fixture",
  annotations: { readOnlyHint: true },
  inputSchema,
  outputSchema,
};

registerApplicationTool(server, services, {
  ...definition,
  async execute(input, context) {
    const count: number = input.count;
    const limit: number = input.limit;

    // @ts-expect-error The operation receives transformed input, not the wire string.
    const wire: string = input.count;
    void wire;

    if (context.signal.aborted) {
      return {
        ok: false,
        error: {
          code: "TOKEN_REFRESH_FAILED",
          reason: "transient_refresh",
          retry_after_seconds: 5,
        },
      };
    }

    return { ok: true, data: { count: count + limit } };
  },
});

registerApplicationTool(server, services, {
  ...definition,
  // @ts-expect-error Output inference cannot widen the supplied schema.
  async execute() {
    return { ok: true, data: { count: "wrong" } };
  },
});

registerApplicationTool(server, services, {
  ...definition,
  // @ts-expect-error Unknown application codes are not expected failures.
  async execute() {
    return { ok: false, error: { code: "BOGUS" } };
  },
});

registerApplicationTool(server, services, {
  ...definition,
  // @ts-expect-error Reasons are code-specific, not arbitrary text.
  async execute() {
    return {
      ok: false,
      error: { code: "TOKEN_REFRESH_FAILED", reason: "unsafe_link" },
    };
  },
});

const invalid: FailureFor<"NOT_FOUND"> = {
  code: "NOT_FOUND",
  // @ts-expect-error Unrelated failures do not accept refresh reasons.
  reason: "transient_refresh",
};
void invalid;

const retryableFailures: FailureFor[] = [
  { code: "RATE_LIMITED", retry_after_seconds: 5 },
  { code: "UPSTREAM_UNAVAILABLE", retry_after_seconds: 5 },
  {
    code: "TOKEN_REFRESH_FAILED",
    reason: "transient_refresh",
    retry_after_seconds: 5,
  },
  { code: "TOKEN_REFRESH_FAILED", reason: "rotation_uncertain" },
  { code: "TOKEN_REFRESH_FAILED" },
];
void retryableFailures;

// @ts-expect-error Non-retryable codes cannot promise retry metadata.
const notFoundDelay: FailureFor = { code: "NOT_FOUND", retry_after_seconds: 5 };
void notFoundDelay;

// @ts-expect-error Invalid input is not retryable.
const invalidInputDelay: FailureFor = {
  code: "INVALID_INPUT",
  retry_after_seconds: 5,
};
void invalidInputDelay;

// @ts-expect-error Uncertain refresh rotation is not retryable.
const uncertainRefreshDelay: FailureFor = {
  code: "TOKEN_REFRESH_FAILED",
  reason: "rotation_uncertain",
  retry_after_seconds: 5,
};
void uncertainRefreshDelay;

// @ts-expect-error A refresh retry delay requires explicit transient evidence.
const unprovenRefreshDelay: FailureFor = {
  code: "TOKEN_REFRESH_FAILED",
  retry_after_seconds: 5,
};
void unprovenRefreshDelay;

declare const signal: AbortSignal;
const operationContext: OperationContext = { signal };
// @ts-expect-error Domain operations do not receive MCP diagnostic context.
void operationContext.request;
