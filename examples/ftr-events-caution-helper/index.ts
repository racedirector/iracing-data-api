import { TelemetryClient } from "@iracing-data/grpc-node";
import { isCautionWaving, isCaution } from "@iracing-data/telemetry-types";
import { Duration } from "luxon";
import { logger } from "./lib/logger";
import PaceFlagManager from "./lib/PaceFlagManager";
import PitLaneManager from "./lib/PitLaneManager";
import PaceOrderManager from "./lib/PaceOrderManager";

const apiUrl = process.env.API_URL || "localhost:50051";

logger.info(`Connecting telemetry client to ${apiUrl}`);

const client = new TelemetryClient(apiUrl);
const stream = client.subscribeTelemetry(30, [
  "CarIdxOnPitRoad",
  "CarIdxPaceFlags",
  "CarIdxPaceLine",
  "CarIdxPaceRow",
  "CarIdxSessionFlags",
  "DriverInfo",
  "PitsOpen",
  "PlayerCarIdx",
  "SessionFlags",
  "SessionTick",
  "SessionTime",
  "SessionTimeOfDay",
]);

const shutdown = () => {
  stream.cancel();
};

const paceFlagManager = new PaceFlagManager();
const pitLaneManager = new PitLaneManager();
pitLaneManager
  .on("pitlane:opened", ({ sessionTime }) => {
    logger.info(`[${sessionTime}] Pit lane opened`);
  })
  .on("pitlane:closed", ({ sessionTime }) => {
    logger.info(`[${sessionTime}] Pit lane closed`);
  })
  .on(
    "pitroad:entered",
    ({ sessionTime, carIndex, isPaceCar, isPitLaneOpen }) => {
      logger.info(
        `[${sessionTime}] ${isPaceCar ? "Pace car" : `Car ${carIndex}`} entered ${isPitLaneOpen ? "open" : "closed"} pit lane`
      );
    }
  )
  .on(
    "pitroad:exited",
    ({ sessionTime, carIndex, isPaceCar, isPitLaneOpen }) => {
      logger.info(
        `[${sessionTime}] ${isPaceCar ? "Pace car" : `Car ${carIndex}`} exited ${isPitLaneOpen ? "open" : "closed"} pit lane`
      );
    }
  );

const paceOrderManager = new PaceOrderManager();

// Global race state
let numberOfDrivers = -1;
let paceCarIndex = -1;
let previousSessionFlags = 0x0;

stream.on("data", (data) => {
  const buffer = JSON.parse(data);

  // Parse the JSON data
  const {
    CarIdxOnPitRoad: onPitRoad,
    CarIdxPaceFlags: paceFlags,
    CarIdxPaceLine: paceLines,
    CarIdxPaceRow: paceRows,
    CarIdxSessionFlags: flags = [],
    DriverInfo: { PaceCarIdx = -1, Drivers: drivers = [] } = {},
    PitsOpen: isPitLaneOpen,
    PlayerCarIdx: playerCarIndex,
    SessionFlags: sessionFlags,
    SessionTime: sessionTime,
    SessionTimeOfDay: sessionTimeOfDay,
  } = buffer;

  if (paceCarIndex !== PaceCarIdx) {
    paceCarIndex = PaceCarIdx;
  }

  // Update timestamps
  const sessionTimeDurationString = Duration.fromObject({
    seconds: sessionTime,
  }).toFormat("hh:mm:ss");

  const timeOfDayString = Duration.fromObject({
    seconds: sessionTimeOfDay,
  }).toFormat("hh:mm:ss");

  const logContext = {
    sessionTime: sessionTimeDurationString,
    timeOfDay: timeOfDayString,
  };

  if (numberOfDrivers !== drivers.length) {
    numberOfDrivers = drivers.length;
    logger.info(
      {
        numberOfDrivers,
        ...logContext,
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
    sessionTimeOfDay,
    numberOfDrivers
  );

  // Process pace flag events
  paceFlagManager.process(
    paceFlags,
    sessionTimeDurationString,
    sessionTimeOfDay,
    numberOfDrivers
  );

  // Process pace order events
  paceOrderManager.process(
    paceLines,
    paceRows,
    sessionTimeDurationString,
    timeOfDayString,
    numberOfDrivers
  );

  if (sessionFlags !== previousSessionFlags) {
    if (isCautionWaving(sessionFlags)) {
      logger.info(logContext, "Caution is waving!");
    }

    if (isCaution(sessionFlags)) {
      logger.info(logContext, "Caution is shown!");
    }

    previousSessionFlags = sessionFlags;
  }
});

stream.on("error", (error) => {
  logger.error(error);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("disconnect", shutdown);
