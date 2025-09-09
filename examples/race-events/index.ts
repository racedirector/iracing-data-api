import { CarSessionFlagEventEmitter } from "@iracing-data/car-session-flag-events";
import { TelemetryClient } from "@iracing-data/grpc-node";
import { PaceFlagEventEmitter } from "@iracing-data/pace-flag-events";
import { PitLaneEventEmitter } from "@iracing-data/pit-lane-events";
import { SessionFlagEventEmitter } from "@iracing-data/session-flag-events";
import { Session, TelemetryData } from "@iracing-data/telemetry-types";
import _ from "lodash";
import { Duration } from "luxon";
import pino from "pino";
import PaceOrderEventEmitter from "./lib/PaceOrderEventEmitter";
import PaceOrderFormatter from "./lib/PaceOrderFormatter";

const apiUrl = process.env.API_URL || "localhost:50051";

const logger = pino({
  level: "debug",
  transport: {
    targets: [
      { target: "pino-pretty", options: { colorize: true } },
      {
        target: "pino/file",
        options: {
          destination: `${new Date().getTime()}.log`,
        },
      },
    ],
  },
});

logger.info(`Connecting telemetry client to ${apiUrl}`);
const flagLogger = logger.child({ service: "flag" });
const paceFlagLogger = logger.child({ service: "pace-flag" });
const paceOrderLogger = logger.child({ service: "pace-order" });
const pitLaneLogger = logger.child({ service: "pit-lane" });

// Global state
let numberOfDrivers = -1;
let paceCarIndex = -1;
let isTeamRacing: boolean = false;
let cachedDrivers: Session["DriverInfo"]["Drivers"] = [];

function driverForIndex(carIndex: number) {
  return cachedDrivers[carIndex];
}

function carIdentifierForIndex(carIndex: number) {
  const currentDriver = driverForIndex(carIndex);
  return [
    `#${currentDriver.CarNumber}`,
    isTeamRacing ? currentDriver.TeamName : undefined,
    currentDriver.UserName,
  ]
    .filter(Boolean)
    .join(", ");
}

const sessionFlagObserver = new SessionFlagEventEmitter()
  .on("oneToGreen", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "One to green.");
  })
  .on("greenHeld", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Green held.");
  })
  .on("randomWaving", ({ sessionTime }) => {
    flagLogger.info(
      { sessionTime },
      "Barney is the little kid in the background going crazy (random waving)."
    );
  })
  .on("green", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Green, green, green.");
  })
  .on("caution", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Caution is shown.");
  })
  .on("cautionWaving", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Caution is waving.");
  })
  .on("tenToGo", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Ten to go.");
  })
  .on("fiveToGo", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Five to go.");
  })
  .on("white", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "White flag, one to go.");
  })
  .on("checkered", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Checkered flag.");
  });

const carFlagObserver = new CarSessionFlagEventEmitter()
  .on("blue:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) cleared the blue flag.`
    );
  })
  .on("black", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) received the black flag.`
    );
  })
  .on("black:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) cleared the black flag.`
    );
  })
  .on("furled", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) received the furled flag.`
    );
  })
  .on("furled:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) cleared the furled flag.`
    );
  })
  .on("repair", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) received the repair flag.`
    );
  })
  .on("repair:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) cleared the repair flag.`
    );
  });

const paceFlagManager = new PaceFlagEventEmitter()
  .on("waveAround", ({ sessionTime, carIndex }) => {
    paceFlagLogger.info(
      { sessionTime, type: "wave-around", carIndex },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) was waved around.`
    );
  })
  .on("freePass", ({ sessionTime, carIndex }) => {
    paceFlagLogger.info(
      { sessionTime, type: "free-pass", carIndex },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) was given a free pass.`
    );
  })
  .on("endOfLine", ({ sessionTime, carIndex }) => {
    paceFlagLogger.info(
      { sessionTime, type: "end-of-line", carIndex },
      `Car ${carIndex} (${carIdentifierForIndex(carIndex)}) was given EOL.`
    );
  });

const pitLaneManager = new PitLaneEventEmitter()
  .on("pitlane:opened", ({ sessionTime }) => {
    pitLaneLogger.info({ sessionTime, type: "pit-open" }, "Pit lane opened");
  })
  .on("pitlane:closed", ({ sessionTime }) => {
    pitLaneLogger.info({ sessionTime, type: "pit-close" }, "Pit lane closed");
  })
  .on(
    "pitroad:entered",
    ({ sessionTime, carIndex, isPaceCar, isPitLaneOpen }) => {
      pitLaneLogger.info(
        { sessionTime, type: "pit-entry", carIndex },
        `${isPaceCar ? "Pace car" : `Car ${carIndex} (${carIdentifierForIndex(carIndex)})`} entered ${isPitLaneOpen ? "open" : "closed"} pit lane`
      );
    }
  )
  .on(
    "pitroad:exited",
    ({ sessionTime, carIndex, isPaceCar, isPitLaneOpen }) => {
      pitLaneLogger.info(
        { sessionTime, type: "pit-exit", carIndex },
        `${isPaceCar ? "Pace car" : `Car ${carIndex} (${carIdentifierForIndex(carIndex)})`} exited ${isPitLaneOpen ? "open" : "closed"} pit lane`
      );
    }
  );

const paceOrderFormatter = new PaceOrderFormatter().on("update", () => {
  const paceOrderTable = paceOrderFormatter.formatPaceOrderTable();
  const unassignedTable = paceOrderFormatter.formatUnassignedTable();

  // Log the table JSON to the log file
  paceOrderLogger.info({
    paceOrderTable: paceOrderTable.toJSON(),
    unassignedTable: unassignedTable.toJSON(),
    type: "pace-order-table",
  });

  // Log the table as a visual to stdout
  console.log(
    `Pace order:\n\n\n${paceOrderTable.toString()}\n${unassignedTable.toString()}`
  );
});

const paceOrderManager = new PaceOrderEventEmitter().on(
  "change",
  ({ currentLines, currentRows, paceMode }) => {
    paceOrderFormatter.update(
      currentRows,
      currentLines,
      cachedDrivers,
      paceMode,
      isTeamRacing
    );
  }
);

const client = new TelemetryClient(apiUrl);
const stream = client
  .subscribeTelemetry(30, [
    "CarIdxOnPitRoad",
    "CarIdxPaceFlags",
    "CarIdxPaceLine",
    "CarIdxPaceRow",
    "CarIdxSessionFlags",
    "DriverInfo",
    "PaceMode",
    "PitsOpen",
    "PlayerCarIdx",
    "SessionFlags",
    "SessionTick",
    "SessionTime",
    "WeekendInfo",
  ])
  .on("error", (error) => {
    logger.error(error);
  })
  .on("close", () => {
    logger.info(`Connection to ${apiUrl} closed.`);
  })
  .on("metadata", (meta) => {
    logger.debug(meta, "Received metadata.");
  })
  .on("status", (status) => {
    logger.debug(status);
  })
  .on("data", (data) => {
    // Parse the JSON data
    const {
      CarIdxOnPitRoad: onPitRoad = [],
      CarIdxPaceFlags: paceFlags = [],
      CarIdxPaceLine: paceLines = [],
      CarIdxPaceRow: paceRows = [],
      CarIdxSessionFlags: flags = [],
      DriverInfo: { PaceCarIdx = -1, Drivers: drivers = [] } = {},
      PaceMode: paceMode = 4, // Isolated modules enabled, use the raw value.
      PitsOpen: isPitLaneOpen = false,
      SessionFlags: sessionFlags = 0x0,
      SessionTime: sessionTime,
      WeekendInfo: { TeamRacing: teamRacingRaw } = {},
    } = JSON.parse(data) as TelemetryData;

    if (paceCarIndex !== PaceCarIdx) {
      paceCarIndex = PaceCarIdx;
    }

    if (teamRacingRaw) {
      isTeamRacing = Boolean(teamRacingRaw);
    }

    // Update timestamps
    const sessionTimeDurationString = Duration.fromObject({
      seconds: sessionTime,
    }).toFormat("hh:mm:ss");

    if (!_.isEqual(cachedDrivers, drivers)) {
      if (numberOfDrivers !== drivers.length) {
        numberOfDrivers = drivers.length;
        logger.info(
          {
            numberOfDrivers,
            sessionTime: sessionTimeDurationString,
          },
          "Number of drivers update"
        );
      }

      cachedDrivers = drivers;
    }

    // Process pit events
    pitLaneManager.process(
      isPitLaneOpen,
      onPitRoad,
      paceCarIndex,
      sessionTimeDurationString,
      numberOfDrivers
    );

    // Process pace flag events
    paceFlagManager.process(
      paceFlags,
      sessionTimeDurationString,
      numberOfDrivers
    );

    // Process pace order events
    paceOrderManager.process(
      paceLines,
      paceRows,
      paceMode,
      sessionTimeDurationString,
      numberOfDrivers
    );

    sessionFlagObserver.process(sessionFlags, sessionTimeDurationString);
    carFlagObserver.process(flags, sessionTimeDurationString, numberOfDrivers);
  });

const shutdown = () => {
  sessionFlagObserver.removeAllListeners();
  carFlagObserver.removeAllListeners();
  pitLaneManager.removeAllListeners();
  paceFlagManager.removeAllListeners();
  paceOrderManager.removeAllListeners();
  paceOrderFormatter.removeAllListeners();

  stream.cancel();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("disconnect", shutdown);
