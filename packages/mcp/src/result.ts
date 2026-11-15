import { ApplicationFailure } from "./diagnostics/errors.js";

/**
 * The combined structured and JSON-text MCP response must fit 64 KiB.
 * @param {Record<string, unknown>} value - Validated, allowlisted tool response fields.
 * @returns {{ content: { type: "text"; text: string }[]; structuredContent: Record<string, unknown> }} Equivalent text and structured MCP result.
 * @throws {ApplicationFailure} When the combined serialized response exceeds 64 KiB.
 */
export function completeResult(value: Record<string, unknown>) {
  const result = {
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
    structuredContent: value,
  };

  if (Buffer.byteLength(JSON.stringify(result)) > 64 * 1024) {
    throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
  }

  return result;
}
