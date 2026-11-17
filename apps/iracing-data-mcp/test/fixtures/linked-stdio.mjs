import { createStdioTransport } from "../../dist/transports/stdio/index.js";
import { fixtureFetch, resolveLinkedCapabilities } from "./linked-account.mjs";

globalThis.fetch = fixtureFetch;
createStdioTransport({
  serveOptions: {},
  actor: { id: "linked-user", provider: "fixture" },
  resolveCapabilities: resolveLinkedCapabilities(process.env.MCP_TEST_STRATEGY),
});
