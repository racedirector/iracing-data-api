import { IRacingLookupDriversParametersSchema } from "@iracing-data/api-schema";
import { createEndpoint } from "../utils";

export const countries = createEndpoint(
  "/data/lookup/countries",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.lookup.getLookupCountries();
  },
);

export const flairs = createEndpoint(
  "/data/lookup/flairs",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.lookup.getLookupFlairs();
  },
);

export const licenses = createEndpoint(
  "/data/lookup/licenses",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.lookup.getLookupLicenses();
  },
);

export const drivers = createEndpoint(
  "/data/lookup/drivers",
  {
    method: "GET",
    query: IRacingLookupDriversParametersSchema,
  },
  async ({ context: { iracing }, query }) => {
    return await iracing.lookup.getLookupDrivers(query);
  },
);

export const getLookup = createEndpoint(
  "/data/lookup/get",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    return await iracing.lookup.getLookup();
  },
);
