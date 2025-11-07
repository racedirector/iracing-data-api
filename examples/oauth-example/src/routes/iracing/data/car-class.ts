import { createEndpoint } from "../utils";

export const getCarClass = createEndpoint(
  "/data/carclass/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.carClass.get();
    return response.data;
  }
);
