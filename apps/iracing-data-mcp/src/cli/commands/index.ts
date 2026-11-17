import { Command } from "@commander-js/extra-typings";
import { createServeCommand } from "./serve/index.js";
import type pino from "pino";

/**
 * Options for customizing program behavior.
 */
export interface ProgramOptions {
  /** Parent logger instance. */
  logger: pino.Logger;
}

/**
 * Creates a commander program.
 * @param {ProgramOptions} options - Options for program and commands.
 * @returns {Command} A commander program for the MCP interface.
 */
export function createProgram(options: ProgramOptions): Command {
  const program = new Command("iracing-data-mcp");

  program.addCommand(
    createServeCommand({
      logger: options.logger.child({ command: "serve" }),
    }),
  );

  return program;
}
