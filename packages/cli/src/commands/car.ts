import { Command } from "commander";
import notImplementedCommand from "./not-implemented";

export const addCarCommand = (program: Command) =>
  program.command("car").description("Fetch car").action(notImplementedCommand);
