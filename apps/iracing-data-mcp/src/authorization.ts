import {
  getOAuthProtectedResourceMetadataUrl,
  requireBearerAuth,
} from "@modelcontextprotocol/express";
import cors from "cors";
import { Router, type RequestHandler } from "express";
import type { OAuthTokenVerifier } from "@modelcontextprotocol/server";

/** Verifier-neutral, process-scoped configuration for MCP ingress. */
export interface McpAuthorizationOptions {
  readonly resourceUrl: string;
  readonly verifier: OAuthTokenVerifier;

  /** External authorization-server issuer used only for resource metadata. */
  readonly issuer?: string;
  readonly requiredScopes?: readonly string[];
}

/** App-owned Express composition; session identifiers never grant access. */
export interface McpAuthorizationBoundary {
  readonly metadataUrl: string;
  readonly metadataRouter: Router;
  readonly middleware: RequestHandler;
}

/** Composes SDK bearer middleware with issuer-only resource discovery. */
export function createMcpAuthorizationBoundary(
  options: McpAuthorizationOptions,
): McpAuthorizationBoundary {
  const metadataUrl = getOAuthProtectedResourceMetadataUrl(
    new URL(options.resourceUrl),
  );

  const metadataRouter = Router();

  if (options.issuer) {
    // @modelcontextprotocol/express 2.0.2 still requires full AS metadata:
    // https://github.com/modelcontextprotocol/typescript-sdk/issues/2623
    // Do not fabricate or proxy AS endpoints for this resource-only host.
    metadataRouter.use(
      new URL(metadataUrl).pathname,
      cors({
        methods: ["GET", "HEAD", "OPTIONS"],
        allowedHeaders: ["Content-Type", "MCP-Protocol-Version"],
      }),
    );
    metadataRouter.get(new URL(metadataUrl).pathname, (_req, res) => {
      res.json({
        resource: options.resourceUrl,
        authorization_servers: [options.issuer],
        ...(options.requiredScopes?.length
          ? { scopes_supported: [...options.requiredScopes] }
          : {}),
      });
    });
  }

  return Object.freeze({
    metadataUrl,
    metadataRouter,
    middleware: requireBearerAuth({
      verifier: options.verifier,
      requiredScopes: options.requiredScopes
        ? [...options.requiredScopes]
        : undefined,
      expectedResource: new URL(options.resourceUrl),
      resourceMetadataUrl: metadataUrl,
    }),
  });
}
