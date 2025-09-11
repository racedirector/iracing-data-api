import { TelemetryClient } from "@iracing-data/grpc-node";
import { TelemetryData, TrackLocation } from "@iracing-data/telemetry-types";
import _ from "lodash";
import { Duration } from "luxon";
import pino from "pino";
import { PlayerPitStopEventEmitter } from "@iracing-data/player-pit-stop-events";
import {
  servicesForFlags,
  stringForPitServiceStatus,
  updateServices,
} from "./utils";

const apiUrl = process.env.API_URL || "localhost:50051";

const logger = pino({
  base: undefined,
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

const playerPitStopEventEmitter = new PlayerPitStopEventEmitter()
  .on("pitroad:entered", ({ sessionTime, isPitLaneOpen }) => {
    logger.info(
      { sessionTime, type: "pit-road-enter" },
      `Player entered ${isPitLaneOpen ? "open" : "closed"} pit road`
    );
  })
  .on("pitroad:exited", ({ sessionTime, isPitLaneOpen }) => {
    logger.info(
      { sessionTime, type: "pit-road-exit" },
      `Player exited ${isPitLaneOpen ? "open" : "closed"} pit road`
    );
  })
  .on("pitstall:entered", ({ sessionTime, trackLocation }) => {
    logger.info(
      {
        sessionTime,
        type: "pit-stall-enter",
        trackLocation,
      },
      "Player entered their pit stall."
    );
  })
  .on("pitstall:exited", ({ sessionTime, trackLocation }) => {
    logger.info(
      {
        sessionTime,
        type: "pit-stall-exit",
        trackLocation,
      },
      "Player exited their pit stall."
    );
  })
  .on(
    "service:update",
    ({
      sessionTime,
      previousServiceFlags,
      currentServiceFlags,
      isPitstopActive,
    }) => {
      const { added, removed } = updateServices(
        previousServiceFlags,
        currentServiceFlags
      );

      if (isPitstopActive) {
        // If the pit stop is active and there are added services,
        if (added.length) {
          logger.info(
            {
              sessionTime,
              isPitstopActive,
              previousServiceFlags,
              currentServiceFlags,
              requested: added,
            },
            "Service request update during active stop."
          );
        }

        logger.info(
          {
            sessionTime,
            isPitstopActive,
            previousServiceFlags,
            currentServiceFlags,
            started: removed,
            remaining: servicesForFlags(currentServiceFlags),
          },
          "Service started"
        );
      } else {
        logger.info(
          {
            sessionTime,
            isPitstopActive,
            previousServiceFlags,
            currentServiceFlags,
            requested: added,
            unrequested: removed,
          },
          "Service request update"
        );
      }
    }
  )
  .on(
    "service:change",
    ({ sessionTime, previousServiceStatus, currentServiceStatus }) => {
      logger.info(
        {
          sessionTime,
          type: "service-change",
          previousServiceStatus,
          currentServiceStatus,
        },
        `Service change: "${stringForPitServiceStatus(previousServiceStatus)}" to "${stringForPitServiceStatus(currentServiceStatus)}"`
      );
    }
  );

/**
 * gRPC client stream
 */
const client = new TelemetryClient(apiUrl);
const stream = client
  .subscribeTelemetry(60, [
    "OnPitRoad",
    "PitsOpen",
    "PitSvFlags",
    "PitstopActive",
    "PlayerCarInPitStall",
    "PlayerCarPitSvStatus",
    "PlayerTrackSurface",
    "SessionTime",
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
    const {
      OnPitRoad: isOnPitRoad = false,
      PitsOpen: isPitLaneOpen = false,
      PitSvFlags: serviceFlags = 0x0,
      PitstopActive: isPitstopActive = false,
      PlayerCarInPitStall: isPlayerCarInPitStall = false,
      PlayerCarPitSvStatus: serviceStatus = 0x0,
      PlayerTrackSurface: trackLocation = TrackLocation.not_in_world,
      SessionTime: sessionTimeRaw,
    } = JSON.parse(data) as TelemetryData;

    // Update timestamps
    const sessionTime = Duration.fromObject({
      seconds: sessionTimeRaw,
    }).toFormat("hh:mm:ss.SSS");

    playerPitStopEventEmitter.process({
      isOnPitRoad,
      isPitLaneOpen,
      isPlayerCarInPitStall,
      isPitstopActive,
      serviceFlags,
      trackLocation,
      serviceStatus,
      sessionTime,
    });
  });

const shutdown = () => {
  playerPitStopEventEmitter.removeAllListeners();

  stream.removeAllListeners();
  stream.cancel();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("disconnect", shutdown);
