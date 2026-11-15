import { ApplicationFailure } from "./diagnostics/errors.js";

/**
 * The combined structured and JSON-text MCP response must fit 64 KiB.
 * @param value
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
