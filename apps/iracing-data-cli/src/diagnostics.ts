/**
 * CLI diagnostic channel. Default output is stderr; stdout belongs to command
 * data. This small sink does not sanitize arbitrary exception strings: command
 * boundaries must choose safe text and never pass raw token/response/error dumps.
 * Authorization URLs may be printed for explicit manual browser completion.
 */
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

/**
 * Creates the CLI diagnostic sink over a single writer, keeping user output separate while
 * preserving level semantics.
 * @param {(message: string) => void} write - Injected sink for formatted diagnostic output.
 * @returns {Diagnostics} Diagnostic methods bound to the injected writer.
 */
export function createDiagnostics(
  write: (message: string) => void = (message) =>
    process.stderr.write(`${message}\n`),
): Diagnostics {
  return {
    info: write,
    warn: write,
    error: write,
  };
}
