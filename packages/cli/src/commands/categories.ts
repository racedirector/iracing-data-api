import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addCategoriesCommand = (program: Command) =>
  program
    .command("categories")
    .description("Fetch categories")
    .option("-o, --output <path>", "Output path")
    .action(notImplementedCommand);
