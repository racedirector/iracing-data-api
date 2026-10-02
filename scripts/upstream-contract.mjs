import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";

export const sources = Object.freeze({
  oauth: "https://oauth.iracing.com/oauth2/book/print.html",
  data: "https://members-ng.iracing.com/data/doc",
});
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = 1;
const sensitive =
  /^(authorization|cookie|set-cookie|access_token|refresh_token|id_token|client_secret|password|secret)$/i;
const fail = (message) => {
  throw new Error(message);
};

// Do not include input, request bodies, headers, or underlying exceptions in errors.
export function redact(text, secrets = []) {
  for (const secret of secrets
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)) {
    text = text.split(secret).join("[REDACTED]");
  }
  return text
    .replace(/\bBearer\s+[^\s"'<>]+/gi, "Bearer [REDACTED]")
    .replace(
      /([?&](?:access_token|refresh_token|client_secret|password|code|signature|sig)=)[^&#\s"'<>]*/gi,
      "$1[REDACTED]",
    );
}

function canonical(value, secrets) {
  if (typeof value === "string") return redact(value, secrets);
  if (Array.isArray(value))
    return value.map((item) => canonical(item, secrets));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [
          redact(key, secrets),
          sensitive.test(key) && typeof value[key] === "string"
            ? "[REDACTED]"
            : canonical(value[key], secrets),
        ]),
    );
  }
  return value;
}

export const serialize = (value) => `${JSON.stringify(value, null, 2)}\n`;
export const hash = (value) =>
  createHash("sha256").update(serialize(value)).digest("hex");

export function normalize(kind, input, secrets = []) {
  if (typeof input !== "string" || !input.trim())
    fail("Empty upstream document");
  if (kind === "data") {
    let document;
    try {
      document = JSON.parse(input);
    } catch {
      fail("Invalid Data API JSON");
    }
    // /data/doc is a service -> endpoint -> documentation map, not a login/error body.
    if (
      !document ||
      Array.isArray(document) ||
      typeof document !== "object" ||
      !Object.keys(document).length ||
      !Object.values(document).every(
        (service) =>
          service &&
          typeof service === "object" &&
          !Array.isArray(service) &&
          Object.keys(service).length &&
          Object.values(service).every(
            (endpoint) =>
              endpoint &&
              typeof endpoint === "object" &&
              !Array.isArray(endpoint) &&
              typeof endpoint.link === "string" &&
              endpoint.link.startsWith("https://members-ng.iracing.com/data/"),
          ),
      )
    ) {
      fail("Expected Data API service/endpoint documentation map");
    }
    return canonical(document, secrets);
  }
  if (kind !== "oauth") fail("Unknown upstream kind");
  const errors = [];
  const document = parse(input, {
    onParseError: (error) => errors.push(error.code),
  });
  if (
    errors.some((code) => code !== "missing-doctype") ||
    !/<\/main\s*>/i.test(input)
  )
    fail("Malformed OAuth HTML");
  const mains = [];
  function find(node) {
    if (node.tagName === "main") mains.push(node);
    for (const child of node.childNodes || []) find(child);
  }
  find(document);
  if (mains.length !== 1) fail("Expected one OAuth book main element");
  function visit(node, pre = false) {
    if (node.nodeName === "#text") {
      const text = pre
        ? node.value.replace(/\r\n?/g, "\n")
        : node.value.replace(/\s+/g, " ").trim();
      return text ? redact(text, secrets) : null;
    }
    if (
      !node.tagName ||
      ["script", "style", "nav", "iframe"].includes(node.tagName)
    )
      return null;
    const attributes = Object.fromEntries(
      (node.attrs || [])
        .filter(({ name }) =>
          ["href", "src", "alt", "title", "colspan", "rowspan"].includes(name),
        )
        .sort((a, b) => a.name.localeCompare(b.name, "en"))
        .map(({ name, value }) => [name, redact(value, secrets)]),
    );
    const children = (node.childNodes || [])
      .map((child) => visit(child, pre || node.tagName === "pre"))
      .filter((child) => child !== null);
    return { tag: node.tagName, attributes, children };
  }
  const content = visit(mains[0]);
  if (!content.children.length || !JSON.stringify(content).includes("iRacing"))
    fail("Not an iRacing OAuth book");
  return content;
}

export function snapshot(
  kind,
  input,
  {
    mode = "fixture",
    capturedAt = new Date().toISOString(),
    secrets = [],
  } = {},
) {
  if (
    !["live", "fixture"].includes(mode) ||
    !Number.isFinite(Date.parse(capturedAt))
  )
    fail("Invalid provenance");
  const content = normalize(kind, input, secrets);
  return {
    formatVersion: version,
    kind,
    contentHash: hash(content),
    content,
    provenance: {
      source: sources[kind],
      capturedAt,
      mode,
      normalizerVersion: version,
    },
  };
}

export function validateSnapshot(value) {
  if (
    !value ||
    value.formatVersion !== version ||
    !sources[value.kind] ||
    value.provenance?.normalizerVersion !== version ||
    value.provenance.source !== sources[value.kind] ||
    !["fixture", "live"].includes(value.provenance.mode) ||
    !Number.isFinite(Date.parse(value.provenance.capturedAt)) ||
    !value.content ||
    hash(value.content) !== value.contentHash
  )
    fail("Invalid or corrupt snapshot");
  return value;
}

export function diff(before, after) {
  validateSnapshot(before);
  validateSnapshot(after);
  if (before.kind !== after.kind)
    fail("Cannot compare different upstream sources");
  const changes = [];
  function compare(a, b, pointer) {
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    if (
      a &&
      b &&
      typeof a === "object" &&
      typeof b === "object" &&
      Array.isArray(a) === Array.isArray(b)
    ) {
      for (const key of [
        ...new Set([...Object.keys(a), ...Object.keys(b)]),
      ].sort()) {
        compare(
          a[key],
          b[key],
          `${pointer}/${key.replace(/~/g, "~0").replace(/\//g, "~1")}`,
        );
      }
    } else
      changes.push({
        path: pointer || "/",
        operation:
          a === undefined ? "added" : b === undefined ? "removed" : "changed",
        ...(a === undefined ? {} : { before: a }),
        ...(b === undefined ? {} : { after: b }),
      });
  }
  compare(before.content, after.content, "");
  return {
    kind: before.kind,
    beforeHash: before.contentHash,
    afterHash: after.contentHash,
    changed: changes.length > 0,
    changes,
  };
}

export async function capture(kind, { token, fetcher = fetch } = {}) {
  if (!sources[kind]) fail("Unknown upstream kind");
  if (kind === "data" && (!token || /[\r\n]/.test(token)))
    fail(
      "Set IRACING_ACCESS_TOKEN to an existing valid token with iracing.auth scope",
    );
  let response;
  try {
    response = await fetcher(sources[kind], {
      redirect: "error",
      signal: AbortSignal.timeout(30000),
      headers: {
        Accept: kind === "data" ? "application/json" : "text/html",
        ...(kind === "data" ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    fail(
      "Upstream request failed (network, timeout, or redirect); no response saved",
    );
  }
  if (!response.ok)
    fail(`Upstream returned HTTP ${response.status}; no response saved`);
  const type = response.headers.get("content-type") || "";
  if (!type.includes(kind === "data" ? "application/json" : "text/html"))
    fail("Unexpected upstream content type");
  let input;
  try {
    input = await response.text();
  } catch {
    fail("Unable to read upstream response");
  }
  return snapshot(kind, input, { mode: "live", secrets: [token] });
}

async function readSnapshot(filename) {
  try {
    return validateSnapshot(JSON.parse(await fs.readFile(filename, "utf8")));
  } catch {
    fail("Cannot read valid snapshot");
  }
}

// All CLI writes are confined to ignored evidence, never maintained contracts.
async function writeEvidence(filename, value) {
  const base = path.join(root, ".upstream-contract");
  await fs.mkdir(base, { recursive: true, mode: 0o700 });
  const actualBase = await fs.realpath(base);
  if (
    actualBase !== base ||
    path.basename(filename) !== filename ||
    !filename.endsWith(".json")
  )
    fail("Output must be a JSON basename in .upstream-contract");
  const destination = path.join(base, filename);
  // Exclusive creation also refuses existing files/symlinks; never overwrite evidence.
  await fs.writeFile(destination, serialize(value), {
    flag: "wx",
    mode: 0o600,
  });
  console.info(`Saved .upstream-contract/${filename}`);
}

export async function main(args) {
  const [command, kind, input, output] = args;
  if (command === "capture" && args.length === 3) {
    await writeEvidence(
      input,
      await capture(kind, { token: process.env.IRACING_ACCESS_TOKEN }),
    );
  } else if (command === "fixture" && args.length === 4) {
    await writeEvidence(
      output,
      snapshot(kind, await fs.readFile(input, "utf8"), {
        secrets: [process.env.IRACING_ACCESS_TOKEN],
      }),
    );
  } else if (command === "diff" && args.length === 4) {
    const result = diff(await readSnapshot(kind), await readSnapshot(input));
    await writeEvidence(output, result);
    return result.changed ? 2 : 0;
  } else
    fail(
      "Usage: capture <oauth|data> <output.json> | fixture <oauth|data> <input> <output.json> | diff <before.json> <after.json> <diff.json>",
    );
  return 0;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    process.exitCode = await main(process.argv.slice(2));
  } catch {
    console.error(
      "Upstream contract command failed; check arguments, credentials, input shape, network, and unused output name. No raw error or response is logged.",
    );
    process.exitCode = 1;
  }
}
