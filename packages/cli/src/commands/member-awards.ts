import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addMemberAwardsCommand = (program: Command) =>
  program
    .command("member-awards")
    .description("Fetch member awards")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
