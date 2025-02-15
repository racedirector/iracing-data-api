import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addTrackAssetsCommand = (program: Command) =>
  program
    .command("track-assets")
    .description("Fetch track assets")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
