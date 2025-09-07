import Logger from "pino";

export const logger = Logger({
  name: "Pace helper",
  level: "debug",
  transport: {
    targets: [{ target: "pino-pretty", options: { colorize: true } }],
  },
});
