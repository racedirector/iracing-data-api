import type { ApplicationFailure } from "@iracing-data/mcp";

/** Local diagnostic detail paired with a separately sanitized tool failure. */
export class LocalAuthorizationError extends Error {
  /** Branded failure used by the tool adapter, never the diagnostic message. */
  readonly failure: ApplicationFailure;

  /**
   * Preserve local diagnostics without weakening the core failure contract.
   * @param {string} message - Actionable local diagnostic text.
   * @param {ApplicationFailure} failure - Safe tool-facing authentication failure.
   * @param {unknown} cause - Original OAuth or storage failure.
   */
  constructor(message: string, failure: ApplicationFailure, cause?: unknown) {
    super(message, { cause });
    this.name = "LocalAuthorizationError";
    this.failure = failure;
  }
}
