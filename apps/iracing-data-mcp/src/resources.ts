import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { ResourceTemplate } from "@modelcontextprotocol/server";
import type { McpServer } from "@modelcontextprotocol/server";
import type { CarCatalogResolver } from "./catalog.js";
import type { AssetCatalogResolver } from "./assets.js";

/** Resource resolvers are injected independently of their storage and fetch adapters. */
export interface ReferenceResolvers {
  readonly cars: CarCatalogResolver;
  readonly assets?: Readonly<{
    car: AssetCatalogResolver;
    track: AssetCatalogResolver;
    series: AssetCatalogResolver;
  }>;
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

  const assetCatalogs = resolvers.assets;

  if (assetCatalogs) {
    const assetUris = {
      car: "iracing://assets/cars",
      track: "iracing://assets/tracks",
      series: "iracing://assets/series",
    } as const;

    for (const kind of ["car", "track", "series"] as const) {
      server.registerResource(
        `${kind}-assets`,
        assetUris[kind],
        { title: `iRacing ${kind} assets`, mimeType: "application/json" },
        async (uri) => ({
          contents: [{
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(await assetCatalogs[kind].all()),
          }],
        }),
      );
    }
  }
}

/** A persisted snapshot can be read normally or forcibly fetched and replaced. */
export interface FileBackedResolver<T> {
  (): Promise<T>;
  refresh(): Promise<T>;
}

/** Validate before atomic replacement; retain the previous snapshot on failures. */
export function createFileBackedResolver<T>(
  file: string,
  load: () => Promise<unknown>,
  parse: (document: unknown) => T,
): FileBackedResolver<T> {
  let reading: Promise<T> | undefined;
  let refreshing: Promise<T> | undefined;

  async function fetchAndPublish(): Promise<T> {
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

  async function readOrLoad(): Promise<T> {
    try {
      return parse(JSON.parse(await readFile(file, "utf8")) as unknown);
    } catch (error) {
      if (!isMissingFile(error)) {
        throw error;
      }
    }

    return fetchAndPublish();
  }

  const resolve = async () => {
    if (refreshing) {
      return refreshing;
    }

    if (!reading) {
      const current = readOrLoad();
      reading = current;
      void current.then(
        () => { if (reading === current) reading = undefined; },
        () => { if (reading === current) reading = undefined; },
      );
    }

    return reading;
  };

  resolve.refresh = async () => {
    if (!refreshing) {
      const currentRead = reading;
      const current = (async () => {
        // A force request after a normal read must always fetch new data.
        await currentRead?.catch(() => undefined);
        return fetchAndPublish();
      })();

      refreshing = current;
      void current.then(
        () => { if (refreshing === current) refreshing = undefined; },
        () => { if (refreshing === current) refreshing = undefined; },
      );
    }

    return refreshing;
  };

  return resolve;
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
