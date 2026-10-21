import { McpServer } from "@modelcontextprotocol/server";
import { createGetMyDriverTool } from "./tools/get-my-driver";
import {
  CacheResolver,
  ConfigurationResolver,
  createIRacingLinkResolver,
} from "./tools/resolvers";

/** The root owns server identity and all services used by registered tools. */
export interface CreateServerOptions {
  serverInfo: ConstructorParameters<typeof McpServer>[0];
  resolveConfiguration: ConfigurationResolver;
  cache?: CacheResolver;
}

/** Register tools on a fresh MCP server while retaining caller-owned dependencies. */
export function createServer({
  serverInfo,
  resolveConfiguration,
  cache,
}: CreateServerOptions) {
  const server = new McpServer(serverInfo);

  createGetMyDriverTool(server, {
    cache,
    resolveConfiguration,
    resolveLink: createIRacingLinkResolver({
      fetchApi: fetch,
      now: () => Date.now(),
    }),
    resolveResponse: {
      success: (value) => ({
        content: [{ type: "text", text: JSON.stringify(value) }],
        structuredContent: value,
      }),
      error: (cause) => ({
        isError: true,
        content: [{ type: "text", text: "There was an unknown error" }],
      }),
    },
  });

  return server;
}
