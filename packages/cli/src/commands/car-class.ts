import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addCarClassCommand = (program: Command) =>
  program
    .command("car-class")
    .description("Fetch car class")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
