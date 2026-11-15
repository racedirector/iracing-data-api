import type { DisplayWriter } from "./types.js";

export type { DisplayWriter } from "./types.js";

/**
 * Write serialized command output to stdout.
 * @param {string} document - Serialized document.
 */
export function writeStdout(document: string): void {
  process.stdout.write(document);
}

/**
 * Preserve JSON root shapes while routing object records through the host logger.
 * @param {{ info(document: object): void }} logger - Metadata-free JSON logger.
 * @param {Function} logger.info - Write one object record.
 * @param {(document: string) => void} write - Raw stdout sink.
 * @returns {DisplayWriter} Shared command presentation capability.
 */
export function createDisplayWriter(
  logger: { info(document: object): void },
  write: (document: string) => void = writeStdout,
): DisplayWriter {
  return {
    display(document) {
      const serialized = JSON.stringify(document);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- JSON.stringify returns undefined for unsupported root values at runtime.
      if (serialized === undefined) {
        throw new TypeError("Output must be a JSON document.");
      }

      const normalized: unknown = JSON.parse(serialized);

      if (
        normalized !== null &&
        typeof normalized === "object" &&
        !Array.isArray(normalized)
      ) {
        logger.info(normalized);
      } else {
        write(`${serialized}\n`);
      }
    },
  };
}
