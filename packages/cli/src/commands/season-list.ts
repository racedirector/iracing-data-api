import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addSeasonListCommand = (program: Command) =>
  program
    .command("season-list <seasonYear> <seasonQuarter>")
    .description("Fetch season list")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
