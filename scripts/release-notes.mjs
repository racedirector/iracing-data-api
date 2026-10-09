/** Package release presentation over the canonical impact graph. No publication.
 * Select the highest lower SemVer same-package ancestor tag (lexical tie-break
 * for build metadata). First releases include reachable first-parent history.
 * Notes include dependency/generation impact, omitting global-only maintenance.
 * Run from the exact release checkout with full history and installed dependencies.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeImpact, loadWorkspaces, root } from "./workspace-impact.mjs";

export function semver(version) {
  const match =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(
      version,
    );
  if (!match || match[4]?.split(".").some((part) => /^0\d+$/.test(part)))
    throw new Error(`Invalid SemVer: ${version}`);
  return { core: match.slice(1, 4).map(BigInt), pre: match[4]?.split(".") };
}

export function publicationTarget({ tag, packageName, distTag }) {
  const name = tag ? tag.slice(0, tag.lastIndexOf("@")) : packageName;
  if (!/^@iracing-data\/[a-z0-9][a-z0-9-]*$/.test(name ?? ""))
    throw new Error(`Invalid package name: ${name}`);
  if (tag) {
    const version = tag.slice(tag.lastIndexOf("@") + 1);
    return { name, dist_tag: semver(version).pre ? "next" : "latest" };
  }
  if (!["latest", "next"].includes(distTag))
    throw new Error(`Invalid npm dist-tag: ${distTag}`);
  return { name, dist_tag: distTag };
}

export function compareVersions(left, right) {
  const a = semver(left),
    b = semver(right);
  for (let i = 0; i < 3; i++)
    if (a.core[i] !== b.core[i]) return a.core[i] > b.core[i] ? 1 : -1;
  if (!a.pre || !b.pre) return a.pre ? -1 : b.pre ? 1 : 0;
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    const x = a.pre[i],
      y = b.pre[i];
    if (x === y) continue;
    if (x === undefined || y === undefined) return x === undefined ? -1 : 1;
    const nx = /^\d+$/.test(x),
      ny = /^\d+$/.test(y);
    if (nx && ny) return BigInt(x) > BigInt(y) ? 1 : -1;
    if (nx !== ny) return nx ? -1 : 1;
    return x > y ? 1 : -1;
  }
  return 0;
}

export function previousTag(tags, name, version) {
  const prefix = `${name}@`;
  return tags
    .filter((tag) => {
      if (!tag.startsWith(prefix)) return false;
      try {
        return compareVersions(tag.slice(prefix.length), version) < 0;
      } catch {
        return false;
      }
    })
    .sort(
      (a, b) =>
        compareVersions(b.slice(prefix.length), a.slice(prefix.length)) ||
        (a < b ? -1 : a > b ? 1 : 0),
    )[0];
}

export function releaseNotes(
  directory,
  tag,
  workspaces = loadWorkspaces(directory),
) {
  const git = (...args) =>
    execFileSync("git", args, { cwd: directory, encoding: "utf8" }).trim();
  if (git("rev-parse", "--is-shallow-repository") !== "false")
    throw new Error("Release notes require full Git history");
  const split = tag.lastIndexOf("@");
  const name = tag.slice(0, split),
    version = tag.slice(split + 1);
  const parsed = semver(version);
  const pkg = workspaces.find(
    (entry) =>
      entry.name === name &&
      entry.ecosystem === "npm" &&
      entry.managed &&
      ["public-release-target", "generated-public-client"].includes(entry.kind),
  );
  if (!pkg) throw new Error(`Not a managed public npm package: ${name}`);
  if (pkg.version !== version)
    throw new Error(
      `Tag version ${version} does not match manifest ${pkg.version}`,
    );
  const commit = git(
    "rev-parse",
    "--verify",
    "--end-of-options",
    `refs/tags/${tag}^{commit}`,
  );
  if (commit !== git("rev-parse", "HEAD"))
    throw new Error("Check out the exact release tag before generating notes");
  const previous = previousTag(
    git("tag", "--merged", commit).split("\n"),
    name,
    version,
  );
  const range = previous
    ? `${git("rev-parse", `refs/tags/${previous}^{commit}`)}..${commit}`
    : commit;
  const commits = git("rev-list", "--first-parent", "--reverse", range)
    .split("\n")
    .filter(Boolean);
  const relevant = commits.filter((sha) => {
    const files = git(
      "diff-tree",
      "--root",
      "--first-parent",
      "-m",
      "--no-commit-id",
      "--name-only",
      "--no-renames",
      "-r",
      "-z",
      sha,
    )
      .split("\0")
      .filter(Boolean);
    return analyzeImpact(files, workspaces, {
      includeGlobal: false,
    }).managedReleaseCandidates.some((entry) => entry.name === name);
  });
  const url = "https://github.com/racedirector/iracing-data-api";
  const lines = [
    `# ${name} ${version}`,
    "",
    "```sh",
    `npm install ${name}@${version}`,
    "```",
    "",
    previous
      ? `Previous package release: [${previous}](${url}/releases/tag/${encodeURIComponent(previous)}).`
      : "First package release; changes below cover reachable package history.",
    "",
    "## Package changes",
    "",
  ];
  for (const sha of relevant) {
    const subject = git("show", "-s", "--format=%s", sha).replace(
      /[\\`*_\[\]<>]/g,
      "\\$&",
    );
    lines.push(`- ${subject} ([${sha.slice(0, 7)}](${url}/commit/${sha}))`);
  }
  if (!relevant.length)
    lines.push("No package-specific changes found in this comparison range.");
  lines.push(
    "",
    "Includes package, dependency and generated-source impact; global-only repository maintenance is omitted.",
  );
  if (previous)
    lines.push(
      "",
      `[Repository comparison](${url}/compare/${encodeURIComponent(previous)}...${encodeURIComponent(tag)}) (includes all repository changes).`,
    );
  return {
    body: `${lines.join("\n")}\n`,
    prerelease: Boolean(parsed.pre),
    previous,
    commits: relevant,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const [tag, output, githubOutput] = process.argv.slice(2);
    if (!tag || process.argv.length > 5)
      throw new Error(
        "Usage: node scripts/release-notes.mjs <tag> [notes-file] [github-output]",
      );
    const notes = releaseNotes(root, tag);
    if (output) fs.writeFileSync(output, notes.body);
    else process.stdout.write(notes.body);
    if (githubOutput)
      fs.appendFileSync(githubOutput, `prerelease=${notes.prerelease}\n`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
