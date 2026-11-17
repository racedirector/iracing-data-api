import { createStdioTransport } from "../../dist/index.js";
import { capabilities } from "./capabilities.mjs";

createStdioTransport({
  serveOptions: {},
  actor: { id: "fixture", provider: "test" },
  resolveCapabilities: () => capabilities(process.env.MCP_TEST_MODE),
});
