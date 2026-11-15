const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

for (const service of ["car", "series", "track"]) {
  test(`assets ${service} uses a generated request, credential-free materialization, and shared output`, async () => {
    const { createAssetsCommand } =
      await import("../dist/commands/assets/command.js");
    const { createAssetsService } =
      await import("../dist/commands/assets/service.js");
    let calls = 0;
    const displayed = [];
    const wire = { example: { logo: "image.png", future_field: true } };
    const root = (await createRootCommand()).addCommand(
      createAssetsCommand(
        createAssetsService({
          async fetch(input, init) {
            calls++;
            if (calls === 1) {
              assert.equal(
                new URL(String(input)).pathname,
                `/data/${service}/assets`,
              );
              assert.equal(
                new Headers(init.headers).get("authorization"),
                "Bearer synthetic-assets-token",
              );
              return Response.json({
                link: "https://cache.example/assets?signature=opaque",
                expires: "2026-11-15T01:00:00Z",
              });
            }
            assert.equal(
              String(input),
              "https://cache.example/assets?signature=opaque",
            );
            assert.equal(new Headers(init.headers).has("authorization"), false);
            assert.equal(init.method, "GET");
            assert.ok(init.signal instanceof AbortSignal);
            return Response.json(wire);
          },
          display(value) {
            displayed.push(value);
          },
        }),
      ),
    );
    await root.parseAsync([
      "node",
      "test",
      "assets",
      service,
      "--access-token",
      "synthetic-assets-token",
    ]);
    assert.equal(calls, 2);
    assert.deepEqual(displayed, [wire]);
  });
}

for (const failure of [
  "api",
  "transport",
  "unsafe",
  "embedded",
  "http",
  "content-type",
  "decode",
]) {
  test(`asset ${failure} failure is safe and emits no success`, async () => {
    const { createAssetsService } =
      await import("../dist/commands/assets/service.js");
    const { createExecute } =
      await import("../dist/commands/assets/command.js");
    let calls = 0;
    const execute = createExecute(
      createAssetsService({
        async fetch() {
          calls++;
          if (calls === 1) {
            if (failure === "api")
              return new Response("private-detail", { status: 500 });
            if (failure === "transport") throw new Error("private-detail");
            const links = {
              unsafe: "http://cache.example/data",
              embedded: "https://user:private-detail@cache.example/data",
            };
            return Response.json({
              link: links[failure] ?? "https://cache.example/data",
            });
          }
          return new Response("private-detail", {
            status: failure === "http" ? 500 : 200,
            headers: {
              "content-type":
                failure === "content-type" ? "text/html" : "application/json",
            },
          });
        },
        display() {
          assert.fail("No presentation on failure");
        },
      }),
    );
    await assert.rejects(
      execute({ service: "car", accessToken: "synthetic-assets-token" }),
      (error) => {
        assert.match(error.message, /Assets request failed/);
        assert.doesNotMatch(error.message, /private-detail|cache.example/);
        assert.equal(error.cause, undefined);
        return true;
      },
    );
    assert.equal(
      calls,
      ["http", "content-type", "decode"].includes(failure) ? 2 : 1,
    );
  });
}
