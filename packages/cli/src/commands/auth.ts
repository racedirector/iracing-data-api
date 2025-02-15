import inquirer from "inquirer";
import { hashPassword } from "../util";
import IRacingAPI from "@iracing-data/api";

export const auth =
  (api: IRacingAPI) => async (options: { username: string }) => {
    // If we reach here, no cookie was found; prompt the user for credentials.
    const { username = options.username, password } = await inquirer.prompt([
      {
        type: "input",
        name: "username",
        message: "Enter your username:",
        when: () => !options.username,
      },
      {
        type: "password",
        name: "password",
        message: "Enter your password:",
        mask: "*",
      },
    ]);

    const hashedPassword = await hashPassword(username, password);

    console.log(`Authenticating with ${username}...`);
    const result = await api.authenticate(username, hashedPassword);
  };

export default auth;
