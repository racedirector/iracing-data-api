import { z } from "zod";

/** Minimum fields needed to index the materialized iRacing car catalog. */
export const CarCatalogSchema = z
  .array(
    z.looseObject({
      car_id: z.int().positive(),
      car_name: z.string().min(1),
    }),
  )
  .min(1);

export type Car = z.output<typeof CarCatalogSchema>[number];

export interface CarCatalogResolver {
  all(): Promise<readonly Car[]>;
  get(carId: number): Promise<Car | null>;
  refresh(): Promise<readonly Car[]>;
}

/** Build an ID index once; replace it only after a successful forced refresh. */
export function createCarCatalogResolver(
  load: (() => Promise<readonly Car[]>) & {
    refresh?: () => Promise<readonly Car[]>;
  },
): CarCatalogResolver {
  type Snapshot = {
    cars: readonly Car[];
    byId: ReadonlyMap<number, Car>;
  };

  let current: Promise<Snapshot> | undefined;
  let refreshing: Promise<readonly Car[]> | undefined;

  function index(cars: readonly Car[]): Snapshot {
    return { cars, byId: new Map(cars.map((car) => [car.car_id, car])) };
  }

  function resolve(): Promise<Snapshot> {
    if (!current) {
      const pending = load().then(index);
      current = pending;
      void pending.catch(() => {
        if (current === pending) {
          current = undefined;
        }
      });
    }

    return current;
  }

  function refresh(): Promise<readonly Car[]> {
    if (!load.refresh) {
      return Promise.reject(new Error("Car catalog does not support refresh."));
    }

    if (!refreshing) {
      const next = load.refresh().then((cars) => {
        current = Promise.resolve(index(cars));
        return cars;
      });
      refreshing = next;
      void next.then(
        () => { if (refreshing === next) refreshing = undefined; },
        () => { if (refreshing === next) refreshing = undefined; },
      );
    }

    return refreshing;
  }

  return {
    all: async () => (await resolve()).cars,
    get: async (carId) => (await resolve()).byId.get(carId) ?? null,
    refresh,
  };
}
