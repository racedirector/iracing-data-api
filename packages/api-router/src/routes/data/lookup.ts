import { IRacingLookupDriversParametersSchema } from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const countries = createEndpoint(
  "/data/lookup/countries",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.lookup.getLookupCountries();
    return response.data;
  }
);

export const flairs = createEndpoint(
  "/data/lookup/flairs",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.lookup.getLookupFlairs();
    return response.data;
  }
);

export const licenses = createEndpoint(
  "/data/lookup/licenses",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.lookup.getLookupLicenses();
    return response.data;
  }
);

export const drivers = createEndpoint(
  "/data/lookup/drivers",
  {
    method: "GET",
    query: IRacingLookupDriversParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.lookup.getLookupDrivers(query);
    return response.data;
  }
);

export const getLookup = createEndpoint(
  "/data/lookup/get",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing }, query }) => {
    const response = await iracing.lookup.getLookup();
    return response.data;
  }
);
