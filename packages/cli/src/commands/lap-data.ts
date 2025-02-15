import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addLapDataCommand = (program: Command) =>
  program
    .command("lap-data <subsessionId>")
    .description("Fetch lap data")
    .requiredOption("-s, --session-number <sessionNum>", "Session number")
    .option("-c, --cust-id <custId>", "Customer ID", parseInt)
    .option("-t, --team-id <teamId>", "Team ID", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
