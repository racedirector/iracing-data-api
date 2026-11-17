#!/usr/bin/env node

import pino from "pino";
import pretty from "pino-pretty";
import { createCli } from "./cli/index.js";

const logger = pino(
  { level: "trace" },
  pretty({
    // Output to stderr to avoid conflicting with the LLM expected output
    destination: 2,
    colorize: process.stderr.isTTY,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
    sync: true,
  }),
);

void createCli({
  logger,
})
  .parseAsync()
  .catch((error: unknown) => {
    logger.error(error instanceof Error ? error.message : "CLI failed.");

    process.exitCode = 1;
  });
