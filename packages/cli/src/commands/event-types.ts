import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addEventTypesCommand = (program: Command) =>
  program
    .command("event-types")
    .description("Fetch event types")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
