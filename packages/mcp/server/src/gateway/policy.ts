/**
 * Upstream security policy and bounds, shared by gateway resolution.
 *
 * Only the maintained HTTPS API origin and explicit cache hosts are permitted.
 * Cache paths reject traversal/ambiguous encoding before URL normalization can
 * hide it; chunk filenames must resolve within a validated cache directory.
 * DNS addresses must be publicly routed. transport.ts pins the vetted address
 * while preserving original-host TLS verification, preventing a second resolution
 * from bypassing policy. Redirects and unsafe links must fail, never widen access.
 *
 * The declarations below are the canonical resource limits. Limits bound work and
 * retention, not latency guarantees. Signed cache URLs and upstream credentials
 * are internal data and must never enter tool output or diagnostics.
 */
import { BlockList, isIP } from "node:net";
import { ApplicationFailure } from "../diagnostics/errors.js";

export const API_ORIGIN = "https://members-ng.iracing.com";
export const CACHE_HOSTS = Object.freeze([
  "scorpio-assets.s3.us-east-1.amazonaws.com",
  "scorpio-assets.s3.amazonaws.com",
]);
export const GATEWAY_LIMITS = Object.freeze({
  responseBytes: 8 * 1024 * 1024,
  callBytes: 16 * 1024 * 1024,
  fetches: 8,
  fetchTimeoutMs: 10_000,
  deadlineMs: 30_000,
  networkOperations: 2,
  calls: 8,
  cursors: 32,
  retainedBytes: 32 * 1024 * 1024,
  cursorTtlMs: 300_000,
});

/** Throw DATA_RESOLUTION_FAILED with reason unsafe_link. */
export function unsafeLink(): never {
  throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
    reason: "unsafe_link",
  });
}

/** Throw DATA_RESOLUTION_FAILED with reason invalid_data. */
export function invalidData(): never {
  throw new ApplicationFailure("DATA_RESOLUTION_FAILED", {
    reason: "invalid_data",
  });
}

/**
 * Reject ambiguous encodings before WHATWG URL normalization can hide traversal.
 * Return an HTTPS URL on an allowed cache host or throw DATA_RESOLUTION_FAILED
 * with reason unsafe_link. Directory URLs must end in a slash and have no query.
 */
export function cacheUrl(input: string, directory = false): URL {
  if (input.length > 8192 || /[\\\s\x00-\x1f\x7f]/.test(input)) {
    unsafeLink();
  }

  let url: URL;

  try {
    url = new URL(input);
  } catch {
    return unsafeLink();
  }

  if (
    url.protocol !== "https:" ||
    !CACHE_HOSTS.includes(url.hostname) ||
    url.username ||
    url.password ||
    url.hash ||
    (url.port && url.port !== "443")
  ) {
    unsafeLink();
  }

  const rawPath = input.slice(input.indexOf("://") + 3).split("?")[0];

  if (
    rawPath.split("/").some((part) => part === "." || part === "..") ||
    /%(?:2e|2f|5c|00|25)/i.test(rawPath) ||
    url.pathname.includes("//")
  ) {
    unsafeLink();
  }

  if (directory && (!url.pathname.endsWith("/") || url.search)) {
    unsafeLink();
  }

  return url;
}

/**
 * Resolve one filename within a validated cache directory.
 * Reject paths, escapes, or names longer than 255 characters with
 * DATA_RESOLUTION_FAILED (unsafe_link).
 */
export function chunkUrl(base: string, filename: string): URL {
  const url = cacheUrl(base, true);

  if (
    !/^[A-Za-z0-9][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+)*$/.test(filename) ||
    filename.length > 255
  ) {
    unsafeLink();
  }

  const child = cacheUrl(new URL(filename, url).href);

  if (
    child.origin !== url.origin ||
    child.pathname !== url.pathname + filename
  ) {
    unsafeLink();
  }

  return child;
}

const denied = new BlockList();

for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 3],
] as const) {
  denied.addSubnet(address, prefix, "ipv4");
}

// Only globally routed IPv6 unicast is accepted; reject mapped/transition/local ranges.
denied.addSubnet("2001::", 23, "ipv6");
denied.addSubnet("2001:db8::", 32, "ipv6");
denied.addSubnet("2002::", 16, "ipv6");
denied.addSubnet("3fff::", 20, "ipv6");

/** Return whether an IP literal passes the gateway's IPv4/IPv6 address policy. */
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);

  if (family === 4) {
    return !denied.check(address, "ipv4");
  }

  if (family === 6) {
    return /^[23][0-9a-f]{3}:/i.test(address) && !denied.check(address, "ipv6");
  }

  return false;
}

/**
 * Convert Retry-After seconds or a date to whole seconds, rounded up and capped at 3,600.
 * `now` is Unix time in milliseconds; missing, invalid, or past values return one second.
 */
export function retryAfter(value: string | null, now: number): number {
  const seconds =
    value && /^\d+$/.test(value)
      ? Number(value)
      : value
        ? (Date.parse(value) - now) / 1000
        : NaN;

  return Number.isFinite(seconds) && seconds >= 0
    ? Math.min(3600, Math.ceil(seconds))
    : 1;
}
