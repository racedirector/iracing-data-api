import { McpServer } from "@modelcontextprotocol/server";
import { createMemberResolver } from "../iracing/member";
import { createIRacingRequestResolver } from "../iracing/request";
import { createGetMyDriverTool } from "./tools/get-my-driver";
import { createIRacingLinkResolver } from "./tools/resolvers";
import type { CacheResolver, ConfigurationResolver } from "./tools/resolvers";

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
  const resolveLink = createIRacingLinkResolver({
    fetchApi: fetch,
    now: () => Date.now(),
  });

  createGetMyDriverTool(server, {
    resolveMember: ({ signal, auth }) =>
      createMemberResolver({
        requests: createIRacingRequestResolver({
          cache,
          resolveConfiguration: (context) =>
            resolveConfiguration({ ...context, auth }),
        }),
        materialize: (response, context) =>
          resolveLink({ response, ...context }),
      }).getCurrent({ signal }),
    resolveResponse: {
      success: (value) => ({
        content: [{ type: "text", text: JSON.stringify(value) }],
        structuredContent: value,
      }),
      error: (_cause) => ({
        isError: true,
        content: [{ type: "text", text: "There was an unknown error" }],
      }),
    },
  });

  return server;
}
