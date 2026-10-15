import {
  MemberApi,
  StatsApi,
  type GetMemberChartDataRequest,
  type GetMemberRequest,
  type GetStatsMemberRecentRacesRequest,
  type GetStatsMemberSummaryRequest,
  type IracingAPIResponse,
} from "@iracing-data/api-client-fetch";
import {
  CategoryIdSchema,
  CategorySchema,
  ChartTypeSchema,
  CustomerIdSchema,
  MemberChartDataParametersSchema,
  MemberGetParametersSchema,
  StatsMemberRecentRacesParametersSchema,
  StatsMemberSummaryParametersSchema,
  type Category,
  type ChartType,
} from "@iracing-data/api-schema";
import { z } from "zod";
import {
  type IRacingRequest,
  type IRacingRequestContext,
  type IRacingRequestResolver,
} from "./request";

const DriverCustomerIdSchema = z
  .int()
  .positive()
  .pipe(CustomerIdSchema)
  .meta({
    id: "mcpExpress.driverSummary.customerId",
    title: "Driver customer ID",
    description:
      "Positive iRacing customer ID accepted by the driver-summary application boundary.",
    examples: [123456],
  });

// No shared subsession ID primitive currently exists in @iracing-data/api-schema.
const SubsessionIdSchema = z.int().positive().meta({
  id: "mcpExpress.driverSummary.subsessionId",
  title: "Subsession ID",
  description: "Positive iRacing subsession identifier for a recent race.",
  examples: [98765432],
});

const LicenseSchema = z.record(z.string(), z.unknown()).meta({
  id: "mcpExpress.driverSummary.license",
  title: "Driver license",
  description:
    "Upstream iRacing license record retained as a consumer-owned passthrough projection.",
});

const DriverReferenceSchema = z
  .strictObject({
    custId: DriverCustomerIdSchema,
  })
  .meta({
    id: "mcpExpress.driverSummary.reference",
    title: "Driver reference",
    description: "Application-level reference to an iRacing driver.",
    examples: [{ custId: 123456 }],
  });

const MemberLookupParametersFromDriverSchema = DriverReferenceSchema.transform(
  ({ custId }) => ({
    cust_ids: String(custId),
    include_licenses: true,
  }),
)
  .pipe(MemberGetParametersSchema)
  .meta({
    id: "mcpExpress.driverSummary.memberLookupParameters",
    title: "Member lookup parameters",
    description:
      "Transforms an application driver reference into the canonical member/get API parameters with licenses included.",
  });

const StatsSummaryParametersFromDriverSchema = DriverReferenceSchema.transform(
  ({ custId }) => ({
    cust_id: custId,
  }),
)
  .pipe(StatsMemberSummaryParametersSchema)
  .meta({
    id: "mcpExpress.driverSummary.statsSummaryParameters",
    title: "Member summary parameters",
    description:
      "Transforms an application driver reference into the canonical stats/member_summary API parameters.",
  });

const RecentRacesParametersFromDriverSchema = DriverReferenceSchema.transform(
  ({ custId }) => ({
    cust_id: custId,
  }),
)
  .pipe(StatsMemberRecentRacesParametersSchema)
  .meta({
    id: "mcpExpress.driverSummary.recentRacesParameters",
    title: "Recent races parameters",
    description:
      "Transforms an application driver reference into the canonical stats/member_recent_races API parameters.",
  });

const DriverChartRequestSchema = z
  .strictObject({
    custId: DriverCustomerIdSchema,
    discipline: CategorySchema.meta({
      title: "Discipline",
      description: "iRacing discipline used to select the chart category.",
      examples: ["sports_car"],
    }),
    chartType: ChartTypeSchema.meta({
      title: "Chart type",
      description:
        "iRacing chart series to fetch for the selected discipline.",
      examples: [1],
    }),
  })
  .meta({
    id: "mcpExpress.driverSummary.chartRequest",
    title: "Driver chart request",
    description:
      "Application-level request for one driver chart series in a discipline.",
    examples: [{ custId: 123456, discipline: "sports_car", chartType: 1 }],
  });

const ChartParametersFromDriverSchema = DriverChartRequestSchema.transform(
  ({ custId, discipline, chartType }) => ({
    cust_id: custId,
    category_id: categoryIdForDiscipline(discipline),
    chart_type: chartType,
  }),
)
  .pipe(MemberChartDataParametersSchema)
  .meta({
    id: "mcpExpress.driverSummary.chartParameters",
    title: "Member chart data parameters",
    description:
      "Transforms an application chart request into the canonical member/chart_data API parameters.",
  });

export const DriverMemberSchema = z
  .looseObject({
    cust_id: DriverCustomerIdSchema,
    display_name: z.string().min(1).meta({
      title: "Display name",
      description: "Driver display name returned by iRacing.",
      examples: ["Example Driver"],
    }),
    licenses: z.array(LicenseSchema).meta({
      title: "Licenses",
      description: "Current iRacing licenses returned for the driver.",
    }),
  })
  .meta({
    id: "mcpExpress.driverSummary.member",
    title: "Driver member",
    description:
      "Consumer-owned projection of the member record required by driver-summary composition.",
  });

const MemberLookupSchema = z
  .looseObject({
    members: z.array(DriverMemberSchema).meta({
      title: "Members",
      description: "Member records returned by the upstream member lookup.",
    }),
  })
  .meta({
    id: "mcpExpress.driverSummary.memberLookup",
    title: "Member lookup response",
    description:
      "Minimum linked-response projection required to locate the requested driver member.",
  });

export const DriverStatsSummarySchema = z
  .looseObject({
    cust_id: DriverCustomerIdSchema,
  })
  .meta({
    id: "mcpExpress.driverSummary.statsSummary",
    title: "Driver stats summary",
    description:
      "Consumer-owned projection of the member statistics summary for a driver.",
  });

export const DriverRecentRaceSchema = z
  .looseObject({
    subsession_id: SubsessionIdSchema,
  })
  .meta({
    id: "mcpExpress.driverSummary.recentRace",
    title: "Driver recent race",
    description:
      "Consumer-owned projection of one recent race returned for a driver.",
  });

const RecentRacesSchema = z
  .looseObject({
    cust_id: DriverCustomerIdSchema,
    races: z.array(DriverRecentRaceSchema).meta({
      title: "Recent races",
      description:
        "Recent race records in the order returned by the upstream endpoint.",
    }),
  })
  .meta({
    id: "mcpExpress.driverSummary.recentRaces",
    title: "Driver recent races response",
    description:
      "Minimum linked-response projection required to resolve a driver's recent races.",
  });

const DriverChartPointSchema = z
  .looseObject({
    when: z.string().min(1).meta({
      title: "When",
      description: "Upstream time label for the chart point.",
      examples: ["2026-10-01"],
    }),
    value: z.number().meta({
      title: "Value",
      description: "Numeric value recorded at this chart point.",
      examples: [2500],
    }),
  })
  .meta({
    id: "mcpExpress.driverSummary.chartPoint",
    title: "Driver chart point",
    description: "One point in an iRacing driver chart series.",
  });

export const DriverChartDataSchema = z
  .looseObject({
    blackout: z.boolean().meta({
      title: "Blackout",
      description: "Whether upstream chart data is currently blacked out.",
    }),
    category_id: CategoryIdSchema.meta({
      title: "Category ID",
      description: "iRacing category identifier for this chart series.",
      examples: [5],
    }),
    chart_type: ChartTypeSchema.meta({
      title: "Chart type",
      description: "iRacing chart type represented by this series.",
      examples: [1],
    }),
    data: z.array(DriverChartPointSchema).meta({
      title: "Chart data",
      description: "Ordered data points returned for the chart series.",
    }),
    success: z.boolean().meta({
      title: "Success",
      description: "Upstream success flag for the chart response.",
    }),
    cust_id: DriverCustomerIdSchema,
  })
  .meta({
    id: "mcpExpress.driverSummary.chartData",
    title: "Driver chart data",
    description:
      "Consumer-owned projection of one iRacing member chart_data response.",
  });

export const DriverSummaryInputSchema = z
  .strictObject({
    custId: DriverCustomerIdSchema,
    discipline: CategorySchema.optional().meta({
      title: "Discipline",
      description:
        "Optional iRacing discipline. When provided, all three supported chart series are included.",
      examples: ["sports_car"],
    }),
  })
  .meta({
    id: "mcpExpress.driverSummary.input",
    title: "Driver summary input",
    description:
      "Application-level input for resolving a driver's member record, licenses, statistics, recent races, and optional chart history.",
    examples: [{ custId: 123456, discipline: "sports_car" }],
  });

export const DriverChartSummarySchema = z
  .strictObject({
    discipline: CategorySchema.meta({
      title: "Discipline",
      description: "Discipline represented by the chart bundle.",
      examples: ["sports_car"],
    }),
    categoryId: CategoryIdSchema.meta({
      title: "Category ID",
      description: "Canonical iRacing category ID for the discipline.",
      examples: [5],
    }),
    iRating: DriverChartDataSchema.meta({
      title: "iRating history",
      description: "iRating chart history for the selected discipline.",
    }),
    timeTrialRating: DriverChartDataSchema.meta({
      title: "Time-trial rating history",
      description: "Time-trial rating chart history for the selected discipline.",
    }),
    license: DriverChartDataSchema.meta({
      title: "License history",
      description: "License and safety-rating chart history for the discipline.",
    }),
  })
  .meta({
    id: "mcpExpress.driverSummary.charts",
    title: "Driver chart summary",
    description:
      "All supported iRacing chart series resolved for one driver and discipline.",
  });

export const DriverSummarySchema = z
  .strictObject({
    member: DriverMemberSchema.meta({
      title: "Member",
      description: "Driver member record with licenses included.",
    }),
    summary: DriverStatsSummarySchema.meta({
      title: "Stats summary",
      description: "Driver statistics summary returned by iRacing.",
    }),
    recentRaces: z.array(DriverRecentRaceSchema).max(5).meta({
      title: "Recent races",
      description:
        "At most five recent races, preserving the upstream endpoint order.",
    }),
    charts: DriverChartSummarySchema.optional().meta({
      title: "Charts",
      description:
        "Optional chart bundle included when the caller requests a discipline.",
    }),
  })
  .meta({
    id: "mcpExpress.driverSummary.output",
    title: "Driver summary",
    description:
      "Composite application result containing driver identity, licenses, statistics, recent races, and optional chart history.",
  });

export type DriverSummaryInput = z.infer<typeof DriverSummaryInputSchema>;
export type DriverMember = z.infer<typeof DriverMemberSchema>;
export type DriverStatsSummary = z.infer<typeof DriverStatsSummarySchema>;
export type DriverRecentRace = z.infer<typeof DriverRecentRaceSchema>;
export type DriverChartData = z.infer<typeof DriverChartDataSchema>;
export type DriverChartSummary = z.infer<typeof DriverChartSummarySchema>;
export type DriverSummary = z.infer<typeof DriverSummarySchema>;

export interface DriverSummaryLinkedResolver {
  <Value>(options: {
    response: IracingAPIResponse;
    schema: z.ZodType<Value>;
    signal: AbortSignal;
  }): Promise<{
    value: Value;
    expiresAt: number;
  }>;
}

export interface CreateDriverSummaryResolverOptions {
  requests: IRacingRequestResolver;
  resolveLinked: DriverSummaryLinkedResolver;
}

export interface DriverSummaryResolver {
  (
    input: DriverSummaryInput,
    context: IRacingRequestContext,
  ): Promise<DriverSummary>;
}

function categoryIdForDiscipline(
  discipline: Category,
): z.infer<typeof CategoryIdSchema> {
  switch (discipline) {
    case "oval":
      return 1;
    case "road":
      return 2;
    case "dirt_oval":
      return 3;
    case "dirt_road":
      return 4;
    case "sports_car":
      return 5;
    case "formula_car":
      return 6;
  }
}

function assertCustomer(
  actual: number,
  expected: number,
  source: string,
): void {
  if (actual !== expected) {
    throw new Error(`${source} returned an unexpected customer ID`);
  }
}

function linkedRequest<Value>({
  cacheKey,
  schema,
  execute,
  resolveLinked,
}: {
  cacheKey: string;
  schema: z.ZodType<Value>;
  execute: IRacingRequest<IracingAPIResponse, Value>["execute"];
  resolveLinked: DriverSummaryLinkedResolver;
}): IRacingRequest<IracingAPIResponse, Value> {
  return {
    cache: { key: cacheKey },
    schema,
    execute,
    async materialize(response, context) {
      return await resolveLinked({
        response,
        schema: context.schema,
        signal: context.signal,
      });
    },
  };
}

/**
 * Resolve a compact driver snapshot from independent iRacing endpoint resolvers.
 *
 * This is intentionally an application/domain resolver rather than an MCP tool:
 * callers provide request context and receive data without transport formatting.
 */
export function createDriverSummaryResolver({
  requests,
  resolveLinked,
}: CreateDriverSummaryResolverOptions): DriverSummaryResolver {
  return async (input, context) => {
    const { custId, discipline } = DriverSummaryInputSchema.parse(input);
    const { signal } = context;

    signal.throwIfAborted();

    const memberParameters = MemberLookupParametersFromDriverSchema.parse({
      custId,
    }) satisfies GetMemberRequest;
    const summaryParameters = StatsSummaryParametersFromDriverSchema.parse({
      custId,
    }) satisfies GetStatsMemberSummaryRequest;
    const recentRacesParameters = RecentRacesParametersFromDriverSchema.parse({
      custId,
    }) satisfies GetStatsMemberRecentRacesRequest;

    const memberPromise = requests.resolve(
      linkedRequest({
        cacheKey: `driver:${custId}:member:v1`,
        schema: MemberLookupSchema,
        resolveLinked,
        execute(configuration, requestContext) {
          return new MemberApi(configuration).getMember(memberParameters, {
            signal: requestContext.signal,
          });
        },
      }),
      context,
    );

    const summaryPromise = requests.resolve(
      linkedRequest({
        cacheKey: `driver:${custId}:stats-summary:v1`,
        schema: DriverStatsSummarySchema,
        resolveLinked,
        execute(configuration, requestContext) {
          return new StatsApi(configuration).getStatsMemberSummary(
            summaryParameters,
            { signal: requestContext.signal },
          );
        },
      }),
      context,
    );

    const recentRacesPromise = requests.resolve(
      linkedRequest({
        cacheKey: `driver:${custId}:recent-races:v1`,
        schema: RecentRacesSchema,
        resolveLinked,
        execute(configuration, requestContext) {
          return new StatsApi(configuration).getStatsMemberRecentRaces(
            recentRacesParameters,
            { signal: requestContext.signal },
          );
        },
      }),
      context,
    );

    const chartsPromise =
      discipline === undefined
        ? Promise.resolve(undefined)
        : resolveCharts(
            custId,
            discipline,
            context,
            requests,
            resolveLinked,
          );

    const [memberLookup, summary, recentRaces, charts] = await Promise.all([
      memberPromise,
      summaryPromise,
      recentRacesPromise,
      chartsPromise,
    ]);

    signal.throwIfAborted();

    const member = memberLookup.members.find(
      (candidate) => candidate.cust_id === custId,
    );

    if (!member) {
      throw new Error("Requested iRacing member was not returned");
    }

    assertCustomer(summary.cust_id, custId, "Driver summary");
    assertCustomer(recentRaces.cust_id, custId, "Recent races");

    return DriverSummarySchema.parse({
      member,
      summary,
      recentRaces: recentRaces.races.slice(0, 5),
      ...(charts === undefined ? {} : { charts }),
    });
  };
}

async function resolveCharts(
  custId: number,
  discipline: Category,
  context: IRacingRequestContext,
  requests: IRacingRequestResolver,
  resolveLinked: DriverSummaryLinkedResolver,
): Promise<DriverChartSummary> {
  const categoryId = categoryIdForDiscipline(discipline);

  async function resolveChart(chartType: ChartType): Promise<DriverChartData> {
    const parameters = ChartParametersFromDriverSchema.parse({
      custId,
      discipline,
      chartType,
    }) satisfies GetMemberChartDataRequest;

    const chart = await requests.resolve(
      linkedRequest({
        cacheKey: `driver:${custId}:chart:${categoryId}:${chartType}:v1`,
        schema: DriverChartDataSchema,
        resolveLinked,
        execute(configuration, requestContext) {
          return new MemberApi(configuration).getMemberChartData(parameters, {
            signal: requestContext.signal,
          });
        },
      }),
      context,
    );

    assertCustomer(chart.cust_id, custId, "Driver chart");

    if (chart.category_id !== categoryId || chart.chart_type !== chartType) {
      throw new Error("Driver chart returned unexpected chart coordinates");
    }

    return chart;
  }

  const [iRating, timeTrialRating, license] = await Promise.all([
    resolveChart(1),
    resolveChart(2),
    resolveChart(3),
  ]);

  return DriverChartSummarySchema.parse({
    discipline,
    categoryId,
    iRating,
    timeTrialRating,
    license,
  });
}
