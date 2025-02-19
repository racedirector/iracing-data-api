import { Cookie } from "tough-cookie";
import {
  CacheExpiredError,
  InvalidResponseData,
  IRacingAPIResponse,
} from "./types";
import axios, { AxiosInstance } from "axios";

export const allCookiesValid = (cookies: Cookie[]) =>
  cookies.every((cookie) => cookie.TTL() > 0);

export const fetchValidLinkData = async (
  response: IRacingAPIResponse,
  client: AxiosInstance = axios
) => {
  if (!response || !response.link || !response.expires) {
    throw new InvalidResponseData();
  }

  const expirationDate = new Date(response.expires);
  const now = new Date();

  if (expirationDate < now) {
    throw new CacheExpiredError();
  }

  const data = await client.get<Record<string, any>>(response.link, {
    responseType: "json",
  });

  return data.data;
};
