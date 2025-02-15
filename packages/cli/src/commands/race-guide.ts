import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addRaceGuideCommand = (program: Command) =>
  program
    .command("race-guide")
    .description("Fetch race guid")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
