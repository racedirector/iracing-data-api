import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addLeagueSeasonsCommand = (program: Command) =>
  program
    .command("league-seasons <leagueId>")
    .description("Fetch league seasons")
    .option("-r, --retired", "Retired")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
