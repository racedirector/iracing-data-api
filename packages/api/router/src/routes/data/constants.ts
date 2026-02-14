import { createEndpoint } from "../utils";

export const categories = createEndpoint(
  "/data/constants/categories",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.constants.getConstantsCategories();
  },
);

export const divisions = createEndpoint(
  "/data/constants/divisions",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.constants.getConstantsDivisions();
  },
);

export const eventTypes = createEndpoint(
  "/data/constants/event_types",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.constants.getConstantsEventTypes();
  },
);
