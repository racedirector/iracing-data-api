import { InvalidArgumentError } from "@commander-js/extra-typings";
import * as z from "zod";

export const CustomerIdsSchema = z.string().superRefine((value, ctx) => {
  const trimmed = value.trim();

  if (!trimmed.includes(",")) {
    ctx.addIssue({
      code: "custom",
      message:
        'Expected a comma-separated list with at least two customer IDs, e.g. "123,456".',
    });
    return;
  }

  const parts = trimmed.split(",").map((part) => part.trim());

  if (parts.some((part) => part.length === 0)) {
    ctx.addIssue({
      code: "custom",
      message:
        "Customer IDs cannot contain empty values. Remove leading, trailing, or repeated commas.",
    });
  }

  for (const part of parts) {
    if (part.length > 0 && !/^\d+$/.test(part)) {
      ctx.addIssue({
        code: "custom",
        message: `Invalid customer ID "${part}". Customer IDs must be numeric.`,
      });
    }
  }
});

export const parseCustomerIds = (value: string): string => {
  const result = CustomerIdsSchema.safeParse(value);

  if (!result.success) {
    throw new InvalidArgumentError(
      result.error.issues.map((issue) => issue.message).join(" "),
    );
  }

  return result.data;
};
