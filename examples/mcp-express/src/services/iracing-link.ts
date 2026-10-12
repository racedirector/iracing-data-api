import {
  IracingAPIResponseToJSON,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import { APIResponseSchema } from "@iracing-data/api-schema";
import type { z } from "zod";

export interface IRacingLinkService {
  materialize<T>(options: {
    response: IracingAPIResponse;
    schema: z.ZodType<T>;
    signal?: AbortSignal;
  }): Promise<T>;
}

export interface CreateFetchIRacingLinkServiceOptions {
  fetchApi: typeof fetch;
}

const DEFAULT_OPTIONS: CreateFetchIRacingLinkServiceOptions = {
  fetchApi: fetch,
};

/**
 * A concrete implementation of IRacingLinkService using a custom fetch API.
 * @returns IRacingLinkService
 */
export function createFetchIRacingLinkService({
  fetchApi,
}: CreateFetchIRacingLinkServiceOptions = DEFAULT_OPTIONS): IRacingLinkService {
  return {
    async materialize({ response, schema, signal }) {
      signal?.throwIfAborted();

      const { link, expires } = APIResponseSchema.parse(
        IracingAPIResponseToJSON(response),
      );

      const url = new URL(link);
      if (url.protocol !== "https:" || url.username || url.password) {
        throw new Error("Invalid iRacing data link");
      }

      const expiresAt = Date.parse(expires);
      if (expiresAt <= Date.now()) {
        throw new Error("iRacing data link expired");
      }

      // Linked data is fetched without the API client's bearer credentials.
      const linkedResponse = await fetchApi(url.href, {
        signal,
        redirect: "error",
      });

      if (!linkedResponse.ok) {
        throw new Error(
          `iRacing data link returned HTTP ${linkedResponse.status}`,
        );
      }
      const data: unknown = await linkedResponse.json();

      signal?.throwIfAborted();

      if (expiresAt <= Date.now()) {
        throw new Error("iRacing data link expired");
      }

      return schema.parse(data);
    },
  };
}
