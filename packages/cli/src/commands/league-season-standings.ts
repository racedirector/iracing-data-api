import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addLeagueSeasonStandingsCommand = (program: Command) =>
  program
    .command("league-season-standings <leagueId> <seasonId>")
    .description("Fetch league season standings")
    .option("-c, --car-class-id <carClassId>", "Car class ID", parseInt)
    .option("-C, --car-id <carId>", "Car ID", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
