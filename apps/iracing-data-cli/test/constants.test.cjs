const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

for (const [operation, wire] of [
  ["categories", "categories"],
  ["divisions", "divisions"],
  ["event-types", "event_types"],
]) {
  test(`constants ${operation} emits the direct array with one authenticated request`, async () => {
    const { createConstantsCommand } =
      await import("../dist/commands/constants/command.js");
    const { createConstantsService } =
      await import("../dist/commands/constants/service.js");
    const displayed = [];
    let calls = 0;
    const document = [{ label: "Example", value: 1, future_field: true }];
    const root = (await createRootCommand()).addCommand(
      createConstantsCommand(
        createConstantsService({
          async fetch(input, init) {
            calls++;
            assert.equal(
              new URL(String(input)).pathname,
              `/data/constants/${wire}`,
            );
            assert.equal(
              new Headers(init.headers).get("authorization"),
              "Bearer synthetic-constants-token",
            );
            return Response.json(document);
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
      "constants",
      operation,
      "--access-token",
      "synthetic-constants-token",
    ]);
    assert.equal(calls, 1);
    assert.deepEqual(displayed, [document]);
  });
}

for (const failure of ["http", "decode", "shape", "transport"]) {
  test(`constants ${failure} failure is secret-safe and emits no success`, async () => {
    const { createConstantsService } =
      await import("../dist/commands/constants/service.js");
    const service = createConstantsService({
      async fetch() {
        if (failure === "transport")
          throw new Error("synthetic-private-detail");
        if (failure === "http")
          return new Response("synthetic-private-detail", { status: 500 });
        if (failure === "decode")
          return new Response("synthetic-private-detail");
        return Response.json({ link: "https://cache.example/private" });
      },
      display() {
        assert.fail("Must not present a failed request");
      },
    });
    await assert.rejects(
      service.fetchConstants({
        operation: "categories",
        accessToken: "synthetic-constants-token",
      }),
      (error) => {
        assert.match(error.message, /Constants request failed/);
        assert.doesNotMatch(
          error.message,
          /synthetic-private-detail|cache.example/,
        );
        assert.equal(error.cause, undefined);
        return true;
      },
    );
  });
}
