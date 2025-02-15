import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addHostedCommand = (program: Command) =>
  program
    .command("hosted")
    .description("Fetch hosted sessions")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
