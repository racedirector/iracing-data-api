import { Command } from "@commander-js/extra-typings";
import { resolveAccessToken, type CredentialOptions } from "../credentials.js";
import {
  resolveTokenFormat,
  writeDocumentOutput,
  type TokenOutputOptions,
} from "../token-output.js";
import type { Diagnostics } from "../diagnostics.js";

type DocsOptions = TokenOutputOptions &
  CredentialOptions & {
    snapshot?: boolean;
    fetcher?: typeof fetch;
  };

export async function fetchDocs(options: DocsOptions = {}) {
  resolveTokenFormat(options.output, options.format);
  const token = await resolveAccessToken(options);
  // This private repository CLI shares fixed-source capture, timeout, redaction
  // and provenance with the upstream evidence tool instead of duplicating them.
  const toolingUrl = new URL(
    "../../../../scripts/upstream-contract.mjs",
    import.meta.url,
  );
  const { capture } = await import(toolingUrl.href);
  let snapshot;
  try {
    snapshot = await capture("data", { token, fetcher: options.fetcher });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Documentation request failed";
    if (/HTTP 401|HTTP 403/.test(message))
      throw new Error(
        `${message}. Check token expiry, iracing.auth scope and account access; obtain a new token with auth login.`,
      );
    throw new Error(message);
  }
  return options.snapshot ? snapshot : snapshot.content;
}

export function createDocsCommand(diagnostics: Diagnostics) {
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
    .option(
      "--snapshot",
      "Include normalized evidence hash and live capture provenance",
    )
    .option("--force", "Replace an existing output file")
    .action(async (options) => {
      const docs = await fetchDocs(options);
      await writeDocumentOutput(docs, {
        ...options,
        outputLabel: "Documentation",
      });
      diagnostics.info("Data API documentation captured.");
    });
}
