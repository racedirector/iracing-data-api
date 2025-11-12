import { createEndpoint } from "../utils";

export const categories = createEndpoint(
  "/data/constants/categories",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.constants.getConstantsCategories();
    return response.data;
  }
);

export const divisions = createEndpoint(
  "/data/constants/divisions",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.constants.getConstantsDivisions();
    return response.data;
  }
);

export const eventTypes = createEndpoint(
  "/data/constants/event_types",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.constants.getConstantsEventTypes();
    return response.data;
  }
);
