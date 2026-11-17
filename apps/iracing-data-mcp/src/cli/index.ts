import { createProgram } from "./commands/index.js";
import type { ProgramOptions } from "./commands/index.js";
import type { Command } from "@commander-js/extra-typings";

/**
 * Options for the CLI.
 */
export type CreateCliOptions = ProgramOptions;

/**
 * Creates the CLI interface for the MCP.
 * @param {CreateCliOptions} options - The options for the CLI.
 * @returns {Command} The command CLI.
 */
export function createCli(options: CreateCliOptions): Command {
  return createProgram(options);
}
