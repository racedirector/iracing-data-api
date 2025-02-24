import events from "node:events";
import http from "node:http";
import { AddressInfo } from "node:net";
import cors from "cors";
import express from "express";
import { createHttpTerminator, HttpTerminator } from "http-terminator";
import { Config } from "../config";
import { AppContext } from "../context";
import { IRacing } from "../iracing";
import { subsystemLogger } from "../logger";
import { health } from "./api";
import { loggerMiddleware } from "./middleware";

const logger = subsystemLogger("server");

export class Server {
  public context: AppContext;
  public app: express.Application;
  public server?: http.Server;
  private terminator?: HttpTerminator;

  static create(options: { config: Config }) {
    const { config } = options;
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(loggerMiddleware);

    const iRacing = new IRacing();

    const context = new AppContext({ config, iRacing });

    app.use(health.createRouter(context));

    return new Server({ app, context });
  }

  constructor(options: { app: express.Application; context: AppContext }) {
    this.app = options.app;
    this.context = options.context;
  }

  async start() {
    logger.info("Starting server...");
    const server = this.app.listen(this.context.config.port);
    this.server = server;
    this.terminator = createHttpTerminator({ server });

    await events.once(server, "listening");
    const { port } = server.address() as AddressInfo;
    this.context.config.assignPort(port);
    logger.info(`Server listening on port ${port}`);

    return server;
  }

  async stop() {
    logger.info("Stopping server...");
    this.context.iRacing.destroy();
    await this.terminator?.terminate();
    logger.info("Server stopped!");
  }
}

export default Server;
