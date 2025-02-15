import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addSeriesPastSeasonsCommand = (program: Command) =>
  program
    .command("series-past-seasons <seriesId>")
    .description("Fetch series past seasons")
    .action(notImplementedCommand);
