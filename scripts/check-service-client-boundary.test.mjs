import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  checkServiceClientBoundary,
  classifySource,
} from "./check-service-client-boundary.mjs";

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "service-boundary-"));
  for (const [file, content] of Object.entries(files)) {
    const destination = path.join(root, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
  }
  return root;
}

test("classifies ownership surfaces before applying endpoint policy", () => {
  assert.equal(classifySource("apps/app/src/index.ts"), "runtime");
  assert.equal(classifySource("scripts/tool.mjs"), "repository-tool");
  assert.equal(
    classifySource("packages/api/client/fetch/runtime.ts"),
    "canonical",
  );
  assert.equal(
    classifySource("packages/helpers/api-schema-to-openapi/src/index.ts"),
    "canonical",
  );
  assert.equal(classifySource("apps/app/test/client.test.ts"), "ignored");
  assert.equal(classifySource("docs/example.md"), "ignored");
});

test("rejects hard-coded modeled Data API and OAuth service endpoints", (t) => {
  const root = fixture({
    "apps/app/src/data.ts":
      'export const endpoint = "https://members-ng.iracing.com/data/member/info";\n',
    "apps/app/src/oauth.ts":
      'export const endpoint = "https://oauth.iracing.com/oauth2/token";\n',
    "apps/app/src/relative.ts": 'fetch("/data/member/info");\n',
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const errors = checkServiceClientBoundary(root);
  assert.equal(errors.length, 3);
  assert.ok(errors.some((error) => error.includes("data.ts")));
  assert.ok(errors.some((error) => error.includes("oauth.ts")));
  assert.ok(errors.some((error) => error.includes("relative.ts")));
});

test("rejects application imports from repository-root scripts", (t) => {
  const root = fixture({
    "apps/app/src/index.ts":
      'import { capture } from "../../../scripts/transport.mjs";\nvoid capture;\n',
    "scripts/transport.mjs": "export const capture = true;\n",
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.match(checkServiceClientBoundary(root).join("\n"), /must not import/);
});

test("rejects a root-tool transport escape hatch for modeled calls", (t) => {
  const root = fixture({
    "scripts/evidence.mjs":
      'const url = "https://members-ng.iracing.com/data/doc";\nexport async function run() { return fetch(url); }\n',
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.match(
    checkServiceClientBoundary(root).join("\n"),
    /hard-coded modeled iRacing service endpoint/,
  );
});

test("allows canonical/generated ownership, tests, fixtures and docs", (t) => {
  const root = fixture({
    "packages/api/client/fetch/runtime.ts":
      'export const base = "https://members-ng.iracing.com/data/member/info";\n',
    "packages/oauth/client/generated/src/runtime.ts":
      'export const token = "https://oauth.iracing.com/oauth2/token";\n',
    "packages/helpers/oauth-schema-to-openapi/src/index.ts":
      'export const token = "https://oauth.iracing.com/oauth2/token";\n',
    "apps/app/test/runtime.test.ts":
      'fetch("https://members-ng.iracing.com/data/member/info");\n',
    "apps/app/fixtures/docs.ts":
      'export const link = "https://members-ng.iracing.com/data/member/info";\n',
    "docs/example.md": "https://members-ng.iracing.com/data/member/info\n",
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(checkServiceClientBoundary(root), []);
});

test("allows application-owned opaque returned-link resolution", (t) => {
  const root = fixture({
    "apps/iracing-data-mcp/src/gateway/resolve.ts": `
      const allowedHost = "members-ng.iracing.com";
      export async function resolve(link) {
        const url = new URL(link);
        if (url.hostname !== allowedHost) throw new Error("unsafe host");
        return fetch(url);
      }
    `,
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(checkServiceClientBoundary(root), []);
});
