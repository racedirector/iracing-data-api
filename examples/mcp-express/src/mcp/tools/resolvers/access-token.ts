import { AuthInfo } from "@modelcontextprotocol/server";

export interface AccessTokenResolverOptions {
  signal: AbortSignal;
  auth?: AuthInfo;
}

export interface AccessTokenResolver {
  (options: AccessTokenResolverOptions): string | Promise<string>;
}
