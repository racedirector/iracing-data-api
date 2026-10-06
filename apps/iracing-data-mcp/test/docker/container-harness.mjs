// Read-only test mount, never copied into the production image. The actual main entrypoint,
// session owner, secure store, gateway, protocol and termination handlers remain unchanged.
import assert from "node:assert/strict";
import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { syncBuiltinESMExports, createRequire } from "node:module";

const require = createRequire("/app/package.json");

const { oauthTokenDocumentFileSystem } = await import(
  require.resolve("@iracing-data/oauth-client")
);

const origin = "http://127.0.0.1:3001";

const epoch = Date.UTC(2030, 0, 1);

const offset = Number(process.env.HARNESS_CLOCK_OFFSET ?? 0);

Date.now = () => epoch + offset;
const expected = Number(process.env.HARNESS_EXPECTED_REFRESH ?? 0);

const mode = process.env.HARNESS_GRANT_MODE ?? "normal";

const fault = process.env.HARNESS_FILESYSTEM_FAULT;

const state = { grants: [], api: 0, cache: 0, unexpected: 0, faultCount: 0 };

const jwt = () =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 600 })).toString("base64url")}.SYNTHETIC_SECRET`;

const token = (index) => ({
  access_token: jwt(),
  refresh_token: `SYNTHETIC_REFRESH_${index}`,
  token_type: "Bearer",
  expires_in: 600,
  scope: "iracing.auth",
});

function failOnce(name) {
  if (fault === name && state.faultCount === 0) {
    state.faultCount++;
    throw new Error("SYNTHETIC_SECRET injected filesystem failure");
  }
}

const originalOpen = oauthTokenDocumentFileSystem.open;

oauthTokenDocumentFileSystem.open = async (file, flags, permissions) => {
  const handle = await originalOpen(file, flags, permissions);

  return new Proxy(handle, {
    get(target, key) {
      if (key === "writeFile") {
        return (...args) => {
          if (flags === "wx") {
            failOnce("write");
          }

          return target.writeFile(...args);
        };
      }

      if (key === "sync") {
        return (...args) => {
          failOnce(flags === "wx" ? "file_fsync" : "directory_fsync");

          return target.sync(...args);
        };
      }

      const value = Reflect.get(target, key);

      return typeof value === "function" ? value.bind(target) : value;
    },
  });
};

const originalRename = oauthTokenDocumentFileSystem.rename;

oauthTokenDocumentFileSystem.rename = (...args) => {
  failOnce("rename");

  return originalRename(...args);
};

async function body(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

const fixture = http.createServer(async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/state") {
      return res.end(JSON.stringify(state));
    }

    if (req.url === "/grant") {
      assert.equal(req.method, "POST");
      const form = new URLSearchParams(await body(req));

      assert.equal(form.get("grant_type"), "refresh_token");
      assert.equal(form.get("client_id"), "synthetic-client");
      const index = Number(
        form.get("refresh_token")?.replace("SYNTHETIC_REFRESH_", ""),
      );

      assert.equal(index, expected);
      state.grants.push(index);
      if (mode === "hold") {
        return;
      } // Consumed grant with no response: characterize stop safety.

      if (mode === "disconnect") {
        return req.socket.destroy();
      }

      return res.end(JSON.stringify(token(index + 1)));
    }

    if (req.url === "/api/data/member/info") {
      assert.match(req.headers.authorization ?? "", /^Bearer /);
      state.api++;

      return res.end(
        JSON.stringify({
          link: "https://scorpio-assets.s3.amazonaws.com/member?signature=SYNTHETIC_SECRET",
          expires: new Date(Date.now() + 300000).toISOString(),
        }),
      );
    }

    if (req.url === "/cache/member?signature=SYNTHETIC_SECRET") {
      assert.equal(req.headers.authorization, undefined);
      state.cache++;

      return res.end(
        JSON.stringify({
          cust_id: 7,
          display_name: "Synthetic Driver",
          private: "SYNTHETIC_SECRET",
        }),
      );
    }

    throw new Error("Unexpected fixture route");
  } catch {
    state.unexpected++;
    res.writeHead(500);
    res.end('{"error":"synthetic_fixture_failure"}');
  }
});

await new Promise((resolve) => fixture.listen(3001, "0.0.0.0", resolve));
const originalFetch = globalThis.fetch;

globalThis.fetch = (input, init) => {
  const url = new URL(typeof input === "string" ? input : (input.url ?? input));

  if (url.href !== "https://oauth.iracing.com/oauth2/token") {
    state.unexpected++;
    throw new Error("Unexpected external fetch blocked");
  }

  return originalFetch(`${origin}/grant`, init);
};

dns.lookup = async (hostname) => {
  assert.ok(
    ["members-ng.iracing.com", "scorpio-assets.s3.amazonaws.com"].includes(
      hostname,
    ),
  );

  return [{ address: "93.184.216.34", family: 4 }];
};

https.request = (url, options, callback) => {
  assert.equal(options.method, "GET");
  assert.equal(options.rejectUnauthorized, true);
  assert.equal(options.agent, false);
  let pathname;

  if (
    url.hostname === "members-ng.iracing.com" &&
    url.pathname === "/data/member/info" &&
    url.search === ""
  ) {
    pathname = `/api${url.pathname}`;
  } else if (
    url.hostname === "scorpio-assets.s3.amazonaws.com" &&
    url.pathname === "/member"
  ) {
    pathname = `/cache${url.pathname}${url.search}`;
  } else {
    state.unexpected++;
    throw new Error("Unexpected external wire blocked");
  }

  return http.request(
    `${origin}${pathname}`,
    {
      method: options.method,
      headers: options.headers,
      signal: options.signal,
    },
    callback,
  );
};

syncBuiltinESMExports();
process.on("SIGTERM", () => {
  if (mode !== "hold") {
    fixture.close();
    fixture.closeIdleConnections();
  }
});
await import("/app/dist/main.js");
