import { z } from "zod";

export const IRacingErrorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string().optional(),
    note: z.string().optional(),
  })
  .meta({
    id: "errorResponse",
  });

export const IRacingAPIResponseSchema = z
  .object({
    link: z.url().meta({ description: "A link to the cached data" }),
    expires: z.iso.datetime(),
  })
  .meta({
    description: "Response from iRacing `/data` API.",
    id: "iracingAPIResponse",
  });

export const IRacingServiceMethodParametersDocsResponseSchema = z
  .object({
    type: z.string(),
    note: z.string().optional(),
    required: z.coerce.boolean().optional(),
  })
  .meta({
    description: "An iRacing API Service Method Parameters object.",
    id: "iracingServiceMethodParametersDocs",
  });

export const IRacingServiceMethodDocsResponseSchema = z
  .object({
    link: z.url(),
    parameters: z.record(
      z.string(),
      IRacingServiceMethodParametersDocsResponseSchema
    ),
    expirationSeconds: z.coerce.number().optional(),
  })
  .meta({
    description: "An iRacing API Service Method object.",
    id: "iracingServiceMethodDocs",
  });

export const IRacingServiceDocsResponseSchema = z
  .record(z.string(), IRacingServiceMethodDocsResponseSchema)
  .meta({
    description:
      "An index of service methods available for the requested service.",
    id: "iracingServiceDocs",
  });

export const IRacingServicesDocsResponseSchema = z
  .record(z.string(), IRacingServiceDocsResponseSchema)
  .meta({
    description: "An index of available services on the iRacing API.",
    id: "iracingServicesDocs",
  });

/**
 * Route link responses.
 * These are provided as a convenience and are non-exhaustive.
 */

export const IRacingGetCarAssetsResponseSchema = z.record(
  z.number(),
  z.unknown()
);

export const IRacingGetCarResponseSchema = z.array(
  z.object({
    car_id: z.number(),
  })
);

export const IRacingGetTrackAssetsResponseSchema = z.record(
  z.number(),
  z.object({
    track_id: z.number(),
    track_map: z.string(),
    track_map_layers: z.record(z.string(), z.string()),
  })
);

export const IRacingGetTrackResponseSchema = z.array(
  z.object({
    track_id: z.number(),
  })
);

/**
 * Types
 */

export type IRacingErrorResponse = z.infer<typeof IRacingErrorResponseSchema>;
export type IRacingAPIResponse = z.infer<typeof IRacingAPIResponseSchema>;

export type IRacingServiceMethodParametersDocsResponse = z.infer<
  typeof IRacingServiceMethodParametersDocsResponseSchema
>;
export type IRacingServiceMethodDocsResponse = z.infer<
  typeof IRacingServiceMethodDocsResponseSchema
>;
export type IRacingServiceDocsResponse = z.infer<
  typeof IRacingServiceDocsResponseSchema
>;
export type IRacingServicesDocsResponse = z.infer<
  typeof IRacingServicesDocsResponseSchema
>;

export type IRacingGetCarAssetsResponse = z.infer<
  typeof IRacingGetCarAssetsResponseSchema
>;
export type IRacingGetCarResponse = z.infer<typeof IRacingGetCarResponseSchema>;
export type IRacingGetTrackAssetsResponse = z.infer<
  typeof IRacingGetTrackAssetsResponseSchema
>;
export type IRacingGetTrackResponse = z.infer<
  typeof IRacingGetTrackResponseSchema
>;
