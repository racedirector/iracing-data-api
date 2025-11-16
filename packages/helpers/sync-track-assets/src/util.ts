import { IracingAPIResponse } from "@iracing-data/api-client";
import assert from "node:assert";
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

/**
 * Attempts to read credentials from the environment variables. If not provided,
 * prompts the user to enter them.
 * @returns The parsed credentials.
 */
export async function getIRacingCredentials(usernameProp?: string) {
  /**
   * The provided username, or the username from the environment variable, or undefined.
   */
  const usernameOption =
    (usernameProp ?? process.env.IRACING_USERNAME)
      ? `${usernameProp ?? process.env.IRACING_USERNAME}`
      : undefined;

  /**
   * The password from the envrionment variable, or undefined.
   */
  const passwordOption = process.env.IRACING_PASSWORD
    ? `${process.env.IRACING_PASSWORD}`
    : undefined;

  assert(
    usernameOption && usernameOption.length > 0,
    "Please provide username via environment variable (IRACING_USERNAME)."
  );
  assert(
    passwordOption && passwordOption.length > 0,
    "Please provider password via environment variable (IRACING_PASSWORD)."
  );

  return { username: usernameOption, password: passwordOption };
}

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
