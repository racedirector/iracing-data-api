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

/** Validates the Data API error message and optional explanatory fields. */
export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string().optional(),
    note: z.string().optional(),
  })
  .meta({
    id: "errorResponse",
  });

/** Validates the cached-data URL and expiry returned by modeled Data API endpoints. */
export const APIResponseSchema = z
  .object({
    link: z.url().meta({ description: "A link to the cached data" }),
    expires: z.iso.datetime(),
  })
  .meta({
    description: "Response from iRacing `/data` API.",
    id: "iracingAPIResponse",
  });

/** Validates the directly returned league roster metadata and download reference. */
export const LeagueRosterResponseSchema = z
  .object({
    type: z.literal("league_roster"),
    data: z.object({
      success: z.boolean(),
      subscribed: z.boolean(),
      roster_count: z.int().nonnegative(),
      league_id: z.number(),
    }),
    data_url: z.url(),
  })
  .meta({
    description:
      "Direct metadata and roster download URL observed from `/data/league/roster`.",
    id: "leagueRosterResponse",
  });

/** Validates directly returned member award metadata and its download reference. */
export const MemberAwardsResponseSchema = z
  .object({
    type: z.literal("member_awards"),
    data: z.object({
      success: z.boolean(),
      cust_id: z.number(),
      award_count: z.int().nonnegative(),
    }),
    data_url: z.url(),
  })
  .meta({
    id: "memberAwardsResponse",
    description:
      "Direct metadata and award download URL observed from /data/member/awards.",
  });

/** Validates directly returned award-instance metadata and its download reference. */
export const MemberAwardInstancesResponseSchema =
  MemberAwardsResponseSchema.extend({
    type: z.literal("member_award_instances"),
    data: MemberAwardsResponseSchema.shape.data.extend({
      award_id: z.number(),
    }),
  }).meta({
    id: "memberAwardInstancesResponse",
    description:
      "Direct metadata and award-instance download URL observed from /data/member/award_instances.",
  });

// The official constants docs establish an array of objects, but not their fields.
/** Validates constant rows without inventing contracts for their dynamic fields. */
export const ConstantsResponseSchema = z
  .array(z.record(z.string(), z.unknown()))
  .meta({ id: "iracingConstantsResponse" });

/** Validates series-search success, chunk metadata, and echoed search parameters. */
export const ResultsSearchSeriesResponseSchema = z
  .object({
    type: z.literal("search_series_results"),
    data: z.object({
      success: z.boolean(),
      chunk_info: z.object({
        chunk_size: z.int().nonnegative(),
        num_chunks: z.int().nonnegative(),
        rows: z.int().nonnegative(),
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

/** Validates hosted-search success, chunk metadata, and echoed search parameters. */
export const ResultsSearchHostedResponseSchema =
  ResultsSearchSeriesResponseSchema.extend({
    type: z.literal("search_hosted_results"),
  }).meta({
    description: "Direct manifest response from `/data/results/search_hosted`.",
    id: "resultsSearchHostedResponse",
  });

/** Validates the directly returned world-record chunk manifest. */
export const StatsWorldRecordsResponseSchema = z
  .object({
    type: z.literal("stats_world_records"),
    data: z.object({
      success: z.boolean(),
      car_id: z.number(),
      track_id: z.number(),
      chunk_info: ResultsSearchSeriesResponseSchema.shape.data.shape.chunk_info,
      last_updated: z.string(),
    }),
  })
  .meta({
    id: "statsWorldRecordsResponse",
    description:
      "Direct world-record chunk manifest observed from /data/stats/world_records.",
  });

/** Validates a documented method parameter and its optional note and required flag. */
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

/** Validates a documented endpoint link, optional parameter map, and string or array notes. */
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

/** Validates the method-name index for one documented Data API service. */
export const ServiceDocsResponseSchema = z
  .record(z.string(), ServiceMethodDocsResponseSchema)
  .meta({
    description:
      "An index of service methods available for the requested service.",
    id: "iracingServiceDocs",
  });

/** Validates the service-name index for the Data API documentation tree. */
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
export type LeagueRosterResponse = z.infer<typeof LeagueRosterResponseSchema>;
export type MemberAwardsResponse = z.infer<typeof MemberAwardsResponseSchema>;
export type MemberAwardInstancesResponse = z.infer<
  typeof MemberAwardInstancesResponseSchema
>;
export type StatsWorldRecordsResponse = z.infer<
  typeof StatsWorldRecordsResponseSchema
>;
export type ConstantsResponse = z.infer<typeof ConstantsResponseSchema>;
export type ResultsSearchSeriesResponse = z.infer<
  typeof ResultsSearchSeriesResponseSchema
>;
export type ResultsSearchHostedResponse = z.infer<
  typeof ResultsSearchHostedResponseSchema
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
