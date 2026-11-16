import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { McpServer } from "@modelcontextprotocol/server";

/** Map logical resource names to injected resolvers; MCP owns only presentation. */
export function registerReferenceResources(
  server: Pick<McpServer, "registerResource">,
  resolvers: ReadonlyMap<string, () => Promise<unknown>>,
): void {
  for (const [name, resolve] of resolvers) {
    server.registerResource(
      name,
      `iracing://reference/${name}`,
      { title: `iRacing ${name}`, mimeType: "application/json" },
      async (uri) => ({
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(await resolve()),
        }],
      }),
    );
  }
}

/** Persist a complete reference list on first read; reuse it on later starts. */
export function createFileBackedResolver(
  file: string,
  load: () => Promise<unknown[]>,
): () => Promise<unknown[]> {
  let inFlight: Promise<unknown[]> | undefined;

  async function readOrLoad(): Promise<unknown[]> {
    try {
      const snapshot: unknown = JSON.parse(await readFile(file, "utf8"));

      if (!Array.isArray(snapshot)) {
        throw new TypeError("Invalid reference snapshot.");
      }

      return snapshot;
    } catch (error) {
      if (!isMissingFile(error)) {
        throw error;
      }
    }

    const data = await load();
    await mkdir(dirname(file), { recursive: true });
    const temporary = `${file}.${randomUUID()}.tmp`;

    try {
      await writeFile(temporary, JSON.stringify(data), { mode: 0o600, flag: "wx" });
      await rename(temporary, file);
    } finally {
      await rm(temporary, { force: true });
    }

    return data;
  }

  return async () => {
    const current = inFlight ?? (inFlight = readOrLoad());

    try {
      return await current;
    } finally {
      if (inFlight === current) {
        inFlight = undefined;
      }
    }
  };
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
