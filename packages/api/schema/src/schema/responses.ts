import { z } from "zod";

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

export const ServiceMethodParametersDocsResponseSchema = z
  .object({
    type: z.string(),
    note: z.string().optional(),
    required: z.coerce.boolean().optional(),
  })
  .meta({
    description: "An iRacing API Service Method Parameters object.",
    id: "iracingServiceMethodParametersDocs",
  });

export const ServiceMethodDocsResponseSchema = z
  .object({
    link: z.url(),
    parameters: z.record(z.string(), ServiceMethodParametersDocsResponseSchema),
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
 * Route link responses.
 * These are provided as a convenience and are non-exhaustive.
 */

export const GetCarAssetsResponseSchema = z.record(z.number(), z.unknown());

export const GetCarResponseSchema = z.array(
  z.object({
    car_id: z.number(),
  }),
);

export const GetTrackAssetsResponseSchema = z.record(
  z.number(),
  z.object({
    track_id: z.number(),
    track_map: z.string(),
    track_map_layers: z.record(z.string(), z.string()),
  }),
);

export const GetTrackResponseSchema = z.array(
  z.object({
    track_id: z.number(),
  }),
);

/**
 * Types
 */

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type APIResponse = z.infer<typeof APIResponseSchema>;

export type ServiceMethodParametersDocsResponse = z.infer<
  typeof ServiceMethodParametersDocsResponseSchema
>;
export type ServiceMethodDocsResponse = z.infer<
  typeof ServiceMethodDocsResponseSchema
>;
export type ServiceDocsResponse = z.infer<typeof ServiceDocsResponseSchema>;
export type ServicesDocsResponse = z.infer<typeof ServicesDocsResponseSchema>;

export type GetCarAssetsResponse = z.infer<typeof GetCarAssetsResponseSchema>;
export type GetCarResponse = z.infer<typeof GetCarResponseSchema>;
export type GetTrackAssetsResponse = z.infer<
  typeof GetTrackAssetsResponseSchema
>;
export type GetTrackResponse = z.infer<typeof GetTrackResponseSchema>;

// Historical exports stay in their original module for import compatibility.
/** @deprecated Use ErrorResponseSchema instead. */
export const IRacingErrorResponseSchema = ErrorResponseSchema;
/** @deprecated Use APIResponseSchema instead. */
export const IRacingAPIResponseSchema = APIResponseSchema;
/** @deprecated Use ServiceMethodParametersDocsResponseSchema instead. */
export const IRacingServiceMethodParametersDocsResponseSchema =
  ServiceMethodParametersDocsResponseSchema;
/** @deprecated Use ServiceMethodDocsResponseSchema instead. */
export const IRacingServiceMethodDocsResponseSchema =
  ServiceMethodDocsResponseSchema;
/** @deprecated Use ServiceDocsResponseSchema instead. */
export const IRacingServiceDocsResponseSchema = ServiceDocsResponseSchema;
/** @deprecated Use ServicesDocsResponseSchema instead. */
export const IRacingServicesDocsResponseSchema = ServicesDocsResponseSchema;
/** @deprecated Use GetCarAssetsResponseSchema instead. */
export const IRacingGetCarAssetsResponseSchema = GetCarAssetsResponseSchema;
/** @deprecated Use GetCarResponseSchema instead. */
export const IRacingGetCarResponseSchema = GetCarResponseSchema;
/** @deprecated Use GetTrackAssetsResponseSchema instead. */
export const IRacingGetTrackAssetsResponseSchema = GetTrackAssetsResponseSchema;
/** @deprecated Use GetTrackResponseSchema instead. */
export const IRacingGetTrackResponseSchema = GetTrackResponseSchema;
/** @deprecated Use ErrorResponse instead. */
export type IRacingErrorResponse = ErrorResponse;
/** @deprecated Use APIResponse instead. */
export type IRacingAPIResponse = APIResponse;
/** @deprecated Use ServiceMethodParametersDocsResponse instead. */
export type IRacingServiceMethodParametersDocsResponse =
  ServiceMethodParametersDocsResponse;
/** @deprecated Use ServiceMethodDocsResponse instead. */
export type IRacingServiceMethodDocsResponse = ServiceMethodDocsResponse;
/** @deprecated Use ServiceDocsResponse instead. */
export type IRacingServiceDocsResponse = ServiceDocsResponse;
/** @deprecated Use ServicesDocsResponse instead. */
export type IRacingServicesDocsResponse = ServicesDocsResponse;
/** @deprecated Use GetCarAssetsResponse instead. */
export type IRacingGetCarAssetsResponse = GetCarAssetsResponse;
/** @deprecated Use GetCarResponse instead. */
export type IRacingGetCarResponse = GetCarResponse;
/** @deprecated Use GetTrackAssetsResponse instead. */
export type IRacingGetTrackAssetsResponse = GetTrackAssetsResponse;
/** @deprecated Use GetTrackResponse instead. */
export type IRacingGetTrackResponse = GetTrackResponse;
