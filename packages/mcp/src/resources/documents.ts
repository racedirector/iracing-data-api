import {
  LicenseDefinitionsPayloadSchema,
  ReferenceValuesPayloadSchema,
} from "@iracing-data/api-schema";
import { INTERNAL_ERROR, ProtocolError } from "@modelcontextprotocol/server";
import { createResourceSchema, registerResourceSchemas } from "./schemas.js";
import type { ResourceSchema } from "./schemas.js";
import type { McpServer } from "@modelcontextprotocol/server";
import type { z } from "zod";

/** A small reference document without an invented entity/index contract. */
export interface ReferenceDocument {
  /** Resource URI suffix under iracing://. */
  readonly name: string;

  /** Human-readable title. */
  readonly title: string;

  /** Interpretation and usage guidance. */
  readonly description: string;

  /** Standalone schema documentation. */
  readonly schemas?: readonly ResourceSchema[];

  /**
   * Host-owned lazy document access.
   * @returns {Promise<unknown>} Raw reference payload.
   */
  readonly read: () => Promise<unknown>;
}

/** Authored reference metadata and partial payload validation. */
export interface ReferenceDocumentDefinition extends Pick<
  ReferenceDocument,
  "name" | "title" | "description"
> {
  /** Canonical payload schema; unknown upstream properties remain intact. */
  readonly schema: z.ZodType;
}

/** Small, non-personal reference datasets selected explicitly by the host. */
export const ReferenceDocuments = {
  categories: {
    name: "categories",
    title: "iRacing Categories",
    description:
      "Upstream category labels and numeric values for interpreting category_id in race results and metadata.",
    schema: ReferenceValuesPayloadSchema,
  },
  eventTypes: {
    name: "event-types",
    title: "iRacing Event Types",
    description:
      "Upstream event-type labels and values for interpreting and filtering race results.",
    schema: ReferenceValuesPayloadSchema,
  },
  divisions: {
    name: "divisions",
    title: "iRacing Divisions",
    description:
      "Upstream division labels and values. Preserve sentinel values, including -1 (ALL); do not treat numeric values as display ranks.",
    schema: ReferenceValuesPayloadSchema,
  },
  licenses: {
    name: "licenses",
    title: "iRacing License Definitions",
    description:
      "License groups with nested license-level definitions. This is reference data, not a member's current license or a guarantee of series eligibility.",
    schema: LicenseDefinitionsPayloadSchema,
  },
} satisfies Record<string, ReferenceDocumentDefinition>;

/**
 * Pair reference documentation with host-owned access.
 * @param {ReferenceDocumentDefinition} definition - Authored reference contract.
 * @param {() => Promise<unknown>} read - Lazy host data resolver.
 * @returns {ReferenceDocument} Registerable reference document.
 */
export function createReferenceDocumentResource(
  definition: ReferenceDocumentDefinition,
  read: () => Promise<unknown>,
): ReferenceDocument {
  return {
    name: definition.name,
    title: definition.title,
    description: definition.description,
    read,
    schemas: [
      createResourceSchema(
        definition.name,
        `${definition.title} schema`,
        definition.schema,
      ),
    ],
  };
}

/**
 * Register raw reference documents and their separate schema resources.
 * @param {Pick<McpServer, "registerResource">} server - Caller-owned registration surface.
 * @param {readonly ReferenceDocument[]} documents - Host-selected document access.
 */
export function registerReferenceDocuments(
  server: Pick<McpServer, "registerResource">,
  documents: readonly ReferenceDocument[],
): void {
  for (const document of documents) {
    registerResourceSchemas(server, document.schemas ?? []);
    server.registerResource(
      document.name,
      `iracing://${document.name}`,
      {
        title: document.title,
        mimeType: "application/json",
        annotations: { audience: ["user", "assistant"] },
        description: `${document.description} Returned as raw JSON. Data loading and refresh policy are managed by the host.`,
      },
      async (uri) => {
        try {
          return {
            contents: [
              {
                uri: uri.href,
                mimeType: "application/json",
                text: JSON.stringify(await document.read()),
              },
            ],
          };
        } catch {
          throw new ProtocolError(
            INTERNAL_ERROR,
            "Unable to load reference document.",
          );
        }
      },
    );
  }
}
