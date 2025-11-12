import { createEndpoint } from "../utils";

export const trackAssets = createEndpoint(
  "/data/track/assets",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.track.getTrackAssets();
    return response.data;
  }
);

export const getTrack = createEndpoint(
  "/data/track/get",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.track.getTrack();
    return response.data;
  }
);
