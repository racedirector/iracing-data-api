import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parse } from "yaml";
import {
  compareVersions,
  previousTag,
  publicationTarget,
  releaseNotes,
  semver,
} from "./release-notes.mjs";
import { verificationPlan } from "./verify.mjs";
import { analyzeImpact } from "./workspace-impact.mjs";

const workspaces = [
  {
    name: "@iracing-data/test",
    path: "packages/test",
    ecosystem: "npm",
    kind: "public-release-target",
    managed: true,
    dependencies: ["@iracing-data/dep"],
    version: "1.0.0-beta.10",
  },
  {
    name: "@iracing-data/dep",
    path: "packages/dep",
    ecosystem: "npm",
    kind: "public-release-target",
    managed: true,
    dependencies: [],
    version: "1.0.0",
  },
  {
    name: "@iracing-data/other",
    path: "packages/other",
    ecosystem: "npm",
    kind: "public-release-target",
    managed: true,
    dependencies: [],
    version: "1.0.0",
  },
  {
    name: "@iracing-data/fetch",
    path: "packages/api/client/fetch",
    ecosystem: "npm",
    kind: "generated-public-client",
    managed: true,
    dependencies: [],
    version: "1.0.0",
  },
];
const name = workspaces[0].name;

test("publication classification shares SemVer rules and preserves explicit dispatch", () => {
  assert.deepEqual(
    publicationTarget({ tag: `${name}@1.0.0+build-with-hyphen` }),
    {
      name,
      dist_tag: "latest",
    },
  );
  assert.deepEqual(
    publicationTarget({ tag: `${name}@1.0.0-beta-test.1+build` }),
    {
      name,
      dist_tag: "next",
    },
  );
  for (const distTag of ["latest", "next"])
    assert.deepEqual(publicationTarget({ packageName: name, distTag }), {
      name,
      dist_tag: distTag,
    });
  assert.throws(
    () => publicationTarget({ tag: `${name}@1.0.0-01` }),
    /Invalid SemVer/,
  );
  assert.throws(
    () => publicationTarget({ packageName: "other", distTag: "latest" }),
    /Invalid package/,
  );
  assert.throws(
    () => publicationTarget({ packageName: name, distTag: "other" }),
    /Invalid npm dist-tag/,
  );
});

function fixture(t) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "iracing-release-test-"),
  );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  git("init", "-b", "main");
  git("config", "user.name", "Release test");
  git("config", "user.email", "release@example.invalid");
  git("config", "commit.gpgSign", "false");
  git("config", "tag.gpgSign", "false");
  function commit(file, subject, text = subject) {
    fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    fs.writeFileSync(path.join(directory, file), text);
    git("add", "--", file);
    git("commit", "-m", subject);
    return git("rev-parse", "HEAD");
  }
  return { directory, git, commit };
}

test("strict SemVer ordering handles numeric prereleases and build metadata", () => {
  const ordered = [
    "1.0.0-alpha",
    "1.0.0-alpha.2",
    "1.0.0-alpha.10",
    "1.0.0-beta",
    "1.0.0",
    "1.0.1",
    "1.0.10",
    "2.0.0",
  ];
  for (let i = 1; i < ordered.length; i++)
    assert.equal(compareVersions(ordered[i - 1], ordered[i]), -1);
  assert.equal(compareVersions("1.0.0+build-z", "1.0.0+build-a"), 0);
  assert.equal(semver("1.0.0+build-with-hyphen").pre, undefined);
  for (const invalid of [
    "01.0.0",
    "1.0",
    "1.0.0-01",
    "1.0.0-",
    "1.0.0+",
    "1.0.0-alpha..1",
  ])
    assert.throws(() => semver(invalid), /Invalid SemVer/);
});

test("previous tag is same package, lower SemVer, with deterministic build tie", () => {
  const tags = [
    `${name}@1.0.0-beta.9`,
    `${name}@1.0.0-alpha.10`,
    `${name}@1.0.0`,
    "@iracing-data/other@1.0.0-beta.9",
    `${name}@nonsense`,
  ];
  assert.equal(
    previousTag(tags, name, "1.0.0-beta.10"),
    `${name}@1.0.0-beta.9`,
  );
  assert.equal(
    previousTag(
      [`${name}@1.0.0+a`, `${name}@1.0.0+b`].reverse(),
      name,
      "1.0.1",
    ),
    `${name}@1.0.0+a`,
  );
  assert.equal(previousTag(tags, name, "0.0.1"), undefined);
});

test("release scope suppresses global-only maintenance without weakening normal impact", () => {
  assert.equal(
    analyzeImpact([".github/workflows/ci.yml"], workspaces)
      .managedReleaseCandidates.length,
    workspaces.length,
  );
  assert.deepEqual(
    analyzeImpact([".github/workflows/ci.yml"], workspaces, {
      includeGlobal: false,
    }).managedReleaseCandidates,
    [],
  );
  assert.ok(
    analyzeImpact(
      [".github/workflows/ci.yml", "packages/dep/source.js"],
      workspaces,
      { includeGlobal: false },
    ).managedReleaseCandidates.some((entry) => entry.name === name),
  );
});

test("notes use reachable package tags and include dependency changes, excluding unrelated churn", (t) => {
  const f = fixture(t);
  f.commit("packages/test/source.js", "initial package");
  f.git("tag", "-a", `${name}@1.0.0-beta.2`, "-m", "prior release");
  f.git("checkout", "-b", "side");
  f.commit("packages/test/side.js", "unreachable package change");
  f.git("tag", `${name}@1.0.0-beta.9`);
  f.git("checkout", "main");
  f.commit("packages/other/source.js", "unrelated package");
  f.commit(".github/workflows/ci.yml", "unrelated CI");
  const dep = f.commit("packages/dep/source.js", "dependency improvement");
  const own = f.commit("packages/test/source.js", "package improvement");
  const tag = `${name}@1.0.0-beta.10`;
  f.git("tag", tag);
  const notes = releaseNotes(f.directory, tag, workspaces);
  assert.equal(notes.previous, `${name}@1.0.0-beta.2`);
  assert.equal(notes.prerelease, true);
  assert.deepEqual(notes.commits, [dep, own]);
  assert.match(notes.body, /npm install @iracing-data\/test@1.0.0-beta.10/);
  assert.doesNotMatch(notes.body, /unrelated|unreachable/);
  assert.throws(
    () =>
      releaseNotes(
        f.directory,
        tag,
        workspaces.map((entry) => ({ ...entry, managed: false })),
      ),
    /Not a managed/,
  );
  assert.throws(
    () =>
      releaseNotes(
        f.directory,
        tag,
        workspaces.map((entry) => ({ ...entry, version: "9.0.0" })),
      ),
    /does not match manifest/,
  );
  f.commit("README.md", "later checkout");
  assert.throws(
    () => releaseNotes(f.directory, tag, workspaces),
    /exact release tag/,
  );
});

test("first release includes schema/codegen impact, renames, deletions and merge changes", (t) => {
  const f = fixture(t);
  const schema = f.commit("packages/api/schema/source.js", "schema change");
  f.git("checkout", "-b", "implementation");
  f.commit("scripts/client-presentation/fetch.md", "presentation change");
  f.git("checkout", "main");
  f.commit("README.md", "unrelated docs");
  f.git("merge", "--no-ff", "implementation", "-m", "merge presentation");
  const merge = f.git("rev-parse", "HEAD");
  f.git(
    "mv",
    "packages/api/schema/source.js",
    "packages/api/schema/renamed.js",
  );
  f.git("commit", "-m", "rename schema");
  const rename = f.git("rev-parse", "HEAD");
  f.git("rm", "packages/api/schema/renamed.js");
  f.git("commit", "-m", "delete schema");
  const deletion = f.git("rev-parse", "HEAD");
  f.git("tag", "@iracing-data/fetch@1.0.0");
  const notes = releaseNotes(
    f.directory,
    "@iracing-data/fetch@1.0.0",
    workspaces,
  );
  assert.equal(notes.prerelease, false);
  assert.equal(notes.previous, undefined);
  assert.deepEqual(notes.commits, [schema, merge, rename, deletion]);
  assert.match(notes.body, /First package release/);
});

test("shallow history and missing release tags fail rather than producing empty notes", (t) => {
  const f = fixture(t);
  f.commit("packages/test/source.js", "package");
  const tag = `${name}@1.0.0-beta.10`;
  assert.throws(() => releaseNotes(f.directory, tag, workspaces));
  f.git("tag", tag);
  fs.writeFileSync(
    path.join(f.directory, ".git", "shallow"),
    `${f.git("rev-parse", "HEAD")}\n`,
  );
  assert.throws(
    () => releaseNotes(f.directory, tag, workspaces),
    /full Git history/,
  );
});

test("workflow preserves publication gates and consumes package notes/prerelease state", () => {
  const workflow = parse(
    fs.readFileSync(
      new URL("../.github/workflows/release.yml", import.meta.url),
      "utf8",
    ),
  );
  const job = workflow.jobs["github-release"];
  assert.equal(job.needs, "publish");
  assert.equal(job.if, "startsWith(github.ref, 'refs/tags/')");
  assert.equal(job.steps[0].with["fetch-depth"], 0);
  const notes = job.steps.find((step) => step.id === "notes");
  assert.equal(notes.env.RELEASE_TAG, "${{ github.ref_name }}");
  assert.match(notes.run, /release-notes.mjs/);
  const create = job.steps.at(-1);
  assert.equal(create.env.PRERELEASE, "${{ steps.notes.outputs.prerelease }}");
  assert.match(create.run, /--notes-file/);
  assert.match(create.run, /--prerelease --latest=false/);
  assert.doesNotMatch(create.run, /--generate-notes/);
  assert.equal(workflow.on.workflow_dispatch.inputs.dist_tag.default, "next");
  const resolve = workflow.jobs.publish.steps.find((step) => step.id === "pkg");
  assert.match(resolve.run, /publicationTarget/);
  assert.equal(resolve.env.DIST_TAG, "${{ inputs.dist_tag }}");
  assert.equal(resolve.env.RELEASE_PACKAGE, "${{ inputs.package }}");
  assert.ok(
    verificationPlan("repo", { workspaces }).some((step) =>
      step.args.includes("test:release"),
    ),
  );
});
