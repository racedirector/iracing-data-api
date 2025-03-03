import { Router } from "express";
import { AppContext } from "../../context";
import { subsystemLogger } from "../../logger";

const logger = subsystemLogger("api:websocket");

export const createRouter = (_context: AppContext): Router => {
  const router = Router();

  router.get("/", (_req, res) => {
    res.send("Websocket API");
    res.end();
  });

  router.ws("/", (ws) => {
    logger.debug("Client connected");

    let fpsInterval: NodeJS.Timeout | null = null;

    ws.on("message", (event) => {
      try {
        const data = JSON.parse(event.toString());
        if (data.type !== "config") {
          return ws.close(1002, "Expected config message.");
        }

        const { fps = 1, filters: _filters = [] } = data.payload;

        if (!fpsInterval) {
          logger.debug(`Configuring FPS interval at ${fps}`);
          fpsInterval = setInterval(() => {
            ws.send(
              JSON.stringify({
                type: "telemetry",
                payload: {},
              })
            );
          }, 1000 / fps);
        }
      } catch {
        ws.close(1003, "Invalid message");
      }
    }).on("close", (code, reason) => {
      logger.debug(`Client disconnected with code ${code}: ${reason}`);
      if (fpsInterval) {
        clearInterval(fpsInterval);
      }
    });
  });

  return router;
};
