import { Configuration } from "@iracing-data/api-client-fetch";
import { createMcpServer, DataApiGateway } from "@iracing-data/mcp-server";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
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
    config: { name: "express-mcp-server", version: "0.0.1" },
    services: { getDataApiGateway: () => gateway },
  }),
);

const app = createMcpExpressApp({ jsonLimit: "64kb" });
const node = toNodeHandler(handler);
app.all("/mcp", (req, res) => node(req, res, req.body));
const server = app.listen(
  Number(process.env.PORT ?? "3001"),
  "127.0.0.1",
  () => {
    const address = server.address();
    if (address && typeof address === "object")
      console.log(`MCP: http://127.0.0.1:${address.port}/mcp`);
  },
);
