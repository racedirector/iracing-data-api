/** Docs-specific fetch routine over the shared authenticated request executor. */
import { IRacingAPI } from "../../api.js";
import type { DocumentRequestService } from "../../services/request.js";
import type { Options } from "./schema.js";

/** Independently callable documentation execution contract. */
export interface DocsService {
  /**
   * Fetch and publish the complete Data API documentation.
   * @param {Options} options - Validated documentation options.
   * @returns {Promise<void>} Completion after output publication.
   */
  execute(options: Options): Promise<void>;
}

/**
 * Bind the docs-specific API operation to injected generic request execution.
 * @param {DocumentRequestService} requests - Shared authenticated request service.
 * @returns {DocsService} Documentation command handler.
 */
export function makeDocsService(requests: DocumentRequestService): DocsService {
  return {
    execute(options) {
      return requests.execute({
        input: options,
        fetch: (accessToken) =>
          IRacingAPI.withAccessToken(accessToken).doc.getDocs(),
        operation: "documentation",
        requiredScope: "iracing.auth",
        outputLabel: "Documentation",
        successMessage: "Data API documentation fetched.",
      });
    },
  };
}
