import { z } from "zod";
import { Id, text } from "../primitives.js";

/** Strict no-argument input contract for the authenticated member tool. */
export const SelfInput = z.strictObject({});

/** Project only the current member's customer identifier and display name. */
export const DriverProjection = z.object({
  cust_id: Id,
  display_name: text.min(1),
});

export type Driver = z.infer<typeof DriverProjection>;
