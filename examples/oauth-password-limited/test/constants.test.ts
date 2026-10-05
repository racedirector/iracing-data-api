import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { Configuration } from "@iracing-data/api-client-fetch";
import { fetchConstants } from "../src/constants";

test("writes direct constants arrays without fetching cache links", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "iracing-constants-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const responses = {
    categories: [{ value: 1, label: "Example", extra: { nested: true } }],
    divisions: [],
    event_types: [{ value: 2 }],
  };
  const requested: string[] = [];
  const configuration = new Configuration({
    accessToken: "synthetic",
    fetchApi: async (url, init) => {
      const pathname = new URL(String(url)).pathname;
      assert.equal(
        new Headers(init?.headers).get("authorization"),
        "Bearer synthetic",
      );
      const name = pathname.slice("/data/constants/".length);
      assert.ok(pathname.startsWith("/data/constants/"));
      assert.ok(
        Object.hasOwn(responses, name),
        `Unexpected request: ${pathname}`,
      );
      requested.push(name);
      return Response.json(responses[name as keyof typeof responses]);
    },
  });
  await fetchConstants(configuration, directory);
  assert.deepEqual(requested.sort(), Object.keys(responses).sort());
  for (const [name, data] of Object.entries(responses)) {
    const filename = `${name.replace("_", "-")}.json`;
    assert.deepEqual(
      JSON.parse(await readFile(path.join(directory, filename), "utf8")),
      data,
    );
  }
});
