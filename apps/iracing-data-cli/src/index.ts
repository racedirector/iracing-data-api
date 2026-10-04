#!/usr/bin/env node

import { createDiagnostics } from "./diagnostics.js";
import { createProgram } from "./program.js";

const diagnostics = createDiagnostics();

createProgram(diagnostics)
  .parseAsync()
  .catch((error: unknown) => {
    diagnostics.error(error instanceof Error ? error.message : "CLI failed.");
    process.exitCode = 1;
  });
