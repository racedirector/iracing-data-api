import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addSeasonDriverStandingsCommand = (program: Command) =>
  program
    .command("season-driver-standings")
    .description("Fetch season driver standings")
    .requiredOption("-s, --season-id <seasonId>", "Season ID")
    .requiredOption("-c, --car-class-id <carClassId>", "Car class ID")
    .option("-C, --club-id <clubId>", "Club ID", parseInt)
    .option("-d, --division <division>", "Division")
    .option("-w, --race-week-num <raceWeekNum>", "Race week number")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
