import { capabilities } from "./capabilities.mjs";
import { createMcpServices, createStdioTransport } from "./runtime.mjs";

createStdioTransport({
  serveOptions: {},
  services: createMcpServices(() => capabilities(process.env.MCP_TEST_MODE)),
});
