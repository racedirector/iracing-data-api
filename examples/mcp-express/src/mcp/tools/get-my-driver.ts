import { MemberApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { AppLogger, createNoopLogger } from "../../logger";
import { IRacingLinkService } from "../../services/iracing-link";
import { ConfigurationResolver } from "./resolvers/configuration";
import type { McpServer } from "@modelcontextprotocol/server";

const InputSchema = z.object({});

const ResponseSchema = z.object({
  cust_id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  display_name: z.string().min(1),
});

export interface GetMyDriverToolOptions {
  logger?: AppLogger;
  resolveConfiguration: ConfigurationResolver;
  linkService: IRacingLinkService;
}

export function createGetMyDriverTool(
  server: McpServer,
  {
    logger = createNoopLogger(),
    resolveConfiguration,
    linkService,
  }: GetMyDriverToolOptions,
) {
  return server.registerTool(
    "get_my_driver",
    {
      description:
        "Identify the authenticated driver. Returns only customer ID and display name; requires iracing.auth.",
      inputSchema: InputSchema,
      outputSchema: ResponseSchema,
    },
    async (input, ctx) => {
      const abortSignal = ctx.mcpReq.signal;

      try {
        const configuration = await resolveConfiguration({
          signal: abortSignal,
          auth: ctx.http?.authInfo,
        });

        // TODO: This is a candidate to get abstracted, but whatever for now.
        const response = await new MemberApi(configuration).getMemberInfo({
          signal: abortSignal,
        });

        const result = await linkService.materialize({
          response,
          schema: ResponseSchema,
          signal: abortSignal,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
          structuredContent: result,
        };
      } catch (error) {
        throw error;
      }
    },
  );
}
