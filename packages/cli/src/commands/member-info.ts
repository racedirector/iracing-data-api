import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addMemberInfoCommand = (program: Command) =>
  program
    .command("member-info")
    .description("Fetch member info")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
