import { startMcpStdio } from "../../dist/stdio.js";
import { capabilities } from "./capabilities.mjs";

startMcpStdio({
  actor: { id: "fixture", provider: "test" },
  resolveCapabilities: () => capabilities(process.env.MCP_TEST_MODE),
});
