import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addSeriesCommand = (program: Command) =>
  program
    .command("series")
    .description("Fetch series")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
