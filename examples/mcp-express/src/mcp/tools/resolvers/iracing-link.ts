import {
  IracingAPIResponse,
  IracingAPIResponseToJSON,
} from "@iracing-data/api-client-fetch";
import { APIResponseSchema } from "@iracing-data/api-schema";
import { z } from "zod";

/**
 * Options for resolving a link from iRacing
 */
export interface IRacingLinkResolverOptions<T> {
  /** The IracingAPIResponse to resolve */
  response: IracingAPIResponse;

  /** The desired output schema shape */
  schema: z.ZodType<T>;

  /** Optional abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * A link resolver; accepts options and returns the result.
 */
export interface IRacingLinkResolver<T> {
  (options: IRacingLinkResolverOptions<T>): Promise<T>;
}

export interface CreateIRacingLinkResolverOptions {
  fetchApi: typeof fetch;

  /** Current Unix time in milliseconds. */
  now: () => number;
}

export function createIRacingLinkResolver<T>(
  options: CreateIRacingLinkResolverOptions,
): IRacingLinkResolver<T> {
  return async ({ response, schema, signal }) => {
    signal?.throwIfAborted();

    try {
      // Ensure the schema is valid
      const { link, expires } = APIResponseSchema.parse(
        IracingAPIResponseToJSON(response),
      );

      // Parse the URL from the provided schema. The URL is considered invalid
      // if it's provided for HTTPS, or includes a username or password.

      let url: URL;

      try {
        url = new URL(link);

        if (url.protocol !== "https:" || url.username || url.password) {
          throw new Error(
            "Expected an HTTPS link without embedded credentials",
          );
        }
      } catch (cause) {
        throw new Error("Invalid iRacing data link", {
          cause,
        });
      }

      // Check that the link is still valid
      const expiresAt = Date.parse(expires);

      if (expiresAt <= options.now()) {
        throw new Error("iRacing data link expired");
      }

      // Linked data is fetched without the API client's bearer credentials.
      const linkedResponse = await options
        .fetchApi(url.href, {
          signal,
          redirect: "error",
        })
        .catch((cause: unknown) => {
          signal?.throwIfAborted();

          throw new Error("Linked download failed", { cause });
        });

      // Handle not-ok responses
      if (!linkedResponse.ok) {
        const status = linkedResponse.status;

        throw new Error(`iRacing data link returned HTTP ${status}`);
      }

      // Parse the response
      const data: unknown = await linkedResponse.json();

      signal?.throwIfAborted();

      // The link may have expired while the body was downloading.
      if (expiresAt <= options.now()) {
        throw new Error("iRacing data link expired");
      }

      return schema.parse(data);
    } catch (cause) {
      signal?.throwIfAborted();

      // Preserve the parser's diagnostic cause while identifying the upstream
      // data boundary. Other exceptions keep their original classification.
      if (cause instanceof z.ZodError || cause instanceof SyntaxError) {
        throw new Error("Invalid linked response data", { cause });
      }

      throw cause;
    }
  };
}
