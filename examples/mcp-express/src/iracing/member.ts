import { MemberApi } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import type {
  IRacingRequestContext,
  IRacingRequestResolver,
  IRacingResponseContext,
  IRacingResolvedResponse,
} from "./request";
import type { IracingAPIResponse } from "@iracing-data/api-client-fetch";

/** Small identity projection shared by the member resolver and its adapters. */
export const CurrentMemberSchema = z.object({
  cust_id: z.int().positive().max(Number.MAX_SAFE_INTEGER),
  display_name: z.string().min(1),
});

export type CurrentMember = z.infer<typeof CurrentMemberSchema>;

export interface MemberResolver {
  getCurrent(context: IRacingRequestContext): Promise<CurrentMember>;
}

/** Describe the member endpoint while the request resolver owns its lifecycle. */
export function createMemberResolver({
  requests,
  materialize,
}: {
  requests: IRacingRequestResolver;
  materialize: (
    response: IracingAPIResponse,
    context: IRacingResponseContext<CurrentMember>,
  ) => Promise<IRacingResolvedResponse>;
}): MemberResolver {
  return {
    getCurrent(context) {
      return requests.resolve(
        {
          schema: CurrentMemberSchema,
          cache: { key: "get_my_driver:v1" },
          execute: (configuration, { signal }) =>
            new MemberApi(configuration).getMemberInfo({ signal }),
          materialize,
        },
        context,
      );
    },
  };
}
