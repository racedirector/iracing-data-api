import { createEndpoint } from "../utils";

export const carAssets = createEndpoint(
  "/data/car/assets",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.car.assets();
    return response.data;
  }
);

export const getCar = createEndpoint(
  "/data/car/get",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.car.get();
    return response.data;
  }
);
