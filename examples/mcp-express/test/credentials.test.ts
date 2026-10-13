import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  OAuthClient,
  InMemoryStore,
  type SessionStore,
} from "@iracing-data/oauth-client";
import { FileSessionStore } from "../src/credentials/index";

const token = {
  access_token: `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.synthetic`,
  token_type: "Bearer" as const,
  expires_in: 3600,
  refresh_token: "synthetic-refresh",
  scope: "iracing.auth",
};

test("reads CLI JSON, conforms to SessionStore, and restores through ordinary OAuthClient", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "mcp-file-session-"));

  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "credentials.json");
  const store: SessionStore = new FileSessionStore(file);

  assert.equal(await store.get("local"), undefined);
  await writeFile(file, JSON.stringify(token));
  const client = new OAuthClient({
    clientMetadata: {
      clientId: "test",
      redirectUri: "http://127.0.0.1/callback",
      scopes: ["iracing.auth"],
    },
    stateStore: new InMemoryStore(),
    sessionStore: store,
  });

  assert.deepEqual(await client.restoreSessionForId("local"), token);
  const replacement = { ...token, refresh_token: "replacement" };

  await store.set("local", replacement);
  assert.deepEqual(JSON.parse(await readFile(file, "utf8")), replacement);
  assert.deepEqual(await new FileSessionStore(file).get("local"), replacement);
  assert.deepEqual(await readdir(directory), ["credentials.json"]);
  await store.del("local");
  await store.del("local");
  assert.equal(await store.get("local"), undefined);
});

test("preserves other keys, reloads disk changes, and propagates invalid files", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "mcp-file-session-"));

  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "nested", "credentials.json");
  const store = new FileSessionStore(file, "driver");

  await store.set("driver", token);
  assert.equal(await store.get("other"), undefined);
  await assert.rejects(store.set("other", token));
  await store.del("other");
  assert.deepEqual(await store.get("driver"), token);
  await writeFile(
    file,
    JSON.stringify({ ...token, refresh_token: "external-update" }),
  );
  assert.equal((await store.get("driver"))?.refresh_token, "external-update");
  await assert.rejects(store.get("driver", { signal: AbortSignal.abort() }));
  await writeFile(file, "not JSON");
  await assert.rejects(store.get("driver"));
  await writeFile(file, "{}");
  await assert.rejects(store.get("driver"));
  await assert.rejects(new FileSessionStore(directory).get("local"));
});
