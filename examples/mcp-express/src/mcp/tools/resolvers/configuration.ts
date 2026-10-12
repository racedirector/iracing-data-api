import { Configuration } from "@iracing-data/api-client-fetch";
import { AuthInfo } from "@modelcontextprotocol/server";
import { AccessTokenResolver } from "./access-token";

export interface ConfigurationResolverOptions {
  signal: AbortSignal;
  auth?: AuthInfo;
}

export interface ConfigurationResolver {
  (
    options: ConfigurationResolverOptions,
  ): Configuration | Promise<Configuration>;
}

export interface CreateConfigurationResolverOptions {
  fetchApi?: typeof fetch;
  accessTokenResolver: AccessTokenResolver;
  basePath?: string;
}

export function createConfigurationResolver(
  options: CreateConfigurationResolverOptions,
): ConfigurationResolver {
  return async ({ signal, auth }) => {
    signal.throwIfAborted();

    const accessToken = await options.accessTokenResolver({
      signal,
      auth,
    });

    return new Configuration({
      accessToken,
      basePath: options.basePath,
      fetchApi: options.fetchApi,
    });
  };
}
