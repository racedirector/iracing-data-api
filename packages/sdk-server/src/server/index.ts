import events from "node:events";
import http from "node:http";
import { AddressInfo } from "node:net";
import cors from "cors";
import express from "express";
import expressWs from "express-ws";
import { createHttpTerminator, HttpTerminator } from "http-terminator";
import { Config } from "../config";
import { AppContext } from "../context";
import { IRacing } from "../iracing";
import { subsystemLogger } from "../logger";
import { health, iracing, websocket } from "./api";
import { loggerMiddleware } from "./middleware";

const logger = subsystemLogger("server");

type ServerOptions = {
  app: express.Application;
  server?: http.Server;
  context: AppContext;
};

export class Server {
  public context: AppContext;
  public app: express.Application;
  public server: http.Server;
  private terminator?: HttpTerminator;

  static create(options: { config: Config }) {
    const { config } = options;
    const app = express();
    const server = http.createServer(app);
    expressWs(app, server);

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(loggerMiddleware);

    const iRacing = new IRacing();

    const context = new AppContext({ config, iRacing });

    app.use(health.createRouter(context));
    app.use(iracing.createRouter(context));
    app.use(websocket.createRouter(context));

    return new Server({ app, server, context });
  }

  constructor({ app, context, server }: ServerOptions) {
    this.app = app;
    this.context = context;
    this.server = server ?? http.createServer(app);
  }

  async start() {
    logger.info("Starting server...");
    this.server.listen(this.context.config.port);
    this.terminator = createHttpTerminator({ server: this.server });

    await events.once(this.server, "listening");
    const { port } = this.server.address() as AddressInfo;
    this.context.config.assignPort(port);
    logger.info(`Server listening on port ${port}`);

    return this.server;
  }

  async stop() {
    logger.info("Stopping server...");
    // this.context.iRacing.destroy();
    await this.terminator?.terminate();
    logger.info("Server stopped!");
  }
}

export default Server;
