import { IracingAPIResponse, MemberApi } from "@iracing-data/api-client-fetch";
import {
  ConstantsResponse,
  ResultsSearchSeriesResponse,
  ServiceDocsResponse,
  ServiceMethodDocsResponse,
  ServicesDocsResponse,
} from "@iracing-data/api-schema";
import { AuthInfo } from "@modelcontextprotocol/server";
import { ConfigurationResolver } from "../configuration";

type APIResponseType =
  | IracingAPIResponse
  | ConstantsResponse
  | ResultsSearchSeriesResponse
  | ServicesDocsResponse
  | ServiceDocsResponse
  | ServiceMethodDocsResponse;

export interface RequestResolverOptions {
  signal: AbortSignal;
  auth?: AuthInfo;
}

export interface RequestResolver {
  (options: RequestResolverOptions): Promise<APIResponseType>;
}

export interface CreateRequestResolverOptions {
  resolveConfiguration: ConfigurationResolver;
  request: (
    configuration: Awaited<ReturnType<ConfigurationResolver>>,
    options: { signal: AbortSignal },
  ) => Promise<APIResponseType>;
}

export function createRequestResolver(
  options: CreateRequestResolverOptions,
): RequestResolver {
  return async ({ signal, auth }) => {
    signal.throwIfAborted();

    const configuration = await options.resolveConfiguration({
      signal,
      auth,
    });

    signal.throwIfAborted();

    return await options.request(configuration, { signal });
  };
}
