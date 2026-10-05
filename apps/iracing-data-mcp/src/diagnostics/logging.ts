import { z } from "zod";
import {
  ApplicationErrorCodeSchema,
  errorEnvelope,
  requestId,
  type RequestContext,
} from "./errors.js";

// No free-form strings: even a 'safe-looking' token/name/path must not pass.
const diagnosticFields = z.object({
  operation: z
    .enum([
      "startup",
      "tool_call",
      "refresh",
      "session_restore",
      "cache_fetch",
      "data_api",
    ])
    .optional(),
  tool: z
    .enum([
      "get_my_driver",
      "find_drivers",
      "get_recent_races",
      "search_driver_races",
      "get_race_result",
      "list_series_seasons",
      "get_series_schedule",
      "lookup_content",
    ])
    .optional(),
  stage: z.enum(["start", "complete", "failed"]).optional(),
  auth_state: z
    .enum(["ready", "authorization_required", "configuration_error"])
    .optional(),
  previous_auth_state: z
    .enum(["ready", "authorization_required", "configuration_error"])
    .optional(),
  elapsed_ms: z.number().finite().min(0).max(86400000).optional(),
  bytes: z.number().int().min(0).max(1073741824).optional(),
  items: z.number().int().min(0).max(1000000).optional(),
  status: z.number().int().min(100).max(599).optional(),
  retry_attempt: z.number().int().min(0).max(100).optional(),
  error_code: ApplicationErrorCodeSchema.optional(),
});

/** Central redaction by projection: unknown fields and invalid values are discarded. */
export function redactDiagnostics(
  input: unknown,
): z.infer<typeof diagnosticFields> {
  if (input === null || typeof input !== "object") {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const [key, schema] of Object.entries(diagnosticFields.shape)) {
    // Read only own data properties; never invoke getters or toJSON on exception objects.
    const descriptor = Object.getOwnPropertyDescriptor(input, key);

    const parsed = schema.safeParse(descriptor?.value);

    if (parsed.success && parsed.data !== undefined) {
      result[key] = parsed.data;
    }
  }

  return result;
}

export function createDiagnosticLogger(
  write: (line: string) => void = (line) => {
    process.stderr.write(line);
  },
) {
  return {
    log(
      level: "info" | "error" | "debug",
      context: RequestContext,
      fields: unknown = {},
    ) {
      const safeLevel = ["info", "error", "debug"].includes(level)
        ? level
        : "error";

      write(
        JSON.stringify({
          level: safeLevel,
          request_id: requestId(context),
          ...redactDiagnostics(fields),
        }) + "\n",
      );
    },
    failure(context: RequestContext, error: unknown, fields: unknown = {}) {
      write(
        JSON.stringify({
          level: "error",
          request_id: requestId(context),
          ...redactDiagnostics(fields),
          error_code: errorEnvelope(error, context).error.code,
        }) + "\n",
      );
    },
  };
}

/** Health projection only; #350 owns the endpoint and liveness response. */
export function healthDiagnostics(input: unknown) {
  const { auth_state } = redactDiagnostics(input);

  return { auth_state: auth_state ?? "configuration_error" };
}
