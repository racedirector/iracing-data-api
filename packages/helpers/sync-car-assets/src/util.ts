import { IracingAPIResponse } from "@iracing-data/api-client";
import { access, constants } from "node:fs/promises";

/**
 * Checks if a file exists.
 * @param path the path of the file
 * @returns true if the file exists, false otherwise
 */
export const exists = async (path: string) => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export async function fetchAPIResponseData<T extends unknown>({
  expires,
  link,
}: IracingAPIResponse) {
  const expirationDate = new Date(expires);
  if (expirationDate.getTime() < Date.now()) {
    throw new Error("Data is expired!");
  }

  const data = await fetch(link);
  return (await data.json()) as T;
}
