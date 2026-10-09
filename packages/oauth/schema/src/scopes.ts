/**
 * Shared OAuth scope representation, separate from application scope policy.
 *
 * schema.ts owns allowed individual scope literals. This module owns a nonempty
 * validated list and its whitespace-string codec; encoding preserves list order.
 * The wire string schema and decoded list have different acceptance boundaries.
 * A consumer must not infer that every string is a supported application scope set;
 * CLI login and MCP enforce their own narrower resource/profile requirements.
 * Do not copy their default scope selection into this reusable representation.
 */
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
    decode: (value) => value.trim().split(/\s+/) as OAuthScopeList,
    encode: (value) => value.join(" "),
  },
);

export type OAuthScopeList = z.infer<typeof OAuthScopeListSchema>;
