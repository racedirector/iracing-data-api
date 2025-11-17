import fs from "node:fs";
import pino from "pino";
import pretty from "pino-pretty";

const prettyStream = pretty({
  colorize: true,
});

const fileStream = fs.createWriteStream(`${Date.now()}.log`, { flags: "a" });

const stream = pino.multistream([
  /** Only show info or higher in pretty print*/
  { stream: prettyStream, level: "info" },
  /** Show trace and higher in file */
  { stream: fileStream, level: "trace" },
]);

export const logger = pino(
  {
    base: undefined,
    level: "debug",
  },
  stream
);

export default logger;
