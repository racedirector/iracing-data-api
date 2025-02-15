import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addCarAssetsCommand = (program: Command) =>
  program
    .command("car-assets")
    .description("Fetch car assets")
    .action(notImplementedCommand);
