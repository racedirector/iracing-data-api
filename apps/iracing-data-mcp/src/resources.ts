import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { ResourceTemplate } from "@modelcontextprotocol/server";
import type { McpServer } from "@modelcontextprotocol/server";
import type { CarCatalogResolver } from "./catalog.js";

/** Resource resolvers are injected independently of their storage and fetch adapters. */
export interface ReferenceResolvers {
  readonly cars: CarCatalogResolver;
}

/** Register a collection and a parameterized entity view over the same resolver. */
export function registerReferenceResources(
  server: Pick<McpServer, "registerResource">,
  resolvers: ReferenceResolvers,
): void {
  server.registerResource(
    "cars",
    "iracing://cars",
    { title: "iRacing Cars", mimeType: "application/json" },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(await resolvers.cars.all()),
      }],
    }),
  );

  server.registerResource(
    "car",
    new ResourceTemplate("iracing://cars/{carId}", { list: undefined }),
    { title: "iRacing Car", mimeType: "application/json" },
    async (uri, { carId }) => {
      if (typeof carId !== "string" || !/^[1-9]\d*$/.test(carId)) {
        throw new Error("Invalid car ID.");
      }

      const id = Number(carId);

      if (!Number.isSafeInteger(id)) {
        throw new Error("Invalid car ID.");
      }

      const car = await resolvers.cars.get(id);

      if (!car) {
        throw new Error("Car not found.");
      }

      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(car),
        }],
      };
    },
  );
}

/** Persist validated reference documents; reload snapshots across process restarts. */
export function createFileBackedResolver<T>(
  file: string,
  load: () => Promise<unknown>,
  parse: (document: unknown) => T,
): () => Promise<T> {
  let inFlight: Promise<T> | undefined;

  async function readOrLoad(): Promise<T> {
    try {
      return parse(JSON.parse(await readFile(file, "utf8")) as unknown);
    } catch (error) {
      if (!isMissingFile(error)) {
        throw error;
      }
    }

    const data = parse(await load());
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
