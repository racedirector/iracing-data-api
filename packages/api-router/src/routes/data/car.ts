import { createEndpoint } from "../utils";

export const carAssets = createEndpoint(
  "/data/car/assets",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.car.getCarAssets();
    return response.data;
  }
);

export const getCar = createEndpoint(
  "/data/car/get",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.car.getCar();
    return response.data;
  }
);
