import IRacingAPIClient from "@iracing-data/api";
import axios from "axios";
import { createMiddleware } from "better-call";

export const sessionMiddleware = createMiddleware(
  {
    requireHeaders: true,
  },
  async (context) => {
    const accessToken = context.getHeader("X-IRACING-ACCESS-TOKEN");

    return {
      accessToken,
    };
  }
);

/**
 * ???: Should this handle token refreshing?
 */
export const iracingClientMiddleware = createMiddleware(
  {
    use: [sessionMiddleware],
  },
  async ({ context: { accessToken } }) => {
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
  }
);
