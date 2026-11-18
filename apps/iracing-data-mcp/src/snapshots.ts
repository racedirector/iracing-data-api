import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Persist validated reference documents; reuse snapshots across restarts.
 * @param {string} file - Snapshot document path.
 * @param {() => Promise<unknown>} load - Fetcher used only when the snapshot is absent.
 * @param {(document: unknown) => T} parse - Validation before use or persistence.
 * @returns {() => Promise<T>} Coalesced snapshot reader and hydrator.
 */
export function createFileBackedResolver<T>(
  file: string,
  load: () => Promise<unknown>,
  parse: (document: unknown) => T,
): (() => Promise<T>) & { refresh(): Promise<T> } {
  let inFlight: Promise<T> | undefined;

  let refreshing: Promise<T> | undefined;

  async function readOrLoad(): Promise<T> {
    try {
      return parse(JSON.parse(await readFile(file, "utf8")) as unknown);
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      )) {
        throw error;
      }
    }

    return download();
  }

  async function download(): Promise<T> {
    const data = parse(await load());

    await mkdir(dirname(file), { recursive: true });
    const temporary = `${file}.${randomUUID()}.tmp`;

    try {
      await writeFile(temporary, JSON.stringify(data), {
        mode: 0o600,
        flag: "wx",
      });
      await rename(temporary, file);
    } finally {
      await rm(temporary, { force: true });
    }

    return data;
  }

  const read = async () => {
    if (refreshing) {
      return refreshing;
    }

    const current = inFlight ?? (inFlight = readOrLoad());

    try {
      return await current;
    } finally {
      if (inFlight === current) {
        inFlight = undefined;
      }
    }
  };

  return Object.assign(read, {
    refresh(): Promise<T> {
      refreshing ??= (
        inFlight?.catch(() => undefined).then(download) ?? download()
      ).finally(() => {
        refreshing = undefined;
      });

      return refreshing;
    },
  });
}
