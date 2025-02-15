import IRacingAPI from "@iracing-data/api";
import { Command } from "commander";
import { handleOutput } from "../util";

export const addDriverStatsCommand = (program: Command, api: IRacingAPI) =>
  program
    .command("driver-stats <category>")
    .description("Fetch driver stats for a specific category")
    .option("-o, --output <path>", "Output path")
    .action(driverStats(api));

export const driverStats = (api: IRacingAPI) => async (category) => {
  const driverStats = await api.getDriverStatsByCategory(category);
  handleOutput(driverStats);
};

export default driverStats;
