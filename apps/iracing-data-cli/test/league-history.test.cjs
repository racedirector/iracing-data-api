const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("host applies environment output override, persists privately, and refuses reuse", async () => {
  const { createHistoryService } =
    await import("../dist/league-history-adapters.js");
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "league-history-"));
  const credentials = path.join(directory, "credentials.json");
  const output = path.join(directory, "environment-output");
  const displayed = [];
  await fs.writeFile(
    credentials,
    JSON.stringify({ access_token: "fixture-token" }),
  );
  const service = createHistoryService({
    environment: { IRACING_OUTPUT_DIR: output },
    now: () => new Date("2026-01-01T00:00:00Z"),
    display: (receipt) => displayed.push(receipt),
    fetch: async (input, init) => {
      if (String(input).startsWith("https://members-ng.iracing.com/")) {
        assert.equal(
          new Headers(init.headers).get("authorization"),
          "Bearer fixture-token",
        );
        return Response.json({
          link: "https://cache.example/seasons",
          expires: "2030-01-01T00:00:00Z",
        });
      }
      assert.equal(init, undefined);
      return Response.json({ seasons: [] });
    },
  });
  try {
    const receipt = await service.capture({
      leagueId: 6529,
      output: path.join(directory, "flag-output"),
      credentials,
    });
    assert.equal(receipt.directory, output);
    service.present(receipt);
    assert.deepEqual(displayed, [receipt]);
    const manifest = JSON.parse(
      await fs.readFile(path.join(output, "manifest.json"), "utf8"),
    );
    assert.equal(manifest.league_id, 6529);
    assert.equal(
      (await fs.stat(path.join(output, "manifest.json"))).mode & 0o777,
      0o600,
    );
    assert.equal((await fs.stat(output)).mode & 0o777, 0o700);
    await assert.rejects(service.capture({ leagueId: 6529, credentials }), {
      code: "EEXIST",
    });
    await assert.rejects(fs.stat(path.join(directory, "flag-output")), {
      code: "ENOENT",
    });
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("capture traverses active and retired seasons, deduplicates IDs, commits manifest last", async () => {
  const { captureHistory } =
    await import("../dist/commands/league-history/service.js");
  const files = [];
  const calls = [];
  const queries = {
    async seasons(league, retired) {
      calls.push(["seasons", league, retired]);
      return { document: { retired }, ids: [10, 10] };
    },
    async sessions(league, season) {
      calls.push(["sessions", league, season]);
      return { document: { season }, ids: [20, 20, 21] };
    },
    async results(id) {
      calls.push(["results", id]);
      return { subsession_id: id };
    },
  };
  const receipt = await captureHistory(
    6529,
    queries,
    {
      async write(name, document) {
        files.push([name, document]);
      },
    },
    () => new Date("2026-01-01T00:00:00Z"),
  );
  assert.deepEqual(receipt, { leagueId: 6529, seasons: 1, results: 2 });
  assert.deepEqual(calls, [
    ["seasons", 6529, false],
    ["seasons", 6529, true],
    ["sessions", 6529, 10],
    ["results", 20],
    ["results", 21],
  ]);
  assert.equal(files.at(-1)[0], "manifest");
  assert.deepEqual(files.at(-1)[1].subsession_ids, [20, 21]);
});

test("failed captures retain evidence without a completion manifest", async () => {
  const { captureHistory } =
    await import("../dist/commands/league-history/service.js");
  const files = [];
  await assert.rejects(
    captureHistory(
      6529,
      {
        seasons: async () => ({ document: {}, ids: [10] }),
        sessions: async () => {
          throw new Error("offline");
        },
        results: async () => assert.fail("unexpected results"),
      },
      {
        write: async (name) => {
          files.push(name);
        },
      },
      () => new Date(),
    ),
    /offline/,
  );
  assert.deepEqual(files, ["seasons-active", "seasons-retired"]);
});

test("command uses only injected service and rejects invalid IDs before effects", async () => {
  const { createRootCommand } = require("./root-command.cjs");
  const { createLeagueHistoryCommand } =
    await import("../dist/commands/league-history/command.js");
  const calls = [];
  const service = {
    async capture(options) {
      calls.push(options);
      return {
        leagueId: options.leagueId,
        directory: "capture",
        seasons: 1,
        results: 2,
      };
    },
    present(receipt) {
      calls.push(receipt);
    },
  };
  await (
    await createRootCommand()
  )
    .addCommand(createLeagueHistoryCommand(service))
    .parseAsync(
      [
        "league-history",
        "--league-id",
        "6529",
        "--output",
        "capture",
        "--credentials",
        "tokens.json",
      ],
      { from: "user" },
    );
  assert.deepEqual(calls[0], {
    leagueId: 6529,
    output: "capture",
    credentials: "tokens.json",
  });
  assert.equal(calls[1].results, 2);
  await assert.rejects(
    createLeagueHistoryCommand(service).parseAsync(["--league-id", "-1"], {
      from: "user",
    }),
    /positive safe integer/,
  );
  assert.equal(calls.length, 2);
});

test("fetch adapter materializes cache without bearer auth and rejects malformed traversal", async () => {
  const { createHistoryQueries } =
    await import("../dist/league-history-adapters.js");
  const calls = [];
  const fetcher = async (input, init) => {
    calls.push([String(input), init]);
    if (String(input).startsWith("https://members-ng.iracing.com/")) {
      assert.equal(
        new Headers(init.headers).get("authorization"),
        "Bearer synthetic-token",
      );
      return Response.json({
        link: "https://cache.example/history",
        expires: "2030-01-01T00:00:00Z",
      });
    }
    assert.equal(init, undefined);
    return Response.json({ seasons: [{ season_id: 12 }] });
  };
  const queries = createHistoryQueries("synthetic-token", fetcher);
  assert.deepEqual((await queries.seasons(6529, true)).ids, [12]);
  assert.equal(calls.length, 2);
  await assert.rejects(queries.sessions(6529, 12), /missing sessions/);
});

test("fetch adapter does not expose upstream errors or token values", async () => {
  const { createHistoryQueries } =
    await import("../dist/league-history-adapters.js");
  const queries = createHistoryQueries("secret", async () => {
    throw new Error("secret signed-url");
  });
  await assert.rejects(
    queries.results(20),
    (error) =>
      error.message.includes("token expiry") &&
      !error.message.includes("secret"),
  );
});
