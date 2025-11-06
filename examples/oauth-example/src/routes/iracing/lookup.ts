import { createEndpoint } from "./utils";
import { z } from "zod";

export const countries = createEndpoint(
  "/data/lookup/countries",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return iracing.api.data.lookup.countries();
  }
);

export const flairs = createEndpoint(
  "/data/lookup/flairs",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return iracing.api.data.lookup.flairs();
  }
);

export const licenses = createEndpoint(
  "/data/lookup/licenses",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return iracing.api.data.lookup.licenses();
  }
);

export const drivers = createEndpoint(
  "/data/lookup/drivers",
  {
    method: "GET",
    query: z.object({
      searchTerm: z.string(),
      leagueId: z.number().optional(),
    }),
  },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.lookup.drivers(query);
  }
);

export const getLookup = createEndpoint(
  "/data/lookup/get",
  { method: "GET", query: z.record(z.string(), z.string()) },
  async ({ context: { iracing }, query }) => {
    return iracing.api.data.lookup.get(query);
  }
);
