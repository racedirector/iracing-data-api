#!/usr/bin/env node

import pino from "pino";
import pretty from "pino-pretty";
import { createDiagnostics } from "./diagnostics.js";
import { createDisplayWriter } from "./display.js";
import { createProgram } from "./program.js";

// Diagnostics stay on stderr; command documents use metadata-free stdout.
const logger = pino(
  { level: "info" },
  pretty({
    destination: 2,
    colorize: process.stderr.isTTY,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
    sync: true,
  }),
);

const program = createProgram({
  diagnostics: createDiagnostics(logger),
  fetch: globalThis.fetch,
  display: createDisplayWriter(
    pino(
      {
        level: "info",
        base: null,
        timestamp: false,
        formatters: { level: () => ({}) },
        serializers: { err: (value: unknown) => value },
        errorKey: "__cli_error",
        messageKey: "__cli_message",
      },
      {
        write(record) {
          // Pino leaves a leading separator when all record metadata is disabled.
          process.stdout.write(record.replace(/^\{,/, "{"));
        },
      },
    ),
  ),
});

program.parseAsync().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : "CLI failed.");
  process.exitCode = 1;
});
