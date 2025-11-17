import { createEndpoint } from "../utils";

export const carAssets = createEndpoint(
  "/data/car/assets",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.car.getCarAssets();
  }
);

export const getCar = createEndpoint(
  "/data/car/get",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.car.getCar();
  }
);
