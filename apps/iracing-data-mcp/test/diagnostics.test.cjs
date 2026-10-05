const assert = require("node:assert/strict");
const test = require("node:test");
const app = () => import("../dist/index.js");

const expectedCodes = [
  "INVALID_INPUT",
  "AUTHORIZATION_REQUIRED",
  "TOKEN_REFRESH_FAILED",
  "UPSTREAM_UNAUTHORIZED",
  "RATE_LIMITED",
  "UPSTREAM_UNAVAILABLE",
  "DATA_RESOLUTION_FAILED",
  "RESPONSE_LIMIT_EXCEEDED",
  "CURSOR_EXPIRED",
  "NOT_FOUND",
  "CONFIGURATION_ERROR",
  "INTERNAL_ERROR",
];

test("all public codes produce strict, bounded, correlated tool envelopes", async () => {
  const m = await app();
  assert.deepEqual(Object.keys(m.errorPolicy), expectedCodes);
  const context = m.createRequestContext();
  for (const code of expectedCodes) {
    const result = m.toolError(new m.ApplicationFailure(code), context);
    assert.equal(result.isError, true);
    const { error } = result.structuredContent;
    assert.equal(error.code, code);
    assert.equal(error.request_id, context.request_id);
    assert.equal(
      error.retryable,
      ["RATE_LIMITED", "UPSTREAM_UNAVAILABLE"].includes(code),
    );
    assert.ok(error.message.length > 0 && error.message.length <= 180);
    assert.deepEqual(Object.keys(error).sort(), [
      "code",
      "message",
      "request_id",
      "retryable",
    ]);
    assert.deepEqual(
      JSON.parse(result.content[0].text),
      result.structuredContent,
    );
    assert.equal(
      m.ErrorEnvelopeSchema.safeParse(result.structuredContent).success,
      true,
    );
    assert.equal(
      m.ErrorEnvelopeSchema.safeParse({
        error: { ...error, cause: "forbidden" },
      }).success,
      false,
    );
    assert.equal(
      m.ErrorEnvelopeSchema.safeParse({
        error: { ...error, message: "arbitrary upstream text" },
      }).success,
      false,
    );
  }
  assert.notEqual(m.createRequestContext().request_id, context.request_id);
  assert.notEqual(
    m.errorEnvelope(null, { request_id: "client-id" }).error.request_id,
    "client-id",
  );
});

test("retry/reason policy drops inappropriate values and bounds retry delay", async () => {
  const m = await app();
  const envelope = (code, options) =>
    m.errorEnvelope(
      new m.ApplicationFailure(code, options),
      m.createRequestContext(),
    ).error;
  assert.equal(
    envelope("RATE_LIMITED", { retry_after_seconds: 99999 })
      .retry_after_seconds,
    3600,
  );
  assert.equal(
    envelope("RATE_LIMITED", { retry_after_seconds: 0 }).retry_after_seconds,
    0,
  );
  for (const value of [-1, NaN, Infinity, "secret"])
    assert.equal(
      envelope("RATE_LIMITED", { retry_after_seconds: value })
        .retry_after_seconds,
      undefined,
    );
  assert.equal(
    envelope("NOT_FOUND", { retry_after_seconds: 1, reason: "secret" }).reason,
    undefined,
  );
  assert.equal(
    envelope("NOT_FOUND", { retry_after_seconds: 1 }).retry_after_seconds,
    undefined,
  );
  assert.equal(
    envelope("TOKEN_REFRESH_FAILED", {
      reason: "rotation_uncertain",
      retry_after_seconds: 1,
    }).retryable,
    false,
  );
  assert.equal(
    envelope("TOKEN_REFRESH_FAILED", {
      reason: "transient_refresh",
      retry_after_seconds: 2,
    }).retryable,
    true,
  );
  assert.equal(
    envelope("INTERNAL_ERROR", { reason: "transient_refresh" }).reason,
    undefined,
  );
});

test("mapping seams preserve OAuth, entitlement, cache and internal distinctions", async () => {
  const m = await app();
  const oauth = await import("@iracing-data/oauth-client");
  const api = await import("@iracing-data/api-client-fetch");
  const map = (error, context) =>
    m.errorEnvelope(m.mapFailure(error, context), m.createRequestContext())
      .error;
  assert.equal(
    map(new oauth.SessionNotFoundError("synthetic"), {
      domain: "oauth_session",
    }).code,
    "AUTHORIZATION_REQUIRED",
  );
  assert.equal(
    map(oauth.OAuthClaimsError.scopeMissing("synthetic"), {
      domain: "oauth_session",
    }).code,
    "AUTHORIZATION_REQUIRED",
  );
  for (const error of [
    oauth.OAuthRefreshError.missingRefreshToken("synthetic"),
    oauth.OAuthRefreshError.tokenExpired("synthetic"),
    oauth.OAuthRefreshError.from({
      message: "synthetic",
      code: "OAUTH_RESPONSE_BODY_ERROR",
      cause: { error: "invalid_grant", access_token: "MARK_IGNORED" },
    }),
  ]) {
    assert.equal(
      map(error, { domain: "oauth_session" }).reason,
      "revoked_authorization",
    );
  }
  assert.equal(
    map(new oauth.OAuthTokenDocumentError("invalid_document", "synthetic"), {
      domain: "oauth_session",
    }).reason,
    "invalid_session",
  );
  assert.equal(
    map(new Error(), {
      domain: "oauth_session",
      refreshOutcome: "persistence_failed",
    }).reason,
    "persistence_failed",
  );
  assert.equal(
    map(new Error(), {
      domain: "oauth_session",
      refreshOutcome: "rotation_uncertain",
    }).retryable,
    false,
  );
  assert.equal(
    map(new Error(), {
      domain: "oauth_session",
      refreshOutcome: "safe_to_retry",
    }).retryable,
    true,
  );
  assert.equal(map(new Error(), { domain: "oauth_session" }).retryable, false);
  assert.equal(
    map(oauth.ClientMetadataError.missingClientSecret(), {
      domain: "oauth_session",
    }).code,
    "CONFIGURATION_ERROR",
  );
  for (const [status, code] of [
    [401, "UPSTREAM_UNAUTHORIZED"],
    [403, "UPSTREAM_UNAUTHORIZED"],
    [404, "NOT_FOUND"],
    [429, "RATE_LIMITED"],
    [503, "UPSTREAM_UNAVAILABLE"],
    [408, "UPSTREAM_UNAVAILABLE"],
    [400, "DATA_RESOLUTION_FAILED"],
  ]) {
    const error = new api.ResponseError(
      new Response("synthetic", { status, headers: { "retry-after": "120" } }),
    );
    const result = map(error, { domain: "upstream" });
    assert.equal(result.code, code);
    if (status === 429) assert.equal(result.retry_after_seconds, 120);
    if (status === 403) {
      assert.equal(result.reason, "upstream_access_denied");
      assert.equal(
        map(error, {
          domain: "upstream",
          upstreamAuthorization: "account_entitlement",
        }).reason,
        "account_entitlement",
      );
    }
    assert.equal(map(error, { domain: "internal" }).code, "INTERNAL_ERROR");
  }
  const badRetry = new api.ResponseError(
    new Response(null, {
      status: 429,
      headers: { "retry-after": "Bearer synthetic" },
    }),
  );
  assert.equal(
    map(badRetry, { domain: "upstream" }).retry_after_seconds,
    undefined,
  );
  assert.equal(
    map(new api.FetchError(new Error("synthetic")), { domain: "upstream" })
      .code,
    "UPSTREAM_UNAVAILABLE",
  );
  assert.equal(
    map(new api.RequiredError("synthetic"), { domain: "upstream" }).code,
    "INVALID_INPUT",
  );
  assert.equal(
    map(new SyntaxError("synthetic"), { domain: "upstream" }).code,
    "DATA_RESOLUTION_FAILED",
  );
  assert.equal(
    map(new Error("synthetic"), { domain: "internal" }).code,
    "INTERNAL_ERROR",
  );
});

test("protocol faults never become tool failures; unknown exceptions never leak", async () => {
  const m = await app();
  for (const domain of ["http", "mcp_protocol"]) {
    const failure = m.mapFailure(new Error("secret"), { domain });
    assert.equal(failure.domain, domain);
    assert.throws(
      () => m.toolError(failure, m.createRequestContext()),
      m.ProtocolFailure,
    );
    assert.equal(failure.message, "Protocol request rejected.");
  }
  assert.equal(
    m.toolError(new Error("secret"), m.createRequestContext()).structuredContent
      .error.code,
    "INTERNAL_ERROR",
  );
  assert.throws(
    () => m.parseMcpApplicationConfig({ name: "" }),
    m.ApplicationFailure,
  );
});

const cases = {
  bearer: { message: "Bearer MARK_BEARER", cause: new Error("MARK_BEARER") },
  refresh: {
    refresh_token: "MARK_REFRESH",
    nested: [{ access_token: "MARK_ACCESS" }],
  },
  headers: {
    Authorization: "Bearer MARK_HEADER",
    cookie: "MARK_COOKIE",
    nested: { headers: new Headers({ authorization: "MARK_HEADER" }) },
  },
  signed_url: {
    url: "https://cache.example/MARK_PATH?signature=MARK_SIGNATURE",
    message: "MARK_SIGNATURE",
  },
  credentials: {
    credentials: {
      access_token: "MARK_CREDENTIAL",
      refresh_token: "MARK_CREDENTIAL",
    },
    body: '{"access_token":"MARK_CREDENTIAL"}',
  },
  oauth: {
    code: "MARK_CODE",
    state: "MARK_STATE",
    code_verifier: "MARK_PKCE",
    rawOAuthResponse: { body: "MARK_OAUTH" },
  },
  upstream: {
    response: {
      body: "MARK_BODY",
      customer_id: "MARK_CUSTOMER",
      name: "MARK_NAME",
    },
    member_id: "MARK_MEMBER",
  },
  stack: {
    stack: "Error: MARK_STACK\n at /private/MARK_FILESYSTEM/file.js",
    cause: { cause: { message: "MARK_CAUSE" } },
  },
};
for (const [label, secret] of Object.entries(cases)) {
  test(`${label} markers absent from results, text, logs, health, throws and diagnostic JSON`, async () => {
    const m = await app();
    const context = m.createRequestContext();
    const lines = [];
    const logger = m.createDiagnosticLogger((line) => lines.push(line));
    const error = Object.assign(
      new Error("MARK_EXCEPTION", { cause: secret }),
      secret,
    );
    const fields = {
      ...secret,
      request_id: "MARK_ID",
      operation: "MARK_OPERATION",
      tool: "MARK_TOOL",
      auth_state: "MARK_AUTH",
      error_code: "MARK_ERROR",
      elapsed_ms: "MARK_TIME",
      nested: { error },
    };
    for (const level of ["info", "error", "debug"])
      logger.log(level, context, fields);
    logger.failure(context, error, fields);
    const failure = new m.ApplicationFailure("DATA_RESOLUTION_FAILED", {
      ...secret,
      reason: "MARK_REASON",
      retry_after_seconds: "MARK_RETRY",
    });
    // Even mutation of an app exception cannot change its outward envelope.
    failure.message = "MARK_MUTATED";
    failure.cause = secret;
    const outputs = [
      m.toolError(error, context),
      m.toolError(failure, context),
      m.redactDiagnostics(fields),
      m.healthDiagnostics(fields),
      ...lines,
    ];
    try {
      throw m.mapFailure(error, { domain: "internal" });
    } catch (safe) {
      outputs.push(safe.message);
    }
    for (const output of outputs)
      assert.doesNotMatch(
        typeof output === "string" ? output : JSON.stringify(output),
        /MARK_/,
      );
    assert.equal(lines.length, 4);
    for (const line of lines)
      assert.equal(JSON.parse(line).request_id, context.request_id);
  });
}

test("allowlisted diagnostics retain useful fields without invoking nested serializers", async () => {
  const m = await app();
  const safe = {
    operation: "refresh",
    stage: "failed",
    elapsed_ms: 12,
    bytes: 42,
    items: 2,
    status: 503,
    retry_attempt: 1,
    auth_state: "authorization_required",
    previous_auth_state: "ready",
    error_code: "TOKEN_REFRESH_FAILED",
  };
  const input = {
    ...safe,
    arbitrary: {
      toJSON() {
        throw new Error("must not serialize");
      },
    },
  };
  Object.defineProperty(input, "tool", {
    get() {
      throw new Error("must not read");
    },
  });
  assert.deepEqual(m.redactDiagnostics(input), safe);
  assert.deepEqual(m.healthDiagnostics(input), {
    auth_state: "authorization_required",
  });
  const lines = [];
  m.createDiagnosticLogger((line) => lines.push(line)).log(
    "debug",
    m.createRequestContext(),
    input,
  );
  assert.equal(JSON.parse(lines[0]).elapsed_ms, 12);
  assert.ok(lines[0].endsWith("\n"));
});

test("typed OAuth/API/cache/storage failures redact every exercised channel", async () => {
  const m = await app();
  const oauth = await import("@iracing-data/oauth-client");
  const api = await import("@iracing-data/api-client-fetch");
  const nested = {
    access_token: "MARK_ACCESS",
    refresh_token: "MARK_REFRESH",
    cause: { state: "MARK_STATE", credential: { body: "MARK_BODY" } },
  };
  const failures = [
    [
      oauth.OAuthRefreshError.from({
        message: "MARK_OAUTH",
        code: "OAUTH_RESPONSE_BODY_ERROR",
        error_description: "MARK_DESCRIPTION",
        cause: { ...nested, error: "invalid_grant" },
      }),
      { domain: "oauth_session" },
    ],
    [
      new oauth.OAuthTokenDocumentError(
        "io_error",
        "/private/MARK_PATH",
        nested,
      ),
      { domain: "oauth_session", refreshOutcome: "persistence_failed" },
    ],
    [
      new api.ResponseError(
        new Response("MARK_UPSTREAM_BODY", {
          status: 403,
          headers: { "set-cookie": "MARK_COOKIE" },
        }),
        "MARK_API_MESSAGE",
      ),
      { domain: "upstream" },
    ],
    [
      new api.FetchError(
        new Error("MARK_FETCH", { cause: nested }),
        "MARK_FETCH_MESSAGE",
      ),
      { domain: "upstream" },
    ],
    [
      new SyntaxError(
        "MARK_CACHE_JSON https://cache/MARK_URL?signature=MARK_SIGNED",
      ),
      { domain: "upstream" },
    ],
  ];
  for (const [raw, mapping] of failures) {
    const context = m.createRequestContext();
    const safe = m.mapFailure(raw, mapping);
    const lines = [];
    const logger = m.createDiagnosticLogger((line) => lines.push(line));
    logger.failure(context, safe, { ...nested, error: raw });
    logger.log("debug", context, raw);
    const channels = [
      m.toolError(safe, context),
      m.errorEnvelope(safe, context),
      m.healthDiagnostics(raw),
      m.redactDiagnostics(raw),
      safe.message,
      JSON.stringify(safe),
      ...lines,
    ];
    for (const output of channels)
      assert.doesNotMatch(
        typeof output === "string" ? output : JSON.stringify(output),
        /MARK_/,
      );
    assert.equal(Object.isFrozen(safe), true);
  }
});

test("default logger writes only JSON to stderr", () => {
  const { spawnSync } = require("node:child_process");
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    import { createDiagnosticLogger, createRequestContext } from './dist/index.js';
    createDiagnosticLogger().log('debug', createRequestContext(), { operation: 'refresh', token: 'MARK_STDERR', stack: 'MARK_STACK' });
  `,
    ],
    { cwd: require("node:path").resolve(__dirname, ".."), encoding: "utf8" },
  );
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
  assert.doesNotMatch(result.stderr, /MARK_/);
  assert.equal(JSON.parse(result.stderr).operation, "refresh");
});
