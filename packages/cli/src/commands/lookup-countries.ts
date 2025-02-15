import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addLookupCountriesCommand = (program: Command) =>
  program
    .command("lookup-countries")
    .description("Fetch countries")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
