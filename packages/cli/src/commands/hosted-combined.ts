import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addHostedCombinedCommand = (program: Command) =>
  program
    .command("hosted-combined")
    .description("Fetch hosted combined sessions")
    .option("-p, --package-id <packageId>", "Package ID", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
