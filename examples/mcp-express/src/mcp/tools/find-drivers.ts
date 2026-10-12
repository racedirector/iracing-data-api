import { LookupApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { AppLogger } from "../../logger";
import { IRacingLinkService } from "../../services/iracing-link";
import { ConfigurationResolver } from "./resolvers/configuration";
import type { McpServer } from "@modelcontextprotocol/server";

const InputSchema = z.object({});

const OutputSchema = z.object({});

export interface FindDriversToolOptions {
  logger?: AppLogger;
  resolveConfiguration: ConfigurationResolver;
  linkService: IRacingLinkService;
}

export function createFindDriversTool(
  server: McpServer,
  options: FindDriversToolOptions,
) {
  return server.registerTool(
    "find_drivers",
    {
      description:
        "Find drivers by a name or ID query. Preserves upstream ranking; multiple matches are ambiguous and never automatically selected. Continue with cursor alone.",
      inputSchema: InputSchema,
      outputSchema: OutputSchema,
    },
    async (input, ctx) => {
      const abortSignal = ctx.mcpReq.signal;

      try {
        const configuration = await options.resolveConfiguration({
          signal: abortSignal,
          auth: ctx.http?.authInfo,
        });
      } catch (error) {
        throw error;
      }
    },
  );
}
