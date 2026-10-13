// logger.ts

import pino, { type LoggerOptions } from "pino";

export type LogFields = Record<string, unknown>;

export interface AppLogger {
  trace(message: string, fields?: LogFields): void;
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  fatal(message: string, fields?: LogFields): void;

  child(bindings: LogFields): AppLogger;
}

export function createNoopLogger(): AppLogger {
  const logger: AppLogger = {
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
    child: () => logger,
  };

  return logger;
}

export function createPinoLogger(options: LoggerOptions = {}): AppLogger {
  return fromPinoLogger(pino(options, pino.destination(2)));
}

function fromPinoLogger(logger: pino.Logger): AppLogger {
  return {
    trace(message, fields) {
      logger.trace(fields, message);
    },

    debug(message, fields) {
      logger.debug(fields, message);
    },

    info(message, fields) {
      logger.info(fields, message);
    },

    warn(message, fields) {
      logger.warn(fields, message);
    },

    error(message, fields) {
      logger.error(fields, message);
    },

    fatal(message, fields) {
      logger.fatal(fields, message);
    },

    child(bindings) {
      return fromPinoLogger(logger.child(bindings));
    },
  };
}

export function createConsoleLogger(): AppLogger {
  return fromConsoleLogger({});
}

function fromConsoleLogger(bindings: LogFields): AppLogger {
  const fields = (additional?: LogFields): LogFields | undefined => {
    if (!additional && Object.keys(bindings).length === 0) {
      return undefined;
    }

    return {
      ...bindings,
      ...additional,
    };
  };

  return {
    trace(message, additional) {
      logToConsole(console.debug, message, fields(additional));
    },

    debug(message, additional) {
      logToConsole(console.debug, message, fields(additional));
    },

    info(message, additional) {
      logToConsole(console.info, message, fields(additional));
    },

    warn(message, additional) {
      logToConsole(console.warn, message, fields(additional));
    },

    error(message, additional) {
      logToConsole(console.error, message, fields(additional));
    },

    fatal(message, additional) {
      logToConsole(console.error, message, fields(additional));
    },

    child(additionalBindings) {
      return fromConsoleLogger({
        ...bindings,
        ...additionalBindings,
      });
    },
  };
}

function logToConsole(
  log: (...args: unknown[]) => void,
  message: string,
  fields?: LogFields,
): void {
  if (fields) {
    log(message, fields);

    return;
  }

  log(message);
}
