/** Diagnostics logging. */
export interface Diagnostics {
  /**
   * Writes a secret-safe informational diagnostic.
   * @param {string} message - Secret-free message to emit.
   */
  info(message: string): void;

  /**
   * Writes a secret-safe warning diagnostic.
   * @param {string} message - Secret-free message to emit.
   */
  warn(message: string): void;

  /**
   * Writes a secret-safe failure diagnostic.
   * @param {string} message - Secret-free message to emit.
   */
  error(message: string): void;
}

/** Shared document presentation capability for JSON-producing commands. */
export interface DisplayWriter {
  /**
   * Write one JSON document with a trailing newline, preserving its root shape.
   * @param {unknown} document - Command output, never credentials or diagnostics.
   */
  display(document: unknown): void;
}
