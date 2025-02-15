import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addLeagueDirectoryCommand = (program: Command) =>
  program
    .command("league-directory")
    .description("Fetch league directory")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
