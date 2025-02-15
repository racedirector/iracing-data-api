import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addLeagueRosterCommand = (program: Command) =>
  program
    .command("league-roster")
    .description("Fetch league roster")
    .option("-l, --include-licenses", "Include licenses")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
