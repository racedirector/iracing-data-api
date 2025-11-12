import { createEndpoint } from "../utils";

export const getCarClass = createEndpoint(
  "/data/carclass/get",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.carClass.getCarClass();
    return response.data;
  }
);
