import {
  Configuration,
  SeriesApi,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import {
  resolveAccessToken,
  type CredentialOptions,
} from "../../../credentials.js";
import { materializeReturnedDataApiLink } from "../returned-data-api-link.js";
import type {
  CreateSeriesAssetsCommandScope,
  SeriesAssetsOptions,
} from "./command.js";
import type { Diagnostics } from "../../../diagnostics.js";

interface SeriesAssetsClient {
  getSeriesAssets(): Promise<IracingAPIResponse>;
}

/** Injected seams used to build one series-assets invocation scope. */
export interface SeriesAssetsScopeDependencies {
  /**
   * Resolves a bearer credential from the command options or credential file.
   * @param {CredentialOptions} options - Explicit bearer token, credential-file selection, and optional file reader.
   * @returns {Promise<string>} Resolved nonempty bearer credential.
   */
  resolveAccessToken(options: CredentialOptions): Promise<string>;

  /**
   * Constructs the generated endpoint client with the resolved bearer credential.
   * @param {string} accessToken - Bearer credential used to authorize the generated endpoint client.
   * @returns {SeriesAssetsClient} Endpoint client bound to the resolved bearer credential.
   */
  createSeriesAssetsClient(accessToken: string): SeriesAssetsClient;

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

const defaultDependencies: SeriesAssetsScopeDependencies = {
  resolveAccessToken,

  /** Construct the generated client that owns the modeled Data API request. */
  createSeriesAssetsClient(accessToken) {
    return new SeriesApi(new Configuration({ accessToken }));
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

function mapSeriesAssetsRequestError(error: unknown): Error {
  const status = responseStatus(error);

  if (status === 401 || status === 403) {
    return new Error(
      `Series assets request failed with HTTP ${String(status)}. Credentials may be invalid, expired, or unauthorized; run iracing-data auth login and retry.`,
    );
  }

  if (status === 429) {
    return new Error(
      "Series assets request failed with HTTP 429. iRacing rate limited the request; retry later.",
    );
  }

  if (status === 503) {
    return new Error(
      "Series assets request failed with HTTP 503. The iRacing Data API is unavailable or under maintenance; retry later.",
    );
  }

  if (status !== undefined) {
    return new Error(
      `Series assets request failed with HTTP ${String(status)}. Retry; if the failure persists, check iRacing service availability.`,
    );
  }

  return new Error(
    "Series assets request failed. Check network connectivity and iRacing Data API availability, then retry.",
  );
}

/**
 * Build one `assets series` scope using existing credential resolution, generated API
 * ownership, shared returned-link materialization, and JSON-only stdout output.
 * @param {Diagnostics} diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {SeriesAssetsScopeDependencies} dependencies - Injected external capabilities used by the command scope.
 * @returns {CreateSeriesAssetsCommandScope} Factory that resolves an isolated dependency scope per invocation.
 */
export function createSeriesAssetsCommandScopeFactory(
  diagnostics: Diagnostics,
  dependencies: SeriesAssetsScopeDependencies = defaultDependencies,
): CreateSeriesAssetsCommandScope {
  return async (options: SeriesAssetsOptions) => {
    const accessToken = await dependencies.resolveAccessToken(options);

    const api = dependencies.createSeriesAssetsClient(accessToken);

    return {
      assets: {
        async get(): Promise<unknown> {
          let envelope: IracingAPIResponse;

          try {
            envelope = await api.getSeriesAssets();
          } catch (error) {
            throw mapSeriesAssetsRequestError(error);
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
              "Series asset payload could not be serialized as JSON.",
            );
          }

          dependencies.writeStdout(`${serialized}\n`);
        },
      },
      diagnostics,
    };
  };
}
