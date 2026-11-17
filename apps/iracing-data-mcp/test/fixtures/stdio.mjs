import { createMcpServices, createStdioTransport } from "../../dist/index.js";
import { capabilities } from "./capabilities.mjs";

createStdioTransport({
  serveOptions: {},
  services: createMcpServices(() => capabilities(process.env.MCP_TEST_MODE)),
});
