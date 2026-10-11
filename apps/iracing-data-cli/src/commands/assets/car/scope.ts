import {
  CarApi,
  Configuration,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import {
  resolveAccessToken,
  type CredentialOptions,
} from "../../../credentials.js";
import type { Diagnostics } from "../../../diagnostics.js";
import { materializeReturnedDataApiLink } from "../returned-data-api-link.js";
import type {
  CarAssetsOptions,
  CreateCarAssetsCommandScope,
} from "./command.js";

interface CarAssetsClient {
  getCarAssets(): Promise<IracingAPIResponse>;
}

/** Injected seams used to build one car-assets invocation scope. */
export interface CarAssetsScopeDependencies {
  resolveAccessToken(options: CredentialOptions): Promise<string>;
  createCarAssetsClient(accessToken: string): CarAssetsClient;
  materializeReturnedDataApiLink(link: string): Promise<unknown>;
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
  if (!(error instanceof Error) || error.name !== "ResponseError")
    return undefined;
  const response = (error as Error & { response?: unknown }).response;
  if (!response || typeof response !== "object" || !("status" in response))
    return undefined;
  const { status } = response as { status?: unknown };
  return typeof status === "number" ? status : undefined;
}

/** Map generated Data API failures to fixed, secret-safe CLI errors. */
function mapCarAssetsRequestError(error: unknown): Error {
  const status = responseStatus(error);

  if (status === 401 || status === 403) {
    return new Error(
      `Car assets request failed with HTTP ${status}. Credentials may be invalid, expired, or unauthorized; run iracing-data auth login and retry.`,
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
      `Car assets request failed with HTTP ${status}. Retry; if the failure persists, check iRacing service availability.`,
    );
  }

  return new Error(
    "Car assets request failed. Check network connectivity and iRacing Data API availability, then retry.",
  );
}

/**
 * Build one `assets car` scope: resolve credentials, construct the generated API client,
 * bind returned-link materialization, and expose JSON-only stdout output.
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
          if (serialized === undefined) {
            throw new Error("Car asset payload could not be serialized as JSON.");
          }
          dependencies.writeStdout(`${serialized}\n`);
        },
      },
      diagnostics,
    };
  };
}
