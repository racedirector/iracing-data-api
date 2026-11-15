import { z } from "zod";
import { Id, text } from "./tools/primitives.js";

/** Validates and projects only the customer identifier and display name. */
export const DriverProjection = z.object({
  cust_id: Id,
  display_name: text.min(1),
});

export type Driver = z.infer<typeof DriverProjection>;

/** Transport-independent driver query for a host-selected principal. */
export interface DriverQueries {
  getCurrent(options: { signal: AbortSignal }): Promise<Driver>;
}
