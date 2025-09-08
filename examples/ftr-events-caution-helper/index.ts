import { CarSessionFlagEventEmitter } from "@iracing-data/car-session-flag-events";
import { TelemetryClient } from "@iracing-data/grpc-node";
import { PaceFlagEventEmitter } from "@iracing-data/pace-flag-events";
import { PitLaneEventEmitter } from "@iracing-data/pit-lane-events";
import { SessionFlagEventEmitter } from "@iracing-data/session-flag-events";
import { TelemetryData } from "@iracing-data/telemetry-types";
import { Duration } from "luxon";
import pino from "pino";
import PaceOrderEventEmitter from "./lib/PaceOrderEventEmitter";

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
  ])
  .on("error", (error) => {
    logger.error(error);
  });

const sessionFlagObserver = new SessionFlagEventEmitter()
  .on("startHidden", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Start hidden.");
  })
  .on("startReady", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Start ready.");
  })
  .on("startSet", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Start set.");
  })
  .on("startGo", ({ sessionTime }) => {
    flagLogger.info({ sessionTime }, "Start go.");
  })
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
  .on("checkered", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the checkered flag.`
    );
  })
  .on("white", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the white flag.`
    );
  })
  .on("blue", ({ sessionTime, carIndex }) => {
    flagLogger.info({ sessionTime }, `Car ${carIndex} received the blue flag.`);
  })
  .on("blue:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info({ sessionTime }, `Car ${carIndex} cleared the blue flag.`);
  })
  .on("black", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the black flag.`
    );
  })
  .on("black:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info({ sessionTime }, `Car ${carIndex} cleared the black flag.`);
  })
  .on("servicible", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the servicible flag.`
    );
  })
  .on("servicible:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} cleared the servicible flag.`
    );
  })
  .on("furled", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the furled flag.`
    );
  })
  .on("furled:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} cleared the furled flag.`
    );
  })
  .on("repair", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} received the repair flag.`
    );
  })
  .on("repair:cleared", ({ sessionTime, carIndex }) => {
    flagLogger.info(
      { sessionTime },
      `Car ${carIndex} cleared the repair flag.`
    );
  });

const paceFlagManager = new PaceFlagEventEmitter()
  .on("waveAround", ({ sessionTime, carIndex }) => {
    paceFlagLogger.info(
      { sessionTime, type: "wave-around", carIndex },
      `Car ${carIndex} was waved around.`
    );
  })
  .on("freePass", ({ sessionTime, carIndex }) => {
    paceFlagLogger.info(
      { sessionTime, type: "free-pass", carIndex },
      `Car ${carIndex} was given a free pass.`
    );
  })
  .on("endOfLine", ({ sessionTime, carIndex }) => {
    paceFlagLogger.info(
      { sessionTime, type: "end-of-line", carIndex },
      `Car ${carIndex} was given EOL.`
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
        `${isPaceCar ? "Pace car" : `Car ${carIndex}`} entered ${isPitLaneOpen ? "open" : "closed"} pit lane`
      );
    }
  )
  .on(
    "pitroad:exited",
    ({ sessionTime, carIndex, isPaceCar, isPitLaneOpen }) => {
      pitLaneLogger.info(
        { sessionTime, type: "pit-exit", carIndex },
        `${isPaceCar ? "Pace car" : `Car ${carIndex}`} exited ${isPitLaneOpen ? "open" : "closed"} pit lane`
      );
    }
  );

const paceOrderManager = new PaceOrderEventEmitter()
  .on("lineChange", ({ sessionTime, previousLine, currentLine, carIndex }) => {
    paceOrderLogger.info(
      { sessionTime, previousLine, currentLine, carIndex },
      `Car ${carIndex} line change from ${previousLine} to ${currentLine}`
    );
  })
  .on("rowChange", ({ sessionTime, previousRow, currentRow, carIndex }) => {
    paceOrderLogger.info(
      { sessionTime, previousRow, currentRow, carIndex },
      `Car ${carIndex} row change from ${previousRow} to ${currentRow}`
    );
  });

// Global race state
let numberOfDrivers = -1;
let paceCarIndex = -1;

stream.on("data", (data) => {
  const buffer = JSON.parse(data) as TelemetryData;

  // Parse the JSON data
  const {
    CarIdxOnPitRoad: onPitRoad = [],
    CarIdxPaceFlags: paceFlags = [],
    CarIdxPaceLine: paceLines = [],
    CarIdxPaceRow: paceRows = [],
    CarIdxSessionFlags: flags = [],
    DriverInfo: { PaceCarIdx = -1, Drivers: drivers = [] } = {},
    PitsOpen: isPitLaneOpen = false,
    SessionFlags: sessionFlags = 0x0,
    SessionTime: sessionTime,
  } = buffer;

  if (paceCarIndex !== PaceCarIdx) {
    paceCarIndex = PaceCarIdx;
  }

  // Update timestamps
  const sessionTimeDurationString = Duration.fromObject({
    seconds: sessionTime,
  }).toFormat("hh:mm:ss");

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

  stream.cancel();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("disconnect", shutdown);
