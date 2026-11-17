import { startMcpStdio } from "../../dist/index.js";
import { fixtureFetch, resolveLinkedCapabilities } from "./linked-account.mjs";

globalThis.fetch = fixtureFetch;
startMcpStdio({
  actor: { id: "linked-user", provider: "fixture" },
  resolveCapabilities: resolveLinkedCapabilities(process.env.MCP_TEST_STRATEGY),
});
