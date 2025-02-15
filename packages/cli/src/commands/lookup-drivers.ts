import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addLookupDriversCommand = (program: Command) =>
  program
    .command("lookup-drivers <search>")
    .description("Fetch drivers")
    .option("-l, --league-id <leagueId>", "League ID", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
