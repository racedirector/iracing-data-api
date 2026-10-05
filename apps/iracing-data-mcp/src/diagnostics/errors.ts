import { randomUUID } from "node:crypto";
import { z } from "zod";

/** Fixed recovery text is the only source of outward-facing messages. */
export const errorPolicy = Object.freeze({
  INVALID_INPUT: ["Correct the tool input and try again.", false],
  AUTHORIZATION_REQUIRED: [
    "Stop the app, run host iracing-data auth login --scope iracing.auth, then restart.",
    false,
  ],
  TOKEN_REFRESH_FAILED: [
    "Token refresh failed. Retry only when safe; otherwise stop and sign in again.",
    false,
  ],
  UPSTREAM_UNAUTHORIZED: [
    "Check your iRacing account access and entitlement. Repeated refresh will not repair access.",
    false,
  ],
  RATE_LIMITED: [
    "iRacing rate limited the request. Wait before retrying.",
    true,
  ],
  UPSTREAM_UNAVAILABLE: [
    "iRacing is temporarily unavailable. Try again later.",
    true,
  ],
  DATA_RESOLUTION_FAILED: [
    "Data could not be safely resolved. Give the request ID to support.",
    false,
  ],
  RESPONSE_LIMIT_EXCEEDED: [
    "Narrow the request. The source or response exceeds the app limit.",
    false,
  ],
  CURSOR_EXPIRED: ["The cursor expired. Run the initial search again.", false],
  NOT_FOUND: [
    "No matching data was found. Check the requested identifiers.",
    false,
  ],
  CONFIGURATION_ERROR: [
    "Repair the local app configuration or credential mount, then restart.",
    false,
  ],
  INTERNAL_ERROR: [
    "An unexpected failure occurred. Give the request ID to support.",
    false,
  ],
} as const);

for (const policy of Object.values(errorPolicy)) Object.freeze(policy);

export type ApplicationErrorCode = keyof typeof errorPolicy;
const codes = Object.keys(errorPolicy) as [
  ApplicationErrorCode,
  ...ApplicationErrorCode[],
];
export const ApplicationErrorCodeSchema = z.enum(codes);
const reasons = {
  AUTHORIZATION_REQUIRED: [
    "missing_session",
    "revoked_authorization",
    "invalid_session",
    "insufficient_scope",
    "rotation_uncertain",
    "persistence_failed",
  ],
  TOKEN_REFRESH_FAILED: ["transient_refresh", "rotation_uncertain"],
  UPSTREAM_UNAUTHORIZED: ["account_entitlement", "upstream_access_denied"],
  DATA_RESOLUTION_FAILED: ["invalid_data", "unsafe_link"],
  CURSOR_EXPIRED: ["expired_or_evicted", "session_changed"],
} as const;

export const ErrorEnvelopeSchema = z
  .strictObject({
    error: z.strictObject({
      code: ApplicationErrorCodeSchema,
      message: z.string().max(180),
      retryable: z.boolean(),
      request_id: z.uuid(),
      reason: z.string().max(40).optional(),
      retry_after_seconds: z.number().int().min(0).max(3600).optional(),
    }),
  })
  .superRefine(({ error }, ctx) => {
    const allowed = reasons[error.code as keyof typeof reasons] as
      readonly string[] | undefined;
    if (error.reason !== undefined && !allowed?.includes(error.reason))
      ctx.addIssue({ code: "custom", message: "Invalid error reason" });
    const safeRefresh =
      error.code === "TOKEN_REFRESH_FAILED" &&
      error.reason === "transient_refresh";
    if (
      error.message !== errorPolicy[error.code][0] ||
      error.retryable !== (safeRefresh || errorPolicy[error.code][1])
    )
      ctx.addIssue({ code: "custom", message: "Invalid error policy" });
    if (error.retry_after_seconds !== undefined && !error.retryable)
      ctx.addIssue({ code: "custom", message: "Invalid retry metadata" });
  });
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

// Contexts are generated here, never accepted from a client or upstream ID.
const contexts = new WeakMap<RequestContext, string>();
export interface RequestContext {
  readonly request_id: string;
}
export function createRequestContext(): RequestContext {
  const context = Object.freeze({ request_id: randomUUID() });
  contexts.set(context, context.request_id);
  return context;
}
export function requestId(context: RequestContext): string {
  return contexts.get(context) ?? createRequestContext().request_id;
}

const failures = new WeakMap<
  ApplicationFailure,
  Readonly<{
    code: ApplicationErrorCode;
    reason?: string;
    retry_after_seconds?: number;
  }>
>();
export class ApplicationFailure extends Error {
  constructor(code: ApplicationErrorCode, options: unknown = {}) {
    const validCode = ApplicationErrorCodeSchema.safeParse(code);
    const safeCode = validCode.success ? validCode.data : "INTERNAL_ERROR";
    super(errorPolicy[safeCode][0]);
    this.name = "ApplicationFailure";
    const parsed = z
      .object({
        reason: z.string().optional(),
        retry_after_seconds: z.number().optional(),
      })
      .safeParse(options);
    const input = parsed.success ? parsed.data : {};
    const allowed = reasons[safeCode as keyof typeof reasons] as
      readonly string[] | undefined;
    const reason = allowed?.includes(input.reason ?? "")
      ? input.reason
      : undefined;
    const retryable =
      errorPolicy[safeCode][1] ||
      (safeCode === "TOKEN_REFRESH_FAILED" && reason === "transient_refresh");
    const seconds = input.retry_after_seconds;
    failures.set(
      this,
      Object.freeze({
        code: safeCode,
        ...(reason ? { reason } : {}),
        ...(retryable &&
        typeof seconds === "number" &&
        Number.isFinite(seconds) &&
        seconds >= 0
          ? { retry_after_seconds: Math.min(3600, Math.ceil(seconds)) }
          : {}),
      }),
    );
    Object.freeze(this);
  }
}

/** Discards messages, causes, stacks, bodies, and all unrecognized exception data. */
export function errorEnvelope(
  error: unknown,
  context: RequestContext,
): ErrorEnvelope {
  const details =
    error instanceof ApplicationFailure ? failures.get(error) : undefined;
  const code = details?.code ?? "INTERNAL_ERROR";
  return ErrorEnvelopeSchema.parse({
    error: {
      ...details,
      code,
      message: errorPolicy[code][0],
      retryable:
        errorPolicy[code][1] ||
        (code === "TOKEN_REFRESH_FAILED" &&
          details?.reason === "transient_refresh"),
      request_id: requestId(context),
    },
  });
}
export function toolError(error: unknown, context: RequestContext) {
  if (error instanceof ProtocolFailure) throw new ProtocolFailure(error.domain);
  const structuredContent = errorEnvelope(error, context);
  return {
    isError: true as const,
    structuredContent,
    content: [
      { type: "text" as const, text: JSON.stringify(structuredContent) },
    ],
  };
}

/** HTTP/JSON-RPC faults are separate and cannot be serialized as application details. */
export type FailureDomain =
  | "http"
  | "mcp_protocol"
  | "tool"
  | "oauth_session"
  | "upstream"
  | "configuration"
  | "internal";
export class ProtocolFailure extends Error {
  constructor(readonly domain: "http" | "mcp_protocol") {
    super("Protocol request rejected.");
    this.name = "ProtocolFailure";
    Object.freeze(this);
  }
}
