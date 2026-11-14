import type { CredentialOptions } from "../../credentials.js";
import type { ResultsGetParametersSchema } from "@iracing-data/api-schema";
import type { z } from "zod";

/** Canonical, parsed Data API results query. */
export type ResultsQuery = z.output<typeof ResultsGetParametersSchema>;

/** Validated invocation with only API credential selection. */
export interface ResultsOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Query passed to the results endpoint. */
  query: ResultsQuery;
}
