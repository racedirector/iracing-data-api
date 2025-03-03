/* eslint-env node */
import WebSocket from "ws";

const socketUrl = `ws://${process.env.TELEMETRY_SERVER_HOST}:${process.env.PORT}`;

const main = async () => {
  const timeout = parseInt(process.env.TIMEOUT || 30, 10);
  const timeoutMs = timeout * 1000;

  const socket = new WebSocket(socketUrl);

  const shutdown = () => {
    console.info("Shutting down...");
    if (socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
    process.exit(0);
  };

  socket
    .on("open", () => {
      console.info("[client] socket connected to host:", socketUrl);
      socket.send(JSON.stringify({ fps: 0.25 })); // Request data at 30 FPS
    })
    .on("message", (event) => {
      console.info("[client] message received:", event);
      console.info("[client] message received:", event.data);
    })
    .on("close", (code, reason) => {
      console.info("[client] socket closed:", code, `${reason}`);
      shutdown();
    })
    .on("error", (error) => {
      console.error("[client] socket error:", error);
    });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("disconnect", shutdown);

  // If the socket doesn't connect in 30 seconds, exit
  setTimeout(() => {
    if (socket.readyState !== WebSocket.OPEN) {
      console.error("Failed to connect to", socketUrl);
      shutdown();
    }
  }, timeoutMs);
};

main();
