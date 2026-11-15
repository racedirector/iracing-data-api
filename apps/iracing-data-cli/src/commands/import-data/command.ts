import { Command } from "@commander-js/extra-typings";
import {
  MemberGetParametersSchema,
  MemberAwardsParametersSchema,
  MemberAwardInstancesParametersSchema,
  MemberChartDataParametersSchema,
  MemberProfileParametersSchema,
  ResultsSearchHostedParametersSchema,
} from "@iracing-data/api-schema";
import { z } from "zod";
import { readCredentialOptions } from "../../schema.js";
import type { CredentialOptions } from "../../credentials.js";

/** Validated import-support requests. */
export const ImportRequestSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("member-awards"),
    query: MemberAwardsParametersSchema,
  }),
  z.object({
    operation: z.literal("member-award-instances"),
    query: MemberAwardInstancesParametersSchema,
  }),
  z.object({
    operation: z.literal("member-chart-data"),
    query: MemberChartDataParametersSchema,
  }),
  z.object({
    operation: z.literal("member-profile"),
    query: MemberProfileParametersSchema,
  }),
  z.object({
    operation: z.enum(["member-info", "member-participation-credits"]),
    query: z.object({}),
  }),
  z.object({
    operation: z.literal("member"),
    query: MemberGetParametersSchema,
  }),
  z.object({
    operation: z.literal("search-hosted"),
    query: ResultsSearchHostedParametersSchema,
  }),
  z.object({
    operation: z.enum(["car", "car-class", "track"]),
    query: z.object({}),
  }),
]);

/** Request and API credential selection. */
export interface ImportOptions extends Pick<
  CredentialOptions,
  "credentials" | "accessToken"
> {
  /** Validated request. */
  request: z.output<typeof ImportRequestSchema>;

  /** Return the modeled wire response without materializing cache URLs. */
  responseOnly?: boolean;
}

/** Host-owned retrieval and output. */
export interface CreateExecuteOptions {
  /**
   * Retrieve a document.
   * @param {ImportOptions} options - Validated invocation.
   * @returns {Promise<unknown>} Downloaded JSON.
   */
  fetchDocument(options: ImportOptions): Promise<unknown>;

  /**
   * Present the document.
   * @param {unknown} document - JSON payload.
   */
  present(document: unknown): void;
}

/**
 * Build member document commands.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command} Member group.
 */
function createMemberCommand(service: CreateExecuteOptions) {
  const member = new Command("member").description("Fetch member metadata");

  const get = member
    .command("get")
    .requiredOption("--cust-ids <ids>", "Comma-separated customer IDs")
    .option("--include-licenses [boolean]", "Include licenses (true/false)");

  bind(get, "member", service);
  bind(
    member
      .command("awards")
      .description("Fetch awards for a member (defaults to your account)")
      .option("--cust-id <id>", "Customer ID"),
    "member-awards",
    service,
  );
  bind(
    member
      .command("award-instances")
      .description("Fetch instances of a member award")
      .requiredOption("--award-id <id>", "Award ID")
      .option("--cust-id <id>", "Customer ID"),
    "member-award-instances",
    service,
  );
  bind(
    member
      .command("chart-data")
      .description("Fetch a member rating or license chart")
      .requiredOption("--category-id <id>", "License category ID")
      .requiredOption(
        "--chart-type <type>",
        "1: iRating, 2: TT Rating, 3: License/SR",
      )
      .option("--cust-id <id>", "Customer ID"),
    "member-chart-data",
    service,
  );
  bind(
    member
      .command("profile")
      .description("Fetch a member profile (defaults to your account)")
      .option("--cust-id <id>", "Customer ID"),
    "member-profile",
    service,
  );
  bind(
    member.command("info").description("Fetch your member information"),
    "member-info",
    service,
  );
  bind(
    member
      .command("participation-credits")
      .description("Fetch your participation credits"),
    "member-participation-credits",
    service,
  );

  return member;
}

/**
 * Build import-support command groups.
 * @param {CreateExecuteOptions} service - Host operations.
 * @returns {Command[]} Root commands.
 */
export function createImportCommands(service: CreateExecuteOptions) {
  const member = createMemberCommand(service);

  const metadata = new Command("metadata").description(
    "Fetch reference metadata",
  );

  for (const operation of ["car", "car-class", "track"] as const) {
    bind(metadata.command(operation), operation, service);
  }

  const search = new Command("results-search-hosted").description(
    "Search hosted results; emit the returned document without expanding chunks",
  );

  for (const [flag, description] of [
    ["start-range-begin", "Inclusive session start (ISO-8601 UTC)"],
    ["start-range-end", "Exclusive session start bound (ISO-8601 UTC)"],
    ["finish-range-begin", "Inclusive session finish (ISO-8601 UTC)"],
    ["finish-range-end", "Exclusive session finish bound (ISO-8601 UTC)"],
    ["cust-id", "Participant customer ID (ignored when team ID is supplied)"],
    ["team-id", "Team ID"],
    ["host-cust-id", "Host customer ID"],
    ["session-name", "Partial or complete session name"],
    ["league-id", "League ID"],
    ["league-season-id", "League season ID"],
    ["car-id", "Car ID"],
    ["track-id", "Track ID"],
    ["category-ids", "Comma-separated category IDs"],
  ]) {
    search.option(`--${flag} <value>`, description);
  }

  bind(search, "search-hosted", service);

  return [member, metadata, search];
}

/**
 * Attach validation and execution to a leaf.
 * @param {Command} leaf - Command receiving flags.
 * @param {ImportOptions["request"]["operation"]} operation - API operation.
 * @param {CreateExecuteOptions} service - Host operations.
 */
function bind(
  leaf: Command,
  operation: ImportOptions["request"]["operation"],
  service: CreateExecuteOptions,
) {
  leaf.option(
    "--response-only",
    "Return modeled response JSON without downloading cache data",
  );

  leaf.action(async (raw: Record<string, unknown>, command: Command) => {
    const query = Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [
        key.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        value,
      ]),
    );

    const request = ImportRequestSchema.parse({ operation, query });

    service.present(
      await service.fetchDocument({
        request,
        responseOnly: raw.responseOnly === true,
        ...readCredentialOptions(command),
      }),
    );
  });
}
