import {
  Configuration,
  TrackApi,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import {
  resolveAccessToken,
  type CredentialOptions,
} from "../../../credentials.js";
import { materializeReturnedDataApiLink } from "../returned-data-api-link.js";
import type {
  CreateTrackAssetsCommandScope,
  TrackAssetsOptions,
} from "./command.js";
import type { Diagnostics } from "../../../diagnostics.js";

interface TrackAssetsClient {
  getTrackAssets(): Promise<IracingAPIResponse>;
}

/** Injected seams used to build one track-assets invocation scope. */
export interface TrackAssetsScopeDependencies {
  /**
   * Resolves a bearer credential from the command options or credential file.
   * @param {CredentialOptions} options - Explicit bearer token, credential-file selection, and optional file reader.
   * @returns {Promise<string>} Resolved nonempty bearer credential.
   */
  resolveAccessToken(options: CredentialOptions): Promise<string>;

  /**
   * Constructs the generated endpoint client with the resolved bearer credential.
   * @param {string} accessToken - Bearer credential used to authorize the generated endpoint client.
   * @returns {TrackAssetsClient} Endpoint client bound to the resolved bearer credential.
   */
  createTrackAssetsClient(accessToken: string): TrackAssetsClient;

  /**
   * Fetches the opaque data URL returned by the typed Data API endpoint.
   * @param {string} link - Opaque HTTPS data URL returned by a typed Data API response.
   * @returns {Promise<unknown>} Decoded JSON payload from the returned data URL.
   */
  materializeReturnedDataApiLink(link: string): Promise<unknown>;

  /**
   * Writes serialized command output to standard output.
   * @param {string} value - Input value to validate, store, or serialize.
   */
  writeStdout(value: string): void;
}

const defaultDependencies: TrackAssetsScopeDependencies = {
  resolveAccessToken,

  /** Construct the generated client that owns the modeled Data API request. */
  createTrackAssetsClient(accessToken) {
    return new TrackApi(new Configuration({ accessToken }));
  },
  materializeReturnedDataApiLink,
  writeStdout(value) {
    process.stdout.write(value);
  },
};

function responseStatus(error: unknown): number | undefined {
  if (!(error instanceof Error) || error.name !== "ResponseError") {
    return undefined;
  }

  const response = (error as Error & { response?: unknown }).response;

  if (!response || typeof response !== "object" || !("status" in response)) {
    return undefined;
  }

  const { status } = response as { status?: unknown };

  return typeof status === "number" ? status : undefined;
}

function mapTrackAssetsRequestError(error: unknown): Error {
  const status = responseStatus(error);

  if (status === 401 || status === 403) {
    return new Error(
      `Track assets request failed with HTTP ${String(status)}. Credentials may be invalid, expired, or unauthorized; run iracing-data auth login and retry.`,
    );
  }

  if (status === 429) {
    return new Error(
      "Track assets request failed with HTTP 429. iRacing rate limited the request; retry later.",
    );
  }

  if (status === 503) {
    return new Error(
      "Track assets request failed with HTTP 503. The iRacing Data API is unavailable or under maintenance; retry later.",
    );
  }

  if (status !== undefined) {
    return new Error(
      `Track assets request failed with HTTP ${String(status)}. Retry; if the failure persists, check iRacing service availability.`,
    );
  }

  return new Error(
    "Track assets request failed. Check network connectivity and iRacing Data API availability, then retry.",
  );
}

/**
 * Build one `assets track` scope using existing credential resolution, generated API
 * ownership, shared returned-link materialization, and JSON-only stdout output.
 * @param {Diagnostics} diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {TrackAssetsScopeDependencies} dependencies - Injected external capabilities used by the command scope.
 * @returns {CreateTrackAssetsCommandScope} Factory that resolves an isolated dependency scope per invocation.
 */
export function createTrackAssetsCommandScopeFactory(
  diagnostics: Diagnostics,
  dependencies: TrackAssetsScopeDependencies = defaultDependencies,
): CreateTrackAssetsCommandScope {
  return async (options: TrackAssetsOptions) => {
    const accessToken = await dependencies.resolveAccessToken(options);

    const api = dependencies.createTrackAssetsClient(accessToken);

    return {
      assets: {
        async get(): Promise<unknown> {
          let envelope: IracingAPIResponse;

          try {
            envelope = await api.getTrackAssets();
          } catch (error) {
            throw mapTrackAssetsRequestError(error);
          }

          return dependencies.materializeReturnedDataApiLink(envelope.link);
        },
      },
      output: {
        write(payload) {
          const serialized = JSON.stringify(payload, null, 2);

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- JSON.stringify can return undefined for runtime payloads despite its declared string return type.
          if (serialized === undefined) {
            throw new Error(
              "Track asset payload could not be serialized as JSON.",
            );
          }

          dependencies.writeStdout(`${serialized}\n`);
        },
      },
      diagnostics,
    };
  };
}
