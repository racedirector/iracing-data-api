import { IRacingAPIClient } from "@iracing-data/api";
import axios from "axios";
import {
  createEndpoint as createEndpointFn,
  createMiddleware,
} from "better-call";

export const iracingClientMiddleware = createMiddleware(async (context) => {
  const accessToken =
    context.getHeader("X-IRACING-ACCESS-TOKEN") ||
    context.getCookie("iracing-token");

  const network = axios.create({
    baseURL: "https://members-ng.iracing.com/",
  });

  network.interceptors.request.use((config) => {
    /**
     * Only sign requests if an access token is provided
     */
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  const iracing = new IRacingAPIClient(network);

  return {
    iracing,
  };
});

export const createEndpoint = createEndpointFn.create({
  use: [iracingClientMiddleware],
});
