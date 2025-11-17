import { createEndpoint } from "../utils";

export const trackAssets = createEndpoint(
  "/data/track/assets",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.track.getTrackAssets();
  }
);

export const getTrack = createEndpoint(
  "/data/track/get",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    return await iracing.track.getTrack();
  }
);
