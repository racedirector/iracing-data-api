import { createEndpoint } from "../utils";

export const categories = createEndpoint(
  "/data/constants/categories",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.constants.categories();
    return response.data;
  }
);

export const divisions = createEndpoint(
  "/data/constants/divisions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.constants.divisions();
    return response.data;
  }
);

export const eventTypes = createEndpoint(
  "/data/constants/event_types",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.constants.eventTypes();
    return response.data;
  }
);
