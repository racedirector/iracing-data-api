import { createEndpoint } from "./utils";

export const getCarClass = createEndpoint(
  "/data/carclass/get",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return iracing.api.data.carClass.get();
  }
);
