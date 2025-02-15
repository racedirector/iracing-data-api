import { Command } from "commander";
import { Store } from "tough-cookie";

export const addLogoutCommand = (program: Command, store: Store) =>
  program
    .command("logout")
    .description("Clears stored credentials")
    .action(async () => {
      store.removeAllCookies();
    });
