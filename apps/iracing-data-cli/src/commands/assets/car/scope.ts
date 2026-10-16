import {
  CarApi,
  Configuration,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import {
  resolveAccessToken,
  type CredentialOptions,
} from "../../../credentials.js";
import { materializeReturnedDataApiLink } from "../returned-data-api-link.js";
import type {
  CarAssetsOptions,
  CreateCarAssetsCommandScope,
} from "./command.js";
import type { Diagnostics } from "../../../diagnostics.js";

interface CarAssetsClient {
  getCarAssets(): Promise<IracingAPIResponse>;
}

/** Injected seams used to build one car-assets invocation scope. */
export interface CarAssetsScopeDependencies {
  /**
   * Resolves a bearer credential from the command options or credential file.
   * @param {CredentialOptions} options - Explicit bearer token, credential-file selection, and optional file reader.
   * @returns {Promise<string>} Resolved nonempty bearer credential.
   */
  resolveAccessToken(options: CredentialOptions): Promise<string>;

  /**
   * Constructs the generated endpoint client with the resolved bearer credential.
   * @param {string} accessToken - Bearer credential used to authorize the generated endpoint client.
   * @returns {CarAssetsClient} Endpoint client bound to the resolved bearer credential.
   */
  createCarAssetsClient(accessToken: string): CarAssetsClient;

  /**
   * Fetches the opaque data URL returned by the typed Data API endpoint.
   * @param {string} link - Opaque HTTPS data URL returned by a typed Data API response.
   * @returns {Promise<unknown>} Decoded JSON payload from the returned data URL.
   */
  materializeReturnedDataApiLink(link: string): Promise<unknown>;

  /**
   * Writes serialized command output to standard output.
   * @param {string} value - Serialized text written directly to standard output.
   */
  writeStdout(value: string): void;
}

const defaultDependencies: CarAssetsScopeDependencies = {
  resolveAccessToken,

  /** Construct the generated client that owns the modeled Data API request. */
  createCarAssetsClient(accessToken) {
    return new CarApi(new Configuration({ accessToken }));
  },
  materializeReturnedDataApiLink,
  writeStdout(value) {
    process.stdout.write(value);
  },
};

/** Read a numeric HTTP status from generated-client ResponseError values. */
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

/** Map generated Data API failures to fixed, secret-safe CLI errors. */
function mapCarAssetsRequestError(error: unknown): Error {
  const status = responseStatus(error);

  if (status === 401 || status === 403) {
    return new Error(
      `Car assets request failed with HTTP ${String(status)}. Credentials may be invalid, expired, or unauthorized; run iracing-data auth login and retry.`,
    );
  }

  if (status === 429) {
    return new Error(
      "Car assets request failed with HTTP 429. iRacing rate limited the request; retry later.",
    );
  }

  if (status === 503) {
    return new Error(
      "Car assets request failed with HTTP 503. The iRacing Data API is unavailable or under maintenance; retry later.",
    );
  }

  if (status !== undefined) {
    return new Error(
      `Car assets request failed with HTTP ${String(status)}. Retry; if the failure persists, check iRacing service availability.`,
    );
  }

  return new Error(
    "Car assets request failed. Check network connectivity and iRacing Data API availability, then retry.",
  );
}

/**
 * Build one `assets car` scope: resolve credentials, construct the generated API client,
 * bind returned-link materialization, and expose JSON-only stdout output.
 * @param {Diagnostics} diagnostics - Secret-safe sink for command progress and failure messages.
 * @param {CarAssetsScopeDependencies} dependencies - Injected external capabilities used by the command scope.
 * @returns {CreateCarAssetsCommandScope} Factory that resolves an isolated dependency scope per invocation.
 */
export function createCarAssetsCommandScopeFactory(
  diagnostics: Diagnostics,
  dependencies: CarAssetsScopeDependencies = defaultDependencies,
): CreateCarAssetsCommandScope {
  return async (options: CarAssetsOptions) => {
    const accessToken = await dependencies.resolveAccessToken(options);

    const api = dependencies.createCarAssetsClient(accessToken);

    return {
      assets: {
        async get(): Promise<unknown> {
          let envelope: IracingAPIResponse;

          try {
            envelope = await api.getCarAssets();
          } catch (error) {
            throw mapCarAssetsRequestError(error);
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
              "Car asset payload could not be serialized as JSON.",
            );
          }

          dependencies.writeStdout(`${serialized}\n`);
        },
      },
      diagnostics,
    };
  };
}
