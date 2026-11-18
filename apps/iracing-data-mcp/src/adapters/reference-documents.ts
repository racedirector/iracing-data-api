import { join } from "node:path";
import {
  Configuration,
  ConstantsApi,
  LookupApi,
} from "@iracing-data/api-client-fetch";
import {
  ReferenceDocuments,
  createReferenceDocumentResource,
} from "@iracing-data/mcp";
import { createFileBackedResolver } from "../snapshots.js";
import { createCatalogLoader } from "./catalog.js";
import type { ConfigurationParameters } from "@iracing-data/api-client-fetch";
import type {
  ReferenceDocument,
  ReferenceDocumentDefinition,
} from "@iracing-data/mcp";

/**
 * Compose direct constants and signed-link license definitions with lazy snapshots.
 * @param {string} directory - Host-owned reference snapshot directory.
 * @param {() => Promise<string>} accessToken - Credential-owner token provider.
 * @param {typeof fetch} fetchApi - Injected API and unsigned linked-data transport.
 * @returns {readonly ReferenceDocument[]} Small reference documents.
 */
export function createReferenceDocuments(
  directory: string,
  accessToken: ConfigurationParameters["accessToken"],
  fetchApi: typeof fetch = fetch,
): readonly ReferenceDocument[] {
  const configuration = new Configuration({ accessToken, fetchApi });

  const constants = new ConstantsApi(configuration);

  const lookup = new LookupApi(configuration);

  return [
    document(directory, ReferenceDocuments.categories, () =>
      constants.getConstantsCategories({ signal: AbortSignal.timeout(15_000) }),
    ),
    document(directory, ReferenceDocuments.eventTypes, () =>
      constants.getConstantsEventTypes({ signal: AbortSignal.timeout(15_000) }),
    ),
    document(directory, ReferenceDocuments.divisions, () =>
      constants.getConstantsDivisions({ signal: AbortSignal.timeout(15_000) }),
    ),
    document(
      directory,
      ReferenceDocuments.licenses,
      createCatalogLoader(
        (signal) => lookup.getLookupLicenses({ signal }),
        fetchApi,
      ),
    ),
  ];
}

function document(
  directory: string,
  definition: ReferenceDocumentDefinition,
  load: () => Promise<unknown>,
): ReferenceDocument {
  // Cache parsed metadata per owner, not a process-global credential or dataset.
  let current: Promise<unknown> | undefined;

  const read = createFileBackedResolver(
    join(directory, `${definition.name}.json`),
    load,
    (raw) => definition.schema.parse(raw),
  );

  return createReferenceDocumentResource(definition, () => {
    current ??= read().catch((error: unknown) => {
      current = undefined;
      throw error;
    });

    return current;
  });
}
