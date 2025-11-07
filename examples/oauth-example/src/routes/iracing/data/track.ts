import { createEndpoint } from "../utils";

export const trackAssets = createEndpoint(
  "/data/track/assets",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    return iracing.api.data.track.assets();
  }
);

export const getTrack = createEndpoint(
  "/data/track/get",
  {
    method: "GET",
    requireHeaders: true,
  },
  async ({ context: { iracing } }) => {
    return iracing.api.data.track.get();
  }
);
