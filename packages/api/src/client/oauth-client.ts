import { IRACING_DATA_API_URL } from "@/constants";
import { Store } from "@/types/store";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import IRacingAPIClient from "./client";

type SessionStore = Store<string, string>;

function isTokenExpired(token) {
  return false;
}

function signRequest(sessionStore: SessionStore) {
  return async (config: InternalAxiosRequestConfig) => {
    // Don't sign requests not to the data API
    if (config.url !== IRACING_DATA_API_URL) {
      return config;
    }

    const accessToken = await sessionStore.get("access_token");

    if (isTokenExpired(undefined)) {
      // TODO: If token is expired, refresh it.
    }

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  };
}

export interface IRacingAPIOAuthClientOptions {
  client?: AxiosInstance;
  sessionStore: SessionStore;
}

export class IRacingAPIOAuthClient extends IRacingAPIClient {
  constructor(options: IRacingAPIOAuthClientOptions) {
    const {
      client = axios.create({
        baseURL: IRACING_DATA_API_URL,
      }),
      sessionStore,
    } = options;

    client.interceptors.request.use(signRequest(sessionStore));

    super(client);
  }
}
