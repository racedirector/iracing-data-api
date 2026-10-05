import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { checkTopology, repositoryRoot } from "./check-topology.js";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "iracing-topology-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  // Copy configuration only; no dependency trees or generated source required.
  function copy(directory = ".") {
    for (const entry of fs.readdirSync(path.join(repositoryRoot, directory), {
      withFileTypes: true,
    })) {
      if (
        [".git", "node_modules", "dist", "target", "bin"].includes(entry.name)
      )
        continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) copy(file);
      else if (
        /^(package\.json|Cargo\.toml|tsconfig.*\.json|pnpm-workspace\.yaml|dist-workspace\.toml|workspace-policy\.json)$/.test(
          entry.name,
        )
      ) {
        fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        fs.copyFileSync(path.join(repositoryRoot, file), path.join(root, file));
      }
    }
  }
  copy();
  return root;
}

function update(root, file, transform) {
  const target = path.join(root, file);
  const value = JSON.parse(fs.readFileSync(target, "utf8"));
  transform(value);
  fs.writeFileSync(target, JSON.stringify(value));
}

test("current topology passes", () => assert.deepEqual(checkTopology(), []));

for (const [name, mutate, expected] of [
  [
    "missing root TypeScript reference",
    (root) => update(root, "tsconfig.json", (j) => j.references.pop()),
    /root TypeScript references: missing/,
  ],
  [
    "nested stale TypeScript reference",
    (root) =>
      update(
        root,
        "packages/helpers/api-schema-to-openapi/tsconfig.json",
        (j) => j.references.push({ path: "./missing.json" }),
      ),
    /stale TypeScript reference/,
  ],
  [
    "public package marked private",
    (root) =>
      update(
        root,
        "packages/oauth/client/package.json",
        (j) => (j.private = true),
      ),
    /private flag disagrees/,
  ],
  [
    "wrong workspace ecosystem",
    (root) =>
      update(
        root,
        "workspace-policy.json",
        (j) => (j.workspaces[0].ecosystem = "cargo"),
      ),
    /policy coverage:/,
  ],
  [
    "unclassified workspace",
    (root) => {
      fs.mkdirSync(path.join(root, "packages/oauth/new"));
      fs.writeFileSync(
        path.join(root, "packages/oauth/new/package.json"),
        '{"name":"unclassified","private":true}',
      );
    },
    /workspace policy: missing packages\/oauth\/new/,
  ],
  [
    "internal publication drift",
    (root) =>
      update(
        root,
        "packages/helpers/api-schema-to-openapi/package.json",
        (j) => delete j.private,
      ),
    /private flag disagrees/,
  ],
  [
    "root publication drift",
    (root) => update(root, "package.json", (j) => delete j.private),
    /\.: private flag disagrees/,
  ],
  [
    "root license drift",
    (root) => update(root, "package.json", (j) => (j.license = "ISC")),
    /license must be MIT/,
  ],
  [
    "missing release member",
    (root) =>
      fs.writeFileSync(
        path.join(root, "dist-workspace.toml"),
        "[workspace]\nmembers = []\n",
      ),
    /managed release set: missing/,
  ],
  [
    "stale TypeScript reference",
    (root) =>
      update(root, "tsconfig.json", (j) =>
        j.references.push({ path: "./deleted" }),
      ),
    /stale TypeScript reference/,
  ],
  [
    "public dependency on internal tool",
    (root) =>
      update(
        root,
        "packages/oauth/client/package.json",
        (j) => (j.dependencies["@iracing-data/cli"] = "workspace:*"),
      ),
    /public package depends on internal/,
  ],
  [
    "deleted workspace",
    (root) =>
      fs.rmSync(path.join(root, "packages/helpers/api-schema-to-openapi"), {
        recursive: true,
      }),
    /workspace policy: unexpected packages\/helpers\/api-schema-to-openapi/,
  ],
  [
    "Cargo membership drift",
    (root) =>
      fs.writeFileSync(
        path.join(root, "Cargo.toml"),
        "[workspace]\nmembers = []\n",
      ),
    /Cargo workspaces: missing/,
  ],
]) {
  test(name, (t) => {
    const root = fixture(t);
    mutate(root);
    assert.match(checkTopology(root).join("\n"), expected);
  });
}

test("stale workspace glob fails", (t) => {
  const root = fixture(t);
  const file = path.join(root, "pnpm-workspace.yaml");
  fs.writeFileSync(
    file,
    fs
      .readFileSync(file, "utf8")
      .replace("packages:", 'packages:\n  - "stale-workspaces/*"'),
  );
  assert.match(
    checkTopology(root).join("\n"),
    /stale workspace pattern: stale-workspaces\/\*/,
  );
});

test("release selection rejects private and unknown packages", () => {
  for (const name of [
    "@iracing-data/cli",
    "@iracing-data/api-schema-to-openapi",
    "unknown",
  ]) {
    assert.match(
      checkTopology(repositoryRoot, name).join("\n"),
      /release target is not a public npm workspace/,
    );
  }
  assert.deepEqual(
    checkTopology(repositoryRoot, "@iracing-data/oauth-client"),
    [],
  );
});
