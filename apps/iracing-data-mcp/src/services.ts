/**
 * Composition contract between process owners and MCP/request bindings.
 *
 * Production creates one OAuth/session owner, generated Fetch configuration and
 * bounded gateway through createMcpServices in session.ts. Logical MCP sessions,
 * stateless exchanges and HTTP requests borrow these services; they do not create
 * another refreshing owner. Optional capabilities are part of the current
 * composition/test seam, so tools must handle an absent gateway safely rather than
 * assume every services bag is complete. Cursor owners currently live in tool
 * registrar WeakMaps keyed by the gateway, sharing its retention budget and account
 * generation across MCP sessions and requests.
 *
 * Explicit typed factories own these lifetimes. A request signal belongs to one
 * bounded operation. The shutdown hook runs after HTTP drain and MCP-session cleanup
 * and owns irreversible credential cleanup; discarding JavaScript objects alone is
 * not shutdown.
 */
import type { DataApiGateway } from "./gateway/gateway.js";
import type { AuthorizationState } from "./session.js";
import type { Configuration as DataApiConfiguration } from "@iracing-data/api-client-fetch";
import type { OAuthClient } from "@iracing-data/oauth-client";

/**
 * Long-lived application services shared across MCP sessions and HTTP requests.
 *
 * Durable session restoration is composed once by createMcpServices.
 * The bounded gateway shares that fixed session owner.
 */
export interface McpServices {
  readonly dataApiGateway?: DataApiGateway;
  readonly authorizationState?: () => AuthorizationState;

  /** Called once after HTTP/MCP drain to quarantine any consumed, uncommitted rotation. */
  readonly shutdownAuthorizationOwner?: () => Promise<void>;
  readonly oauthClient: OAuthClient;
  readonly dataApiConfiguration: DataApiConfiguration;
}
