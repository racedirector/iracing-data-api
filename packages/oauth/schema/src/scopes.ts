import { z } from "zod";
import { OAuthScopesSchema, OAuthScopesStringSchema } from "./schema";

/**
 * Canonical domain representation for one or more iRacing OAuth scopes.
 *
 * Individual scope vocabulary remains owned by `OAuthScopesSchema`; this
 * schema only defines the collection shape shared by protocol consumers.
 */
export const OAuthScopeListSchema = z.array(OAuthScopesSchema).min(1).meta({
  id: "oauthScopeList",
  title: "OAuth scopes",
  description: "One or more valid iRacing OAuth scopes.",
});

/**
 * Codec between the OAuth wire representation (whitespace-delimited string)
 * and the canonical domain representation (validated scope array).
 */
export const OAuthScopeListCodec = z.codec(
  OAuthScopesStringSchema,
  OAuthScopeListSchema,
  {
    decode: (value) => value.trim().split(/\s+/),
    encode: (value) => value.join(" "),
  },
);

export type OAuthScopeList = z.infer<typeof OAuthScopeListSchema>;
