import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addTrackInfoCommand = (program: Command) =>
  program
    .command("track-info")
    .description("Fetch track info")
    .action(notImplementedCommand);
