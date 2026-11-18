import { fixtureFetch, resolveLinkedCapabilities } from "./linked-account.mjs";
import { createMcpServices, createStdioTransport } from "./runtime.mjs";

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
