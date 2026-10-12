import { createServer } from "node:http";
import { Configuration } from "@iracing-data/api-client-fetch";
import { createMcpServer, DataApiGateway } from "@iracing-data/mcp-server";
import {
  localhostHostValidation,
  localhostOriginValidation,
  toNodeHandler,
} from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";

const accessToken = process.env.IRACING_ACCESS_TOKEN;
if (!accessToken)
  throw new Error(
    "Set IRACING_ACCESS_TOKEN to an existing iRacing access token.",
  );

// One account-owned gateway is shared by every MCP server the SDK creates.
const gateway = new DataApiGateway({
  configuration: new Configuration({ accessToken }),
});
const handler = createMcpHandler(() =>
  createMcpServer({
    config: { name: "node-mcp-server", version: "0.0.1" },
    services: { getDataApiGateway: () => gateway },
  }),
);

const node = toNodeHandler(handler);
const validateHost = localhostHostValidation();
const validateOrigin = localhostOriginValidation();
const server = createServer((req, res) => {
  if (validateHost(req, res) && validateOrigin(req, res)) void node(req, res);
});
server.listen(Number(process.env.PORT ?? "3000"), "127.0.0.1", () => {
  const address = server.address();
  if (address && typeof address === "object")
    console.log(`MCP: http://127.0.0.1:${address.port}/mcp`);
});
