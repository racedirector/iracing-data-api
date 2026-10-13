import { MemberApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import { createToolInvocation } from "./invocation";
import {
  CacheResolver,
  ConfigurationResolver,
  IRacingLinkResolver,
  ResponseResolver,
} from "./resolvers";
import type { McpServer } from "@modelcontextprotocol/server";

const InputSchema = z.object({});

const OutputSchema = z.object({
  cust_id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  display_name: z.string().min(1),
});

type Output = z.infer<typeof OutputSchema>;

/** Request access, linked downloads, and result presentation supplied by the root. */
export interface GetMyDriverToolOptions {
  resolveConfiguration: ConfigurationResolver;
  resolveLink: IRacingLinkResolver<Output>;
  resolveResponse: ResponseResolver<Output>;
  cache?: CacheResolver;
}

/** Register the authenticated driver's small, agent-facing identity projection. */
export function createGetMyDriverTool(
  server: McpServer,
  {
    resolveConfiguration,
    resolveLink,
    resolveResponse,
    cache,
  }: GetMyDriverToolOptions,
) {
  return server.registerTool(
    "get_my_driver",
    {
      description:
        "Identify the authenticated driver. Returns only customer ID and display name; requires iracing.auth.",
      inputSchema: InputSchema,
      outputSchema: OutputSchema,
    },
    createToolInvocation(
      {
        cacheKey: "get_my_driver:v1",
        outputSchema: OutputSchema,
        request: (configuration, options) => {
          return new MemberApi(configuration).getMemberInfo(options);
        },
      },
      {
        resolveConfiguration,
        resolveLink,
        resolveResponse,
        cache,
      },
    ),
  );
}
