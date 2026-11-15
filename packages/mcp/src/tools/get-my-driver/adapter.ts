import { Configuration, MemberApi } from "@iracing-data/api-client-fetch";
import { DriverProjection } from "./schema.js";
import type { DriverQueries } from "./service.js";
import { materialize } from "../../linked-response.js";

/** The consumer controls access-token issue, refresh and persistence. */
export interface AccessTokenProvider {
  getAccessToken(): Promise<string>;
}

/** Explicit injected dependencies for the generated member adapter. */
export interface GeneratedDriverOptions {
  readonly accessTokenProvider: AccessTokenProvider;
  readonly fetchApi?: typeof fetch;
}

/**
 * Construct the generated member adapter without acquiring credentials.
 * The same injected fetch handles API and safe signed-link downloads;
 * linked requests use no inherited bearer headers and reject redirects.
 */
export function createGeneratedDriverQueries({
  accessTokenProvider,
  fetchApi,
}: GeneratedDriverOptions): DriverQueries {
  const configuration = new Configuration({
    accessToken: () => accessTokenProvider.getAccessToken(),
    fetchApi,
  });
  const member = new MemberApi(configuration);

  return {
    async getCurrent({ signal }) {
      signal.throwIfAborted();
      const envelope = await member.getMemberInfo({ signal });
      const { data } = await materialize(
        envelope,
        DriverProjection,
        signal,
        configuration.fetchApi,
      );

      return data;
    },
  };
}
