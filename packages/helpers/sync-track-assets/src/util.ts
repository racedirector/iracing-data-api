import assert from "node:assert";
import { access, constants } from "node:fs/promises";

async function getInquirer() {
  try {
    const inquirerPath = require.resolve("inquirer");
    return await import(inquirerPath);
  } catch (_error) {
    return null;
  }
}

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
    usernameProp ?? process.env.IRACING_USERNAME
      ? `${process.env.IRACING_USERNAME}`
      : undefined;

  /**
   * The password from the envrionment variable, or undefined.
   */
  const passwordOption = process.env.IRACING_PASSWORD
    ? `${process.env.IRACING_PASSWORD}`
    : undefined;

  const inquirer = await getInquirer();
  if (inquirer) {
    const { username = usernameOption, password = passwordOption } =
      await inquirer.prompt([
        {
          type: "input",
          name: "username",
          message: "Enter your username:",
          when: () => !usernameOption,
        },
        {
          type: "password",
          name: "password",
          message: "Enter your password:",
          mask: "*",
          when: () => !passwordOption,
        },
      ]);

    assert(
      username && username.length > 0,
      "Could not find username via environment variable (IRACING_USERNAME), please update your env or enter when prompted."
    );
    assert(
      password && password.length > 0,
      "Could not find password via environment variable (IRACING_PASSWORD), please update your env or enter when prompted."
    );

    return { username, password };
  } else {
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
}
