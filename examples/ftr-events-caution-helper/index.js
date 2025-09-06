/* eslint-env node */
import { TelemetryClient } from "@iracing-data/grpc-node";
import { DateTime, Duration } from "luxon";

export const isEndOfLine = (flags) => !!(flags & 1);
export const isFreePass = (flags) => !!(flags & 2);
export const isWavedAround = (flags) => !!(flags & 4);

const main = async () => {
  const apiUrl = process.env.API_URL || "localhost:50051";

  const client = new TelemetryClient(apiUrl);

  const shutdown = () => {
    stream.cancel();
  };

  const stream = await client.subscribeTelemetry(30, [
    "CarIdxOnPitRoad",
    "CarIdxPaceFlags",
    "CarIdxPaceLine",
    "CarIdxPaceRow",
    "CarIdxSessionFlags",
    "PitsOpen",
    "PlayerCarIdx",
    "SessionFlags",
    "SessionTick",
    "SessionTime",
    "SessionTimeOfDay",
  ]);

  let previousPlayerPaceFlags = 0x0;
  let previousIsPlayerOnPitRoad = false;
  let previousIsPitLaneOpen = false;
  let previousPlayerPaceLine = -1;
  let previousPlayerPaceRow = -1;
  let previousSessionFlags = 0x0;
  let previousPlayerSessionFlags = 0x0;
  let previousPaceLines = [];
  let previousPaceRows = [];

  stream.on("data", (data) => {
    // Parse the JSON data
    const {
      CarIdxOnPitRoad: onPitRoad,
      CarIdxPaceFlags: paceFlags,
      CarIdxPaceLine: paceLines,
      CarIdxPaceRow: paceRows,
      CarIdxSessionFlags: flags,
      PitsOpen: isPitLaneOpen,
      PlayerCarIdx: playerCarIndex,
      SessionFlags: sessionFlags,
      SessionTick: sessionTick,
      SessionTime: sessionTime,
      SessionTimeOfDay: sessionTimeOfDay,
    } = JSON.parse(data);

    // Establish player state
    const playerPaceFlags = paceFlags[playerCarIndex];
    const isPlayerOnPitRoad = onPitRoad[playerCarIndex];
    const playerSessionFlags = flags[playerCarIndex];

    // Update timestamps
    const sessionTimeDurationString = Duration.fromMillis(
      sessionTime * 1000
    ).toFormat("hh:mm:ss");

    const timeOfDayString = Duration.fromObject({
      seconds: sessionTimeOfDay,
    }).toFormat("hh:mm:ss");

    if (playerSessionFlags !== previousPlayerSessionFlags) {
      previousPlayerSessionFlags = playerSessionFlags;
    }

    if (sessionFlags !== previousSessionFlags) {
      previousSessionFlags = sessionFlags;
    }

    // If the pit lane opened or closed, log
    if (isPitLaneOpen !== previousIsPitLaneOpen) {
      console.log(
        `(${timeOfDayString}): Pit lane ${isPitLaneOpen ? "opened" : "closed"} at ${sessionTimeDurationString}`
      );

      previousIsPitLaneOpen = isPitLaneOpen;
    }

    // If the player pace flags changed, log
    if (playerPaceFlags !== previousPlayerPaceFlags) {
      if (isEndOfLine(playerPaceFlags)) {
        console.log(
          `(${timeOfDayString}): Player received EOL at ${sessionTimeDurationString}`
        );
      }

      if (isFreePass(playerPaceFlags)) {
        console.log(
          `(${timeOfDayString}): Player received Free Pass at ${sessionTimeDurationString}`
        );
      }

      if (isWavedAround(playerPaceFlags)) {
        console.log(
          `(${timeOfDayString}): Player received Wave Around at ${sessionTimeDurationString}`
        );
      }

      if (playerPaceFlags === 0x0) {
        console.log(
          `(${timeOfDayString}): Player cleared pace flags at ${sessionTimeDurationString}`
        );
      }

      previousPlayerPaceFlags = playerPaceFlags;
    }

    // If the player entered/exited pit road, log
    if (isPlayerOnPitRoad !== previousIsPlayerOnPitRoad) {
      console.log(
        `(${timeOfDayString}): Player ${isPlayerOnPitRoad ? "entered" : "exited"} ${isPitLaneOpen ? "open" : "closed"} pit road at ${sessionTimeDurationString}`
      );

      previousIsPlayerOnPitRoad = isPlayerOnPitRoad;
    }

    const didPaceOrderChange =
      previousPaceLines !== paceLines || previousPaceRows !== paceRows;
    if (didPaceOrderChange) {
      const playerPaceRow = paceRows[playerCarIndex];
      const playerPaceLine = paceLines[playerCarIndex];
      // If the player's pace position changed, log
      const didPaceLineChange = playerPaceLine !== previousPlayerPaceLine;
      const didPaceRowChange = playerPaceRow !== previousPlayerPaceRow;

      if (didPaceLineChange || didPaceRowChange) {
        console.log(
          `(${timeOfDayString}): Player pace position has changed. Player should be in line ${playerPaceLine} and row ${playerPaceRow}`
        );

        if (didPaceLineChange) {
          previousPlayerPaceLine = playerPaceLine;
        }

        if (didPaceRowChange) {
          previousPlayerPaceRow = playerPaceRow;
        }
      }
    }
  });

  // const response = await client.dumpTelemetry();
  // const telemetry = JSON.parse(response.telemetry);

  // console.info("Telemetry data:", telemetry);

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("disconnect", shutdown);
};

main();
