import { createMcpServices, createStdioTransport } from "../../dist/index.js";
import { fixtureFetch, resolveLinkedCapabilities } from "./linked-account.mjs";

globalThis.fetch = fixtureFetch;
createStdioTransport({
  serveOptions: {},
  services: createMcpServices(
    resolveLinkedCapabilities(process.env.MCP_TEST_STRATEGY)({
      id: "linked-user",
      provider: "fixture",
    }),
  ),
});
