/** Documentation command behavior independent of Commander and request I/O. */
import { IRacingAPI } from "../api.js";
import type { DocumentRequestService } from "./request.js";
import type { DocsOptions } from "../commands/docs-schema.js";

/** The docs command's independently executable contract. */
export interface DocsService {
  /**
   * Fetch and publish the complete Data API documentation.
   * @param {DocsOptions} options - Parsed documentation CLI input.
   * @returns {Promise<void>} Completion of output.
   */
  execute(options: DocsOptions): Promise<void>;
}

/**
 * Bind the docs operation to shared, injected request/output execution.
 * The generated SDK is a private implementation choice of this command.
 * @param {DocumentRequestService} requests - Shared authenticated request executor.
 * @returns {DocsService} Docs command handler.
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
