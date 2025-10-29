import crypto from "node:crypto";
import axios, { AxiosInstance } from "axios";
import { Cookie } from "tough-cookie";
import { IRacingAPIResponse } from "./api/types";
import { CacheExpiredError, InvalidResponseData } from "./types";

/**
 * Compute the Base64‑encoded SHA‑256 hash of (password + email.toLowerCase()).
 */
export async function hashPassword(email: string, password: string) {
  return crypto
    .createHash("sha256")
    .update(password + email.toLowerCase())
    .digest("base64");
}

export const allCookiesValid = (cookies: Cookie[]) =>
  cookies.every((cookie) => cookie.TTL() > 0);

export async function fetchValidLinkData<T>(
  response: IRacingAPIResponse,
  client: AxiosInstance = axios
) {
  if (!response || !response.link || !response.expires) {
    throw new InvalidResponseData();
  }

  const expirationDate = new Date(response.expires);
  const now = new Date();

  if (expirationDate < now) {
    throw new CacheExpiredError();
  }

  const data = await client.get<T>(response.link, {
    responseType: "json",
  });

  return data.data;
}
