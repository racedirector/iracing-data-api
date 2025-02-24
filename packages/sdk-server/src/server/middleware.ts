import { pinoHttp } from "pino-http";
import { subsystemLogger } from "../logger";

const httpLogger = subsystemLogger("http");

export const loggerMiddleware = pinoHttp({
  logger: httpLogger,
});
