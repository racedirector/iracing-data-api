import { IRacingAPIClient } from "@iracing-data/api";
import axios from "axios";
import {
  createEndpoint as createEndpointFn,
  createMiddleware,
} from "better-call";

export const iracingSessionMiddleware = createMiddleware(async (context) => {
  return {
    iracingSession: context.getCookie("iracing-token"),
  };
});

export const iracingClientMiddleware = createMiddleware(async (context) => {
  const { iracingSession } = context.context;
  const network = axios.create({
    baseURL: "https://members-ng.iracing.com/",
  });

  network.interceptors.request.use((config) => {
    /**
     * Only sign requests if an access token is provided
     */
    if (iracingSession) {
      config.headers.Authorization = `Bearer ${iracingSession}`;
    }

    return config;
  });

  const iracing = new IRacingAPIClient(network);

  return {
    iracing,
  };
});

export const createEndpoint = createEndpointFn.create({
  use: [iracingSessionMiddleware, iracingClientMiddleware],
});
