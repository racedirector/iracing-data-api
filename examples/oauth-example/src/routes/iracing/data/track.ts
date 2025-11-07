import { createEndpoint } from "../utils";

export const trackAssets = createEndpoint(
  "/data/track/assets",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.track.assets();
    return response.data;
  }
);

export const getTrack = createEndpoint(
  "/data/track/get",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.api.data.track.get();
    return response.data;
  }
);
