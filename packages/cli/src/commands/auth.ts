import inquirer from "inquirer";
import { hashPassword } from "../util";
import IRacingAPI from "@iracing-data/api";
import { Command } from "commander";

export const addAuthCommand = (program: Command, api: IRacingAPI) =>
  program
    .command("auth")
    .description("Stores credentials for the iRacing API")
    .option("-u, --username <username>", "iRacing username")
    .action(auth(api));

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
