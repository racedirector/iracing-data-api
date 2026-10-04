import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkTopology, repositoryRoot } from "./check-topology.js";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "iracing-topology-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync(repositoryRoot, root, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(repositoryRoot, source);
      return !relative
        .split(path.sep)
        .some((part) => [".git", "node_modules", "dist", "bin", "target"].includes(part));
    },
  });
  return root;
}

for (const [name, mutate, expected] of [
  [
    "missing root TypeScript reference",
    (root) => {
      const file = path.join(root, "tsconfig.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.references = value.references.filter(
        (reference) => reference.path !== "./packages/oauth/schema",
      );
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /root TypeScript references: missing packages\/oauth\/schema/,
  ],
  [
    "nested stale TypeScript reference",
    (root) => {
      const file = path.join(root, "packages/oauth/client/tsconfig.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.references = [{ path: "./missing" }];
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /stale TypeScript reference \.\/missing/,
  ],
  [
    "public package marked private",
    (root) => {
      const file = path.join(root, "packages/oauth/client/package.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.private = true;
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /private flag disagrees with public-release-target/,
  ],
  [
    "wrong workspace ecosystem",
    (root) => {
      const file = path.join(root, "workspace-policy.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.workspaces.find(
        (entry) => entry.path === "packages/oauth/client",
      ).ecosystem = "cargo";
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /npm policy coverage: missing packages\/oauth\/client/,
  ],
  [
    "unclassified workspace",
    (root) => {
      const file = path.join(root, "workspace-policy.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.workspaces = value.workspaces.filter(
        (entry) => entry.path !== "packages/oauth/client",
      );
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /workspace policy: missing packages\/oauth\/client/,
  ],
  [
    "internal publication drift",
    (root) => {
      const file = path.join(root, "packages/api/router/package.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.private = false;
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /private flag disagrees with internal-tool/,
  ],
  [
    "root publication drift",
    (root) => {
      const file = path.join(root, "package.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.private = false;
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /private flag disagrees with repository-root/,
  ],
  [
    "root license drift",
    (root) => {
      const file = path.join(root, "package.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.license = "UNLICENSED";
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /license must be MIT/,
  ],
  [
    "missing release member",
    (root) =>
      fs.writeFileSync(
        path.join(root, "dist-workspace.toml"),
        '[workspace]\nmembers = ["npm:packages/oauth/client"]\n',
      ),
    /managed release set: missing/,
  ],
  [
    "stale TypeScript reference",
    (root) => {
      const file = path.join(root, "tsconfig.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.references.push({ path: "./missing" });
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /stale TypeScript reference \.\/missing/,
  ],
  [
    "public dependency on internal tool",
    (root) => {
      const file = path.join(root, "packages/oauth/client/package.json");
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      value.dependencies["@iracing-data/api-router"] = "workspace:*";
      fs.writeFileSync(file, JSON.stringify(value, null, 2));
    },
    /public package depends on internal/,
  ],
  [
    "deleted workspace",
    (root) =>
      fs.rmSync(path.join(root, "packages/api/router"), { recursive: true }),
    /workspace policy: unexpected packages\/api\/router/,
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
    "@iracing-data/api-router",
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
