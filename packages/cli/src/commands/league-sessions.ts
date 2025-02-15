import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addLeagueSessionsCommand = (program: Command) =>
  program
    .command("league-sessions")
    .description("Fetch league sessions")
    .option("-m, --mine", "Mine")
    .option("-p, --package-id <packageId>", "Package ID", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
