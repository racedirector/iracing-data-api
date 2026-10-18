/** Generic authenticated request and document-output execution for CLI commands. */
import { mapDataApiRequestError } from "../errors.js";
import type { CredentialOptions } from "../credentials.js";
import type { Diagnostics } from "../diagnostics.js";
import type { TokenOutputOptions } from "../token-output.js";

/** Public CLI inputs needed by an authenticated document request. */
export type DocumentInput = Pick<CredentialOptions, "credentials"> &
  Pick<TokenOutputOptions, "output" | "format" | "force">;

/** A command's policy for fetching and presenting one document. */
export interface DocumentRequest<T> {
  /** Parsed request and output options. */
  input: DocumentInput;

  /**
   * Retrieve command data with a resolved access token, independently of SDK choice.
   * @param {string} accessToken - Token authorized for the request.
   * @returns {Promise<T>} Data to publish.
   */
  fetch(accessToken: string): Promise<T>;

  /** Name used in secret-safe request errors. */
  operation: string;

  /** Optional OAuth scope hint in authentication errors. */
  requiredScope?: string;

  /** Existing writer's output label. */
  outputLabel: NonNullable<TokenOutputOptions["outputLabel"]>;

  /** Secret-safe diagnostic emitted only after successful publication. */
  successMessage: string;
}

/** Executor independent of Commander and of any particular API transport. */
export interface DocumentRequestService {
  /**
   * Resolve authentication, fetch data, and publish it using injected I/O.
   * @param {DocumentRequest<T>} request - Command-provided operation and output policy.
   * @returns {Promise<void>} Completion of the operation and output.
   */
  execute<T>(request: DocumentRequest<T>): Promise<void>;
}

/** External effects supplied by the application registrar. */
export interface DocumentRequestDependencies {
  /** Secret-safe diagnostic sink. */
  diagnostics: Pick<Diagnostics, "info">;

  /**
   * Resolve one token using the application's selected credential policy.
   * @param {CredentialOptions} options - Credential selection.
   * @returns {Promise<string>} Access token.
   */
  resolveAccessToken(options: CredentialOptions): Promise<string>;

  /**
   * Publish arbitrary command data through the existing secure output writer.
   * @param {unknown} document - Data returned by the request operation.
   * @param {TokenOutputOptions} options - Format and destination choices.
   * @returns {Promise<void>} Completed output.
   */
  writeDocumentOutput(
    document: unknown,
    options: TokenOutputOptions,
  ): Promise<void>;
}

/**
 * Construct the shared request/output workflow without performing any I/O.
 * @param {DocumentRequestDependencies} dependencies - Credential, writer, and diagnostic capabilities.
 * @returns {DocumentRequestService} Transport- and data-agnostic executor.
 */
export function makeDocumentRequestService(
  dependencies: DocumentRequestDependencies,
): DocumentRequestService {
  return {
    async execute(request) {
      const accessToken = await dependencies.resolveAccessToken(request.input);

      let document: Awaited<ReturnType<typeof request.fetch>>;

      try {
        document = await request.fetch(accessToken);
      } catch (error) {
        throw mapDataApiRequestError(error, {
          operation: request.operation,
          requiredScope: request.requiredScope,
        });
      }

      await dependencies.writeDocumentOutput(document, {
        ...request.input,
        outputLabel: request.outputLabel,
      });

      dependencies.diagnostics.info(request.successMessage);
    },
  };
}
