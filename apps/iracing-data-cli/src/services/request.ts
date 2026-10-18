/** Generic authenticated request and document-output execution for CLI commands. */
import { z } from "zod";
import { mapDataApiRequestError } from "../errors.js";
import type { Diagnostics } from "../diagnostics.js";

/** Supported output formats for authenticated document commands. */
export const DocumentFormatSchema = z.enum(["json", "yaml"], {
  error: ({ input }) => "Unsupported output format: " + String(input),
});

/** Parsed, normalized input accepted by the shared request/output routine. */
export const DocumentInputSchema = z.strictObject({
  credentials: z.string().optional(),
  output: z.string().optional(),
  format: DocumentFormatSchema,
  force: z.boolean().optional(),
});

/** Shared authenticated-document input derived from its authoritative schema. */
export type DocumentInput = z.output<typeof DocumentInputSchema>;

/** Document presentation options owned by the shared request/output workflow. */
export const DocumentOutputSchema = DocumentInputSchema.extend({
  outputLabel: z.enum(["Credential", "Documentation"]),
});

/** Writer options derived from the shared request's output schema. */
export type DocumentOutput = z.output<typeof DocumentOutputSchema>;

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
  outputLabel: DocumentOutput["outputLabel"];

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
   * @param {Pick<DocumentInput, "credentials">} options - Credential selection.
   * @returns {Promise<string>} Access token.
   */
  resolveAccessToken(options: Pick<DocumentInput, "credentials">): Promise<string>;

  /**
   * Publish arbitrary command data through the existing secure output writer.
   * @param {unknown} document - Data returned by the request operation.
   * @param {DocumentOutput} options - Format and destination choices.
   * @returns {Promise<void>} Completed output.
   */
  writeDocumentOutput(
    document: unknown,
    options: DocumentOutput,
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
