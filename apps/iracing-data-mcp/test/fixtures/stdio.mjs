import { createIracingMcpServer } from "@iracing-data/mcp";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { composeMcpServices } from "../../dist/composition.js";
import { capabilities } from "./capabilities.mjs";

serveStdio(() =>
  createIracingMcpServer({
    serverInfo: { name: "parity-fixture", version: "1" },
    services: composeMcpServices({ id: "fixture", provider: "test" }, () =>
      capabilities(process.env.MCP_TEST_MODE),
    ),
  }),
);
