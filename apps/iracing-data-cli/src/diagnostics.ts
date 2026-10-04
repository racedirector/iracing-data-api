export type Diagnostics = {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

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
