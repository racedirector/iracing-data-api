import assert from "node:assert/strict";
import test from "node:test";
import { Configuration, ResponseError } from "@iracing-data/api-client-fetch";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";
import { createNoopLogger } from "../src/logger";
import { createServer } from "../src/mcp";
import {
  createDiagnosticRedactor,
  createToolResults,
} from "../src/mcp/results";
import { ServiceFailure } from "../src/services/failure";
import { createFetchIRacingLinkService } from "../src/services/iracing-link";
import type { ErrorDetailsMode } from "../src/mcp/results";

/** Capture operator diagnostics without writing test errors to the real logger. */
function setup(mode: ErrorDetailsMode) {
  const logs: unknown[] = [];

  const logger = {
    ...createNoopLogger(),
    error: (_message: string, fields: unknown) => {
      logs.push(fields);
    },
  };

  return {
    logs,
    logger,
    results: createToolResults({
      logger,
      mode,
      createRequestId: () => "test-request-id",
      redact: createDiagnosticRedactor(() => ["known-secret"]),
    }),
  };
}

test("successful serialization keeps JSON text and structured content equivalent", () => {
  const { results } = setup("production");

  const result = results.success({
    cust_id: 123,
    display_name: "Driver",
    omitted: undefined,
  });

  assert.deepEqual(
    JSON.parse(result.content[0].text),
    result.structuredContent,
  );
  assert.equal(Object.hasOwn(result.structuredContent, "omitted"), false);
  assert.throws(() => results.success({ impossible: 1n }));
});

/** The installed SDK can deliver a tool result as JSON or as one SSE data event. */
function parseToolResponse(body: string) {
  if (body.startsWith("{")) {
    return JSON.parse(body);
  }

  const dataLine = body.split("\n").find((line) => line.startsWith("data: "));

  assert.ok(
    dataLine,
    "Expected an SSE data event containing the tool response",
  );

  return JSON.parse(dataLine.slice(6));
}

test("production returns fixed errors; development retains redacted causes and stacks", () => {
  const cause = new Error(
    "download https://example.invalid/signed?secret=url-secret Bearer bearer-secret known-secret",
  );

  const error = new ServiceFailure("UPSTREAM_UNAVAILABLE", "upstream failed", {
    cause,
  });

  for (const mode of ["production", "development"] as const) {
    const { results, logs } = setup(mode);

    const result = results.failure(error, { tool: "test" });

    const payload = JSON.parse(result.content[0].text);

    assert.equal(result.isError, true);
    assert.deepEqual(payload, result.structuredContent);
    assert.equal(payload.error.code, "UPSTREAM_UNAVAILABLE");
    assert.equal(payload.error.request_id, "test-request-id");
    assert.equal(payload.error.retryable, true);
    if (mode === "development") {
      assert.match(payload.error.details.cause.stack, /download/);
    } else {
      assert.equal(payload.error.details, undefined);
      assert.doesNotMatch(result.content[0].text, /upstream failed|download/);
    }

    assert.equal(logs.length, 1);
    assert.doesNotMatch(
      JSON.stringify({ logs, result }),
      /known-secret|url-secret|bearer-secret/,
    );
  }
});

test("validation diagnostics retain issues, cycle-safe causes, and no arbitrary properties", () => {
  const parsed = z
    .object({ cust_id: z.number() })
    .safeParse({ cust_id: "invalid" });

  assert.equal(parsed.success, false);
  const error = new ServiceFailure("DATA_RESOLUTION_FAILED", "invalid data", {
    cause: parsed.error,
  });

  Object.assign(error, {
    authorization: "never-serialize-this",
    response: { body: "private" },
  });
  const { results } = setup("development");

  const value = JSON.parse(
    results.failure(error, { tool: "test" }).content[0].text,
  );

  assert.equal(value.error.details.cause.issues[0].path[0], "cust_id");
  assert.doesNotMatch(JSON.stringify(value), /never-serialize-this|private/);
  error.cause = error;
  assert.match(
    results.failure(error, { tool: "test" }).content[0].text,
    /truncated/,
  );
});

test("classification uses known boundaries and does not relabel programming errors", () => {
  const { results } = setup("production");

  const rateLimitedResponse = new Response(null, {
    status: 429,
    headers: { "retry-after": "25" },
  });

  const result = results.failure(new ResponseError(rateLimitedResponse), {
    tool: "test",
  });

  assert.equal(
    JSON.parse(result.content[0].text).error.retry_after_seconds,
    25,
  );
  const unexpected = results.failure(new TypeError("bug details"), {
    tool: "test",
  });

  assert.equal(
    JSON.parse(unexpected.content[0].text).error.code,
    "INTERNAL_ERROR",
  );
  assert.doesNotMatch(unexpected.content[0].text, /bug details/);
  const controller = new AbortController();

  controller.abort(new Error("private cancellation reason"));
  assert.throws(
    () =>
      results.failure(new Error("failed"), {
        tool: "test",
        signal: controller.signal,
      }),
    { name: "AbortError", message: "Request cancelled" },
  );
});

test("link failures preserve the original schema error for development diagnostics", async () => {
  const links = createFetchIRacingLinkService({
    now: () => 0,
    fetchApi: async () => Response.json({ cust_id: "wrong" }),
  });

  await assert.rejects(
    links.materialize({
      response: {
        link: "https://example.invalid/data",
        expires: new Date("2030-01-01"),
      },
      schema: z.object({ cust_id: z.number() }),
    }),
    (error: unknown) => {
      assert.ok(error instanceof ServiceFailure);
      assert.equal(error.code, "DATA_RESOLUTION_FAILED");
      assert.ok(error.cause instanceof z.ZodError);

      return true;
    },
  );
});

test("SDK tool calls expose injected development diagnostics and preserve successful output", async () => {
  for (const mode of ["production", "development"] as const) {
    for (const fails of [true, false]) {
      const { logger, results } = setup(mode);

      const handler = createMcpHandler(() =>
        createServer({
          serverInfo: { name: "test", version: "1" },
          logger,
          results,
          resolveConfiguration: () => {
            if (fails) {
              throw new Error("inspector-visible-failure", {
                cause: new Error("original-cause"),
              });
            }

            return new Configuration({
              fetchApi: async () =>
                Response.json({
                  link: "https://example.invalid/data",
                  expires: "2030-01-01T00:00:00Z",
                }),
            });
          },
          linkService: createFetchIRacingLinkService({
            now: () => 0,
            fetchApi: async () =>
              Response.json({ cust_id: 123, display_name: "Driver" }),
          }),
        }),
      );

      try {
        const response = await handler.fetch(
          new Request("http://localhost/mcp", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              accept: "application/json, text/event-stream",
              "mcp-protocol-version": "2025-11-25",
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "tools/call",
              params: { name: "get_my_driver", arguments: {} },
            }),
          }),
        );

        const body = await response.text();

        assert.equal(response.status, 200, body);
        const message = parseToolResponse(body);

        assert.deepEqual(
          JSON.parse(message.result.content[0].text),
          message.result.structuredContent,
        );
        if (fails) {
          assert.equal(message.result.isError, true);
          assert.equal(
            body.includes("inspector-visible-failure"),
            mode === "development",
          );
        } else {
          assert.deepEqual(message.result.structuredContent, {
            cust_id: 123,
            display_name: "Driver",
          });
        }
      } finally {
        await handler.close();
      }
    }
  }
});
