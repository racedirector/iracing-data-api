/**
 * Authored maintained response acceptance and inferred public types.
 *
 * Distinguish direct payloads from expiring cache-link envelopes: APIResponseSchema
 * is a link/expires contract, constants are direct arrays of unspecified objects,
 * and results search is a direct manifest. Convenient linked payload schemas are
 * non-exhaustive; do not present them as proof of full upstream response coverage.
 * The OpenAPI helper owns endpoint-to-response mapping, not this export inventory.
 *
 * Documentation methods may omit parameters; note is a string or string array.
 * Descriptions/IDs in Zod metadata feed the authored OpenAPI document and generated
 * endpoint/model docs. Comments explain ownership without modifying those outputs.
 * Changing wire acceptance requires upstream evidence, public compatibility review
 * and tests; do not infer upstream drift from a generated type or stale overview.
 * Historical aliases below retain canonical value/type identity and metadata IDs.
 */
import { z } from "zod";
import { BooleanParameterSchema } from "./primitives";

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string().optional(),
    note: z.string().optional(),
  })
  .meta({
    id: "errorResponse",
  });

export const APIResponseSchema = z
  .object({
    link: z.url().meta({ description: "A link to the cached data" }),
    expires: z.iso.datetime(),
  })
  .meta({
    description: "Response from iRacing `/data` API.",
    id: "iracingAPIResponse",
  });

// The official constants docs establish an array of objects, but not their fields.
export const ConstantsResponseSchema = z
  .array(z.record(z.string(), z.unknown()))
  .meta({ id: "iracingConstantsResponse" });

export const ResultsSearchSeriesResponseSchema = z
  .object({
    type: z.literal("search_series_results"),
    data: z.object({
      success: z.boolean(),
      chunk_info: z.object({
        chunk_size: z.number().int().nonnegative(),
        num_chunks: z.number().int().nonnegative(),
        rows: z.number().int().nonnegative(),
        base_download_url: z.url(),
        chunk_file_names: z.array(z.string()),
      }),
      params: z.record(z.string(), z.unknown()),
    }),
  })
  .meta({
    description: "Direct manifest response from `/data/results/search_series`.",
    id: "resultsSearchSeriesResponse",
  });

export const ServiceMethodParametersDocsResponseSchema = z
  .object({
    type: z.string(),
    note: z.string().optional(),
    required: BooleanParameterSchema.optional(),
  })
  .meta({
    description: "An iRacing API Service Method Parameters object.",
    id: "iracingServiceMethodParametersDocs",
  });

export const ServiceMethodDocsResponseSchema = z
  .object({
    link: z.url(),
    parameters: z
      .record(z.string(), ServiceMethodParametersDocsResponseSchema)
      .optional(),
    note: z
      .union([z.string(), z.array(z.string())])
      .meta({ unionOneOf: true })
      .optional(),
    expirationSeconds: z.coerce.number().optional(),
  })
  .meta({
    description: "An iRacing API Service Method object.",
    id: "iracingServiceMethodDocs",
  });

export const ServiceDocsResponseSchema = z
  .record(z.string(), ServiceMethodDocsResponseSchema)
  .meta({
    description:
      "An index of service methods available for the requested service.",
    id: "iracingServiceDocs",
  });

export const ServicesDocsResponseSchema = z
  .record(z.string(), ServiceDocsResponseSchema)
  .meta({
    description: "An index of available services on the iRacing API.",
    id: "iracingServicesDocs",
  });

/**
 * Types.
 */

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type APIResponse = z.infer<typeof APIResponseSchema>;
export type ConstantsResponse = z.infer<typeof ConstantsResponseSchema>;
export type ResultsSearchSeriesResponse = z.infer<
  typeof ResultsSearchSeriesResponseSchema
>;

export type ServiceMethodParametersDocsResponse = z.infer<
  typeof ServiceMethodParametersDocsResponseSchema
>;
export type ServiceMethodDocsResponse = z.infer<
  typeof ServiceMethodDocsResponseSchema
>;
export type ServiceDocsResponse = z.infer<typeof ServiceDocsResponseSchema>;
export type ServicesDocsResponse = z.infer<typeof ServicesDocsResponseSchema>;

// Historical exports stay in their original module for import compatibility.
/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ErrorResponseSchema instead.
 */
export const IRacingErrorResponseSchema = ErrorResponseSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use APIResponseSchema instead.
 */
export const IRacingAPIResponseSchema = APIResponseSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ServiceMethodParametersDocsResponseSchema instead.
 */
export const IRacingServiceMethodParametersDocsResponseSchema =
  ServiceMethodParametersDocsResponseSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ServiceMethodDocsResponseSchema instead.
 */
export const IRacingServiceMethodDocsResponseSchema =
  ServiceMethodDocsResponseSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ServiceDocsResponseSchema instead.
 */
export const IRacingServiceDocsResponseSchema = ServiceDocsResponseSchema;

/**
 * Retains the historical import name with the same runtime value and identity.
 * @deprecated Use ServicesDocsResponseSchema instead.
 */
export const IRacingServicesDocsResponseSchema = ServicesDocsResponseSchema;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ErrorResponse instead.
 */
export type IRacingErrorResponse = ErrorResponse;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use APIResponse instead.
 */
export type IRacingAPIResponse = APIResponse;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ServiceMethodParametersDocsResponse instead.
 */
export type IRacingServiceMethodParametersDocsResponse =
  ServiceMethodParametersDocsResponse;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ServiceMethodDocsResponse instead.
 */
export type IRacingServiceMethodDocsResponse = ServiceMethodDocsResponse;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ServiceDocsResponse instead.
 */
export type IRacingServiceDocsResponse = ServiceDocsResponse;

/**
 * Retains the historical type name with identical assignability to the canonical contract.
 * @deprecated Use ServicesDocsResponse instead.
 */
export type IRacingServicesDocsResponse = ServicesDocsResponse;
