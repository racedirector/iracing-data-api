import { createEndpoint } from "./utils";

export const categories = createEndpoint(
  "/data/constants/categories",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return iracing.api.data.constants.categories();
  }
);

export const divisions = createEndpoint(
  "/data/constants/divisions",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return iracing.api.data.constants.divisions();
  }
);

export const eventTypes = createEndpoint(
  "/data/constants/event_types",
  { method: "GET" },
  async ({ context: { iracing } }) => {
    return iracing.api.data.constants.eventTypes();
  }
);
