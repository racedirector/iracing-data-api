import type { Diagnostics } from "./types.js";

export type { Diagnostics } from "./types.js";

/**
 * Bind diagnostics to the host logger while retaining its method receiver.
 * @param {Diagnostics} logger - Stderr logger.
 * @returns {Diagnostics} Secret-safe diagnostic sink.
 */
export function createDiagnostics(logger: Diagnostics): Diagnostics {
  return {
    info: (message) => {
      logger.info(message);
    },
    warn: (message) => {
      logger.warn(message);
    },
    error: (message) => {
      logger.error(message);
    },
  };
}
