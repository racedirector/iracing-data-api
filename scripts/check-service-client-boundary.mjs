/**
 * Repository policy for iRacing modeled-service ownership.
 *
 * Authored runtime code must call modeled Data API/OAuth services through the
 * generated clients. Generated output, maintained schema/OpenAPI generation,
 * tests, fixtures and documentation are outside this runtime policy. Root
 * repository scripts are tooling rather than a transport owner and therefore
 * may not recreate modeled-service HTTP access.
 *
 * Opaque URLs returned by typed Data API responses are deliberately allowed:
 * dynamic fetch/request targets are application-owned data-plane behavior. The
 * check only rejects statically authored modeled service endpoints/requests.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const sourceExtension = /\.(?:[cm]?[jt]sx?)$/;
const ignoredDirectoryNames = new Set([
  ".git",
  "coverage",
  "dist",
  "node_modules",
  "output",
  "target",
]);

const canonicalPrefixes = [
  "crates/iracing-data-api-client/",
  "openapi/",
  "packages/api/client/",
  "packages/api/schema/",
  "packages/helpers/api-schema-to-openapi/",
  "packages/helpers/oauth-schema-to-openapi/",
  "packages/oauth/client/generated/",
  "packages/oauth/client/src/schema/",
  "packages/oauth/schema/",
];

function normalize(file) {
  return file.split(path.sep).join("/").replace(/^\.\//, "");
}

function isTestFixtureOrDocumentation(file) {
  const value = normalize(file);
  const parts = value.split("/");
  const basename = parts.at(-1);
  return (
    value.startsWith(".agents/") ||
    value.startsWith("docs/") ||
    parts.some((part) => ["fixtures", "test", "tests"].includes(part)) ||
    /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(basename) ||
    /\.(?:md|mdx)$/.test(basename)
  );
}

export function classifySource(file) {
  const value = normalize(file);
  if (isTestFixtureOrDocumentation(value)) return "ignored";
  if (canonicalPrefixes.some((prefix) => value.startsWith(prefix)))
    return "canonical";
  if (/^scripts\/openapi-generator-/.test(value)) return "canonical";
  if (value.startsWith("scripts/")) return "repository-tool";
  if (
    value.startsWith("apps/") ||
    value.startsWith("packages/") ||
    value.startsWith("examples/")
  )
    return "runtime";
  return "ignored";
}

function walk(root) {
  const files = [];
  function visit(relative = ".") {
    for (const entry of fs.readdirSync(path.join(root, relative), {
      withFileTypes: true,
    })) {
      if (entry.isDirectory() && ignoredDirectoryNames.has(entry.name)) continue;
      const file = normalize(path.posix.join(normalize(relative), entry.name));
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && sourceExtension.test(entry.name)) files.push(file);
    }
  }
  visit();
  return files;
}

const absoluteModeledEndpoint =
  /https:\/\/(?:members-ng\.iracing\.com\/(?:data(?:\/[^\s"'`)]*)?|auth(?:[/?#][^\s"'`)]*)?)|oauth\.iracing\.com\/oauth2\/(?:authorize|token|iracing\/profile)(?:[?#][^\s"'`)]*)?)/;
const rawRelativeModeledRequest =
  /\b(?:fetch|request|axios(?:\.(?:get|post|put|patch|delete))?)\s*\(\s*["'`](?:\/data\/|\/auth(?:[/?#"'`]|$)|\/oauth2\/(?:authorize|token|iracing\/profile)(?:[/?#"'`]|$))/;
const obsoleteEvidenceRuntime =
  /(?:scripts\/upstream-contract\.mjs|\.upstream-contract(?:\/|\b)|\bvalidateSnapshot\b)/;
const importSpecifier =
  /(?:\bfrom\s*|\brequire\s*\(\s*|\bimport\s*\(\s*)["']([^"']+)["']/g;

function importsRootScript(root, file, source) {
  for (const match of source.matchAll(importSpecifier)) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) continue;
    const resolved = path.resolve(root, path.dirname(file), specifier);
    const scripts = path.join(root, "scripts") + path.sep;
    if (resolved.startsWith(scripts)) return specifier;
  }
  return undefined;
}

export function checkServiceClientBoundary(root = repositoryRoot) {
  const errors = [];
  for (const file of walk(root)) {
    const classification = classifySource(file);
    if (!["runtime", "repository-tool"].includes(classification)) continue;
    const source = fs.readFileSync(path.join(root, file), "utf8");

    if (classification === "runtime") {
      const scriptImport = importsRootScript(root, file, source);
      if (scriptImport) {
        errors.push(
          `${file}: authored runtime code must not import repository-root scripts (${scriptImport}); use declared/generated dependencies`,
        );
      }
      if (obsoleteEvidenceRuntime.test(source)) {
        errors.push(
          `${file}: obsolete upstream evidence runtime surface is not an application dependency`,
        );
      }
    }

    if (absoluteModeledEndpoint.test(source)) {
      errors.push(
        `${file}: hard-coded modeled iRacing service endpoint bypasses generated-client ownership`,
      );
    }
    if (rawRelativeModeledRequest.test(source)) {
      errors.push(
        `${file}: raw request to a modeled iRacing service path bypasses generated-client ownership`,
      );
    }
  }
  return errors.sort();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const errors = checkServiceClientBoundary(repositoryRoot);
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    } else {
      console.info(
        "Modeled iRacing service calls remain behind canonical/generated client ownership.",
      );
    }
  } catch (error) {
    console.error(`Service client boundary check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
