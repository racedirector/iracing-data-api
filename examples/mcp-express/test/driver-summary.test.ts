import assert from "node:assert/strict";
import test from "node:test";
import { Configuration } from "@iracing-data/api-client-fetch";
import { z } from "zod";
import {
  createDriverSummaryResolver,
  DriverChartDataSchema,
  DriverChartSummarySchema,
  DriverMemberSchema,
  DriverRecentRaceSchema,
  DriverStatsSummarySchema,
  DriverSummaryInputSchema,
  DriverSummarySchema,
  type DriverSummaryLinkedResolver,
} from "../src/iracing/driver-summary";
import { createIRacingRequestResolver } from "../src/iracing/request";

const custId = 123;

const member = {
  cust_id: custId,
  display_name: "Driver",
  club_name: "Test Club",
  licenses: [
    {
      category_id: 5,
      category: "Sports Car",
      irating: 2500,
      safety_rating: 3.42,
    },
  ],
};

const summary = {
  cust_id: custId,
  this_year: {
    starts: 12,
    wins: 2,
  },
};

const recentRaces = {
  cust_id: custId,
  races: Array.from({ length: 7 }, (_, index) => ({
    subsession_id: 1000 + index,
    series_name: `Series ${index + 1}`,
  })),
};

function chart(categoryId: number, chartType: 1 | 2 | 3) {
  return {
    blackout: false,
    category_id: categoryId,
    chart_type: chartType,
    data: [
      {
        when: "2026-10-01",
        value: 2000 + chartType,
      },
    ],
    success: true,
    cust_id: custId,
  };
}

function createHarness({ summaryCustId = custId } = {}) {
  const urls: URL[] = [];
  const linkedPayloads = new Map<string, unknown>();
  let nextLink = 0;

  function payloadFor(url: URL): unknown {
    switch (url.pathname) {
      case "/data/member/get":
        assert.equal(url.searchParams.get("cust_ids"), String(custId));
        assert.equal(url.searchParams.get("include_licenses"), "true");

        return {
          success: true,
          cust_ids: [custId],
          members: [member],
        };
      case "/data/stats/member_summary":
        assert.equal(url.searchParams.get("cust_id"), String(custId));

        return { ...summary, cust_id: summaryCustId };
      case "/data/stats/member_recent_races":
        assert.equal(url.searchParams.get("cust_id"), String(custId));

        return recentRaces;
      case "/data/member/chart_data": {
        assert.equal(url.searchParams.get("cust_id"), String(custId));

        const categoryId = Number(url.searchParams.get("category_id"));
        const chartType = Number(url.searchParams.get("chart_type"));

        assert.ok(chartType === 1 || chartType === 2 || chartType === 3);

        return chart(categoryId, chartType);
      }
      default:
        throw new Error(`Unexpected request: ${url.href}`);
    }
  }

  const configuration = new Configuration({
    accessToken: "test-token",
    basePath: "https://members.example",
    fetchApi: async (input, init) => {
      const request = input instanceof Request ? input : new Request(input, init);
      const url = new URL(request.url);
      const payload = payloadFor(url);
      const link = `https://data.example/${++nextLink}`;

      urls.push(url);
      linkedPayloads.set(link, payload);

      return Response.json({
        link,
        expires: "2099-01-01T00:00:00Z",
      });
    },
  });

  const requests = createIRacingRequestResolver({
    resolveConfiguration: () => configuration,
  });

  const resolveLinked: DriverSummaryLinkedResolver = async ({
    response,
    schema,
    signal,
  }) => {
    signal.throwIfAborted();

    if (!linkedPayloads.has(response.link)) {
      throw new Error(`Unknown linked response: ${response.link}`);
    }

    return {
      value: schema.parse(linkedPayloads.get(response.link)),
      expiresAt: Date.parse("2099-01-01T00:00:00Z"),
    };
  };

  return {
    urls,
    resolve: createDriverSummaryResolver({ requests, resolveLinked }),
  };
}

test("resolves member licenses, stats summary, and the five most recent races", async () => {
  const harness = createHarness();
  const controller = new AbortController();

  const result = await harness.resolve(
    { custId },
    { signal: controller.signal },
  );

  assert.equal(result.member.cust_id, custId);
  assert.equal(result.member.display_name, "Driver");
  assert.deepEqual(result.member.licenses, member.licenses);
  assert.deepEqual(result.summary, summary);
  assert.deepEqual(
    result.recentRaces.map((race) => race.subsession_id),
    [1000, 1001, 1002, 1003, 1004],
  );
  assert.equal(result.charts, undefined);

  assert.deepEqual(
    harness.urls.map((url) => url.pathname).sort(),
    [
      "/data/member/get",
      "/data/stats/member_recent_races",
      "/data/stats/member_summary",
    ],
  );
});

test("a discipline adds all three driver chart series for that category", async () => {
  const harness = createHarness();
  const controller = new AbortController();

  const result = await harness.resolve(
    { custId, discipline: "sports_car" },
    { signal: controller.signal },
  );

  assert.ok(result.charts);
  assert.equal(result.charts.discipline, "sports_car");
  assert.equal(result.charts.categoryId, 5);
  assert.equal(result.charts.iRating.chart_type, 1);
  assert.equal(result.charts.timeTrialRating.chart_type, 2);
  assert.equal(result.charts.license.chart_type, 3);

  const chartUrls = harness.urls.filter(
    (url) => url.pathname === "/data/member/chart_data",
  );

  assert.equal(chartUrls.length, 3);
  assert.deepEqual(
    chartUrls
      .map((url) => ({
        categoryId: Number(url.searchParams.get("category_id")),
        chartType: Number(url.searchParams.get("chart_type")),
      }))
      .sort((a, b) => a.chartType - b.chartType),
    [
      { categoryId: 5, chartType: 1 },
      { categoryId: 5, chartType: 2 },
      { categoryId: 5, chartType: 3 },
    ],
  );
});

test("rejects a response that resolves to another customer", async () => {
  const harness = createHarness({ summaryCustId: 999 });

  await assert.rejects(
    harness.resolve({ custId }, { signal: new AbortController().signal }),
    /unexpected customer ID/,
  );
});

test("application schemas expose Zod metadata through first-party JSON Schema generation", () => {
  const schemas = [
    DriverSummaryInputSchema,
    DriverMemberSchema,
    DriverStatsSummarySchema,
    DriverRecentRaceSchema,
    DriverChartDataSchema,
    DriverChartSummarySchema,
    DriverSummarySchema,
  ];

  for (const schema of schemas) {
    assert.doesNotThrow(() => z.toJSONSchema(schema));
  }

  const inputJsonSchema = z.toJSONSchema(DriverSummaryInputSchema, {
    io: "input",
  });
  assert.equal(inputJsonSchema.title, "Driver summary input");
  assert.match(inputJsonSchema.description ?? "", /driver's member record/i);
  assert.deepEqual(inputJsonSchema.examples, [
    { custId: 123456, discipline: "sports_car" },
  ]);

  const outputJsonSchema = z.toJSONSchema(DriverSummarySchema);
  assert.equal(outputJsonSchema.title, "Driver summary");
  assert.match(outputJsonSchema.description ?? "", /composite application result/i);
});
