/**
 * CLI diagnostic channel. Default output is stderr; stdout belongs to command
 * data. This small sink does not sanitize arbitrary exception strings: command
 * boundaries must choose safe text and never pass raw token/response/error dumps.
 * Authorization URLs may be printed for explicit manual browser completion.
 */
export interface Diagnostics {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/**
 * Creates the CLI diagnostic sink over a single writer, keeping user output separate while
 * preserving level semantics.
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
