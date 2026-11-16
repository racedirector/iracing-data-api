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

/** Lookups over one shared, validated source document. */
export interface CarCatalogResolver {
  all(): Promise<readonly Car[]>;
  get(carId: number): Promise<Car | null>;
}

/** Build an ID index once; reset it when hydration fails so reads can retry. */
export function createCarCatalogResolver(
  load: () => Promise<readonly Car[]>,
): CarCatalogResolver {
  let current: Promise<{
    cars: readonly Car[];
    byId: ReadonlyMap<number, Car>;
  }> | undefined;

  async function resolve() {
    if (!current) {
      current = load()
        .then((cars) => ({
          cars,
          byId: new Map(cars.map((car) => [car.car_id, car])),
        }))
        .catch((error: unknown) => {
          current = undefined;
          throw error;
        });
    }

    return current;
  }

  return {
    all: async () => (await resolve()).cars,
    get: async (carId) => (await resolve()).byId.get(carId) ?? null,
  };
}
