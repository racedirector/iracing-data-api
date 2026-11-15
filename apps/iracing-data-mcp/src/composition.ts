import { Configuration } from "@iracing-data/api-client-fetch";
import { ApplicationFailure } from "@iracing-data/mcp";
import { asFunction, asValue, createContainer, InjectionMode } from "awilix";
import { createDriverQueries } from "./adapters/driver.js";
import { createRecentRaceQueries } from "./adapters/recent-races.js";
import { createMcpCredentialOwner } from "./session.js";
import type {
  DriverQueries,
  IracingToolContext,
  RecentRaceQueries,
} from "@iracing-data/mcp";
import type { OAuthClientOptions } from "@iracing-data/oauth-client";
import type { McpServices } from "./services.js";
import type { McpCredentialOwner } from "./session.js";

/** The source-scoped principal resolved for an MCP tool call. */
export interface McpActor {
  /** Stable ID within the provider, never a bearer token or raw credential. */
  readonly id: string;
  /** Credential/identity provider, e.g. cli or ftr-events. */
  readonly provider: string;
}

/**
 * Decide which verified principal issued this tool call. A null actor denies it.
 * The default local resolver deliberately rejects remote bearer identities.
 */
export type ResolveMcpActor = (
  context: IracingToolContext,
) => McpActor | null | Promise<McpActor | null>;

/** Capabilities belonging to a single resolved actor. */
export interface McpActorDependencies {
  readonly driverQueries: DriverQueries;
  readonly recentRaceQueries: RecentRaceQueries;
}

/** Resolve the data provider for the actor; implementations may use any SDK. */
export type ResolveMcpDependencies = (
  actor: McpActor,
  context: IracingToolContext,
) => McpActorDependencies | Promise<McpActorDependencies>;

/** Dependencies injected by the consuming host, without assuming OAuth or CLI. */
export interface McpRuntimeDependencies {
  readonly resolveActor: ResolveMcpActor;
  readonly resolveDependencies: ResolveMcpDependencies;
  readonly authorizationState?: McpServices["authorizationState"];
  readonly shutdownAuthorizationOwner?: McpServices["shutdownAuthorizationOwner"];
}

interface RuntimeCradle {
  resolveActor: ResolveMcpActor;
  resolveDependencies: ResolveMcpDependencies;
  services: McpServices;
}

function requiredActor(actor: McpActor | null): McpActor {
  if (actor && actor.id && actor.provider) {
    return actor;
  }

  throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
}

/**
 * Inject actor and capability resolution through Awilix. Tool selectors perform
 * resolution on every call, never caching an actor in the process/container.
 * @param {McpRuntimeDependencies} dependencies - Identity and actor-specific capability providers.
 * @returns {McpServices} Request-local service selectors for the MCP transport.
 */
export function composeMcpServices(dependencies: McpRuntimeDependencies): McpServices {
  const container = createContainer<RuntimeCradle>({
    injectionMode: InjectionMode.PROXY,
  });

  container.register({
    resolveActor: asValue(dependencies.resolveActor),
    resolveDependencies: asValue(dependencies.resolveDependencies),
    services: asFunction(({ resolveActor, resolveDependencies }) => {
      async function select(context: IracingToolContext) {
        context.signal.throwIfAborted();
        const actor = requiredActor(await resolveActor(context));

        context.signal.throwIfAborted();

        return resolveDependencies(actor, context);
      }

      return {
        authorizationState: dependencies.authorizationState,
        shutdownAuthorizationOwner: dependencies.shutdownAuthorizationOwner,
        getDriverQueries: async (context: IracingToolContext) =>
          (await select(context)).driverQueries,
        getRecentRaceQueries: async (context: IracingToolContext) =>
          (await select(context)).recentRaceQueries,
      };
    }).singleton(),
  });

  return container.cradle.services;
}

/**
 * One-account local implementation. Only this adapter knows the CLI credential
 * document and authored OAuth refresh lifecycle. Other hosts inject both
 * resolvers rather than reading files or using CLI identities.
 * @param {McpCredentialOwner} credentials - Local CLI credential lifecycle owner.
 * @returns {McpRuntimeDependencies} Local actor and Fetch capability resolvers.
 */
export function createCliMcpDependencies(
  credentials: McpCredentialOwner,
): McpRuntimeDependencies {
  const configuration = new Configuration({
    accessToken: credentials.getAccessToken,
  });
  const queries = {
    driverQueries: createDriverQueries(configuration),
    recentRaceQueries: createRecentRaceQueries(configuration),
  };

  return {
    resolveActor: (context) =>
      context.authInfo ? null : { id: "local", provider: "cli" },
    resolveDependencies: (actor) => {
      if (actor.provider !== "cli" || actor.id !== "local") {
        throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
      }

      credentials.assertActive();

      return queries;
    },
    authorizationState: credentials.authorizationState,
    shutdownAuthorizationOwner: credentials.shutdownAuthorizationOwner,
  };
}

/**
 * Build the CLI credential adapter for the selected document. A future Better Auth
 * consumer can bypass this entirely and inject its own actor/dependency resolvers.
 * @param {{clientMetadata: OAuthClientOptions["clientMetadata"]; credentialFile: string}} options - OAuth registration and CLI file path.
 * @returns {Promise<McpRuntimeDependencies>} Local dependency selectors and lifecycle.
 */
export async function createCliMcpRuntimeDependencies(options: {
  readonly clientMetadata: OAuthClientOptions["clientMetadata"];
  readonly credentialFile: string;
}): Promise<McpRuntimeDependencies> {
  const credentials = await createMcpCredentialOwner(options);

  return createCliMcpDependencies(credentials);
}
