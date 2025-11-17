import { createEndpoint } from "../utils";

export const getCarClass = createEndpoint(
  "/data/carclass/get",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    return await iracing.carClass.getCarClass();
  }
);
