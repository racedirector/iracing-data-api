import { createEndpoint } from "./utils";

export const carAssets = createEndpoint(
  "/data/car/assets",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    return iracing.api.data.car.assets();
  }
);

export const getCar = createEndpoint(
  "/data/car/get",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    return iracing.api.data.car.get();
  }
);
