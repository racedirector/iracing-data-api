/** Documentation command: validate input, request documentation, and publish it. */
import { Command } from "@commander-js/extra-typings";
import { IRacingAPI } from "../api.js";
import { resolveAccessToken, type CredentialOptions } from "../credentials.js";
import {
  resolveTokenFormat,
  writeDocumentOutput,
  type TokenOutputOptions,
} from "../token-output.js";
import type { Diagnostics } from "../diagnostics.js";

/** Existing credential and document-output options. */
export type DocsOptions = TokenOutputOptions & CredentialOptions;

/**
 * Read a numeric response status from an Error named ResponseError, returning
 * undefined for other error shapes.
 */
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

/**
 * Return a new error with authentication advice for HTTP 401/403, service advice
 * for other recognized statuses, or network advice otherwise. Original messages
 * and response bodies are omitted, including for non-HTTP failures.
 */
function mapDocumentationError(error: unknown): Error {
  const status = responseStatus(error);

  if (status === 401 || status === 403) {
    return new Error(
      `Data API documentation request failed with HTTP ${String(status)}. Check token expiry, iracing.auth scope and account access; obtain a new token with auth login.`,
      { cause: error },
    );
  }

  if (status !== undefined) {
    return new Error(
      `Data API documentation request failed with HTTP ${String(status)}. Try again; if the failure persists, check iRacing service availability.`,
      { cause: error },
    );
  }

  return new Error(
    "Data API documentation request failed. Check network connectivity and try again.",
    { cause: error },
  );
}

/**
 * Register the docs command without credential, network, or output I/O.
 * @param {object} root0 - Command presentation configuration.
 * @param {Diagnostics} root0.diagnostics - Secret-safe progress sink.
 * @returns {Command} Configured docs command.
 */
export function createDocsCommand({
  diagnostics,
}: {
  diagnostics: Diagnostics;
}) {
  return new Command("docs")
    .description("Fetch the complete authenticated Data API documentation once")
    .option(
      "-o, --output <path>",
      "Write documentation to a file instead of stdout",
    )
    .option(
      "--credentials <path>",
      "Read access_token from an auth login JSON or YAML file",
    )
    .option("--format <json|yaml>", "Documentation serialization format")
    .option("--force", "Replace an existing output file")
    .action(async (options) => {
      const format = resolveTokenFormat(options.output, options.format);

      const accessToken = await resolveAccessToken(options);

      const api = IRacingAPI.withAccessToken(accessToken);

      const doc = api.doc;

      let document: Awaited<ReturnType<typeof doc.getDocs>>;

      try {
        document = await doc.getDocs();
      } catch (error) {
        throw mapDocumentationError(error);
      }

      await writeDocumentOutput(document, {
        ...options,
        format,
        outputLabel: "Documentation",
      });
      diagnostics.info("Data API documentation fetched.");
    });
}
