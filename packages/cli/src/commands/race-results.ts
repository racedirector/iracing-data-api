import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addRaceResultsCommand = (program: Command) =>
  program
    .command("race-results <subsessionId>")
    .description("Get results for a subsession.")
    .option("-l, --include-licenses", "Include licenses")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
