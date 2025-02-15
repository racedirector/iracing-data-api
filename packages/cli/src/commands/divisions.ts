import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addDivisionsCommand = (program: Command) =>
  program
    .command("divisions")
    .description("Fetch divisions")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
