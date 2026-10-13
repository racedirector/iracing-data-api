import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { createConfigurationResolver } from "../src/mcp/tools/resolvers/configuration";
import { createIRacingLinkResolver } from "../src/mcp/tools/resolvers/iracing";

const schema = z.object({ cust_id: z.number() });
const response = {
  link: "https://example.invalid/data",
  expires: new Date(2000),
};

test("configuration forwards auth and signal and uses the restored token", async () => {
  const signal = new AbortController().signal;
  const auth = { token: "incoming", clientId: "test", scopes: [] };
  const fetchApi: typeof fetch = async () => Response.json({});
  const resolve = createConfigurationResolver({
    accessTokenResolver: async (options) => {
      assert.deepEqual(options, { signal, auth });
      assert.equal(options.auth, auth);

      return "restored-token";
    },
    basePath: "https://example.invalid",
    fetchApi,
  });
  const configuration = await resolve({ signal, auth });

  assert.equal(
    await configuration.accessToken?.("unused", []),
    "restored-token",
  );
  assert.equal(configuration.basePath, "https://example.invalid");
  assert.equal(configuration.fetchApi, fetchApi);
});

for (const before of [true, false]) {
  test(`configuration preserves abort ${before ? "before" : "during"} token restoration`, async () => {
    const controller = new AbortController();
    const reason = new Error("cancelled");
    let calls = 0;
    const resolve = createConfigurationResolver({
      accessTokenResolver: async () => {
        calls++;
        await Promise.resolve();
        controller.abort(reason);

        return "token";
      },
    });

    if (before) {
      controller.abort(reason);
    }

    await assert.rejects(
      Promise.resolve().then(() => resolve({ signal: controller.signal })),
      (error) => error === reason,
    );
    assert.equal(calls, before ? 0 : 1);
  });
}

test("link resolution validates data and preserves exact absolute expiry and safe fetch options", async () => {
  const signal = new AbortController().signal;
  const resolve = createIRacingLinkResolver({
    now: () => 1000,
    fetchApi: async (url, options) => {
      assert.equal(url, response.link);
      assert.deepEqual(options, { signal, redirect: "error" });

      return Response.json({ cust_id: 123, extra: "stripped" });
    },
  });

  assert.deepEqual(await resolve({ response, schema, signal }), {
    value: { cust_id: 123 },
    expiresAt: 2000,
  });
});

for (const now of [2000, 2001]) {
  test(`expired link at time ${now} never fetches`, async () => {
    const resolve = createIRacingLinkResolver({
      now: () => now,
      fetchApi: async () => {
        assert.fail("fetch");
      },
    });

    await assert.rejects(resolve({ response, schema }), /expired/);
  });
}

test("link expiring while the body downloads is rejected", async () => {
  let now = 1000;
  const resolve = createIRacingLinkResolver({
    now: () => now,
    fetchApi: async () => {
      const body = Response.json({ cust_id: 123 });

      body.json = async () => {
        now = 2000;

        return { cust_id: 123 };
      };

      return body;
    },
  });

  await assert.rejects(resolve({ response, schema }), /expired/);
});

for (const link of [
  "http://example.invalid/data",
  "https://user:password@example.invalid/data",
  "https://user@example.invalid/data",
]) {
  test(`unsafe link ${link} never fetches`, async () => {
    const resolve = createIRacingLinkResolver({
      now: () => 0,
      fetchApi: async () => {
        assert.fail("fetch");
      },
    });

    await assert.rejects(
      resolve({ response: { ...response, link }, schema }),
      /Invalid iRacing data link/,
    );
  });
}

test("non-OK linked response preserves status failure", async () => {
  const resolve = createIRacingLinkResolver({
    now: () => 0,
    fetchApi: async () => new Response(null, { status: 503 }),
  });

  await assert.rejects(resolve({ response, schema }), /HTTP 503/);
});

for (const syntax of [false, true]) {
  test(`invalid linked ${syntax ? "JSON syntax" : "shape"} preserves parser cause`, async () => {
    const resolve = createIRacingLinkResolver({
      now: () => 0,
      fetchApi: async () =>
        syntax ? new Response("{") : Response.json({ cust_id: "invalid" }),
    });

    await assert.rejects(resolve({ response, schema }), (error) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, "Invalid linked response data");
      assert.ok(error.cause instanceof (syntax ? SyntaxError : z.ZodError));

      return true;
    });
  });
}

for (const stage of ["before", "fetch", "body"]) {
  test(`link cancellation ${stage} escapes unchanged`, async () => {
    const controller = new AbortController();
    const reason = new Error("cancelled");
    let calls = 0;
    const resolve = createIRacingLinkResolver({
      now: () => 0,
      fetchApi: async () => {
        calls++;
        if (stage === "fetch") {
          controller.abort(reason);
          throw reason;
        }

        const body = Response.json({ cust_id: 123 });

        body.json = async () => {
          controller.abort(reason);

          return { cust_id: 123 };
        };

        return body;
      },
    });

    if (stage === "before") {
      controller.abort(reason);
    }

    await assert.rejects(
      resolve({ response, schema, signal: controller.signal }),
      (error) => error === reason,
    );
    assert.equal(calls, stage === "before" ? 0 : 1);
  });
}
