import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addMemberCareerStatsCommand = (program: Command) =>
  program
    .command("member-career-stats")
    .description("Fetch member career stats")
    .option("-c, --cust-id <custId>", "Customer ID", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
