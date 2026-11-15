const assert = require("node:assert/strict");
const test = require("node:test");
const { createRootCommand } = require("./root-command.cjs");

for (const [operation, flags, query] of [
  ["combined-sessions", [], {}],
  ["combined-sessions", ["--package-id", "123"], { package_id: "123" }],
  ["sessions", [], {}],
]) {
  for (const tokenBefore of [true, false]) {
    test(`hosted ${operation} ${flags.join(" ")} credentials ${tokenBefore ? "before" : "after"}`, async () => {
      const { createHostedCommand } =
        await import("../dist/commands/hosted/command.js");
      const { createHostedService } =
        await import("../dist/commands/hosted/service.js");
      let calls = 0;
      const displayed = [];
      const payload = [{ session_id: 123, start_time: "2027-01-01T00:00:00Z" }];
      const command = createHostedCommand(
        createHostedService({
          async fetch(input, init) {
            calls++;
            if (calls === 1) {
              const url = new URL(String(input));
              assert.equal(
                url.pathname,
                `/data/hosted/${operation.replaceAll("-", "_")}`,
              );
              assert.deepEqual(Object.fromEntries(url.searchParams), query);
              assert.equal(
                new Headers(init.headers).get("authorization"),
                "Bearer synthetic-hosted-token",
              );
              return new Response(
                JSON.stringify({
                  link: "https://cache.example/hosted",
                  expires: 1,
                }),
              );
            }
            assert.equal(String(input), "https://cache.example/hosted");
            assert.equal(init, undefined);
            return new Response(JSON.stringify(payload));
          },
          display(document) {
            displayed.push(document);
          },
        }),
      );
      const root = (await createRootCommand()).addCommand(command);
      const credentials = ["--access-token", "synthetic-hosted-token"];
      await root.parseAsync([
        "node",
        "test",
        ...(tokenBefore ? credentials : []),
        "hosted",
        operation,
        ...flags,
        ...(tokenBefore ? [] : credentials),
      ]);
      assert.equal(calls, 2);
      assert.deepEqual(displayed, [payload]);
    });
  }
}

test("hosted invalid inputs and unsupported filters have no service effects", async () => {
  const { createHostedCommand } =
    await import("../dist/commands/hosted/command.js");
  for (const args of [
    ["combined-sessions", "--package-id", "invalid"],
    ["combined-sessions", "--package-id"],
    ["sessions", "--package-id", "123"],
    ["combined-sessions", "--league-id", "123"],
  ]) {
    const command = createHostedCommand({
      async fetchHosted() {
        assert.fail("must not fetch");
      },
      present() {
        assert.fail("must not present");
      },
    });
    command.exitOverride().configureOutput({ writeErr() {} });
    for (const leaf of command.commands)
      leaf.exitOverride().configureOutput({ writeErr() {} });
    const root = (await createRootCommand()).addCommand(command);
    await assert.rejects(root.parseAsync(["node", "test", "hosted", ...args]));
  }
});

for (const failure of [
  "api",
  "unsafe",
  "embedded-credentials",
  "http",
  "decode",
]) {
  test(`hosted ${failure} errors are safe and never presented`, async () => {
    const { createHostedService } =
      await import("../dist/commands/hosted/service.js");
    let calls = 0;
    const service = createHostedService({
      async fetch() {
        calls++;
        if (calls === 1) {
          if (failure === "api") throw new Error("synthetic-secret");
          const links = {
            unsafe: "http://cache.example/hosted",
            "embedded-credentials": "https://user:secret@cache.example/hosted",
          };
          return new Response(
            JSON.stringify({
              link:
                links[failure] ??
                "https://cache.example/hosted?signature=synthetic-secret",
              expires: 1,
            }),
          );
        }
        return failure === "http"
          ? new Response("synthetic-secret", { status: 403 })
          : new Response("synthetic-secret");
      },
      display() {
        assert.fail("must not display");
      },
    });
    await assert.rejects(
      service.fetchHosted({
        accessToken: "synthetic-hosted-token",
        request: { operation: "sessions", query: {} },
      }),
      (error) => {
        assert.match(error.message, /Hosted request failed/);
        assert.doesNotMatch(
          error.message,
          /synthetic-secret|user:secret|https:/,
        );
        return true;
      },
    );
    assert.equal(
      calls,
      ["api", "unsafe", "embedded-credentials"].includes(failure) ? 1 : 2,
    );
  });
}

test("root program registers hosted commands and presents JSON through injected writer", async () => {
  const { createProgram } = await import("../dist/program.js");
  const displayed = [];
  let calls = 0;
  const program = createProgram({
    diagnostics: { info() {}, warn() {}, error() {} },
    display: {
      display(document) {
        displayed.push(document);
      },
    },
    async fetch() {
      calls++;
      return new Response(
        JSON.stringify(
          calls === 1
            ? { link: "https://cache.example/hosted", expires: 1 }
            : { sessions: [] },
        ),
      );
    },
  });
  await program.parseAsync([
    "node",
    "test",
    "hosted",
    "combined-sessions",
    "--access-token",
    "synthetic-hosted-token",
  ]);
  assert.equal(calls, 2);
  assert.deepEqual(displayed, [{ sessions: [] }]);
  const hosted = program.commands.find(
    (command) => command.name() === "hosted",
  );
  assert.deepEqual(
    hosted.commands.map((command) => command.name()),
    ["combined-sessions", "sessions"],
  );
  assert.match(hosted.commands[0].helpInformation(), /--package-id/);
  assert.doesNotMatch(hosted.commands[1].helpInformation(), /--package-id/);
});
