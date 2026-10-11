import assert from "node:assert/strict";
import test from "node:test";
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";
import { createRemoteJwtVerifier } from "../dist/index.js";

const issuer = "https://issuer.example/";
const audience = "https://mcp.example/mcp";

async function fixture() {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  Object.assign(jwk, { alg: "RS256", kid: "test-key", use: "sig" });
  const keySet = createLocalJWKSet({ keys: [jwk] });
  const verify = createRemoteJwtVerifier(
    {
      issuer,
      audience,
      jwksUrl: "https://issuer.example/.well-known/jwks.json",
    },
    keySet,
  );

  async function sign(overrides = {}, key = privateKey) {
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      iss: issuer,
      aud: audience,
      sub: "principal-123",
      scope: "mcp:use",
      iat: now,
      exp: now + 300,
      ...overrides,
    };

    return new SignJWT(claims)
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .sign(key);
  }

  return { verify, sign };
}

test("verifies a locally signed JWT against issuer and audience", async () => {
  const { verify, sign } = await fixture();
  const token = await sign();
  const { payload } = await verify(token);

  assert.equal(payload.iss, issuer);
  assert.equal(payload.sub, "principal-123");
  assert.equal(payload.scope, "mcp:use");
});

test("rejects malformed, expired, wrong-issuer, and wrong-audience tokens", async () => {
  const { verify, sign } = await fixture();
  const now = Math.floor(Date.now() / 1000);
  const expired = await sign({ exp: now - 1 });
  const wrongIssuer = await sign({ iss: "https://other.example/" });
  const wrongAudience = await sign({ aud: "https://other.example/mcp" });

  await assert.rejects(() => verify("not-a-jwt"));
  await assert.rejects(() => verify(expired));
  await assert.rejects(() => verify(wrongIssuer));
  await assert.rejects(() => verify(wrongAudience));
});

test("rejects a token signed by an untrusted key", async () => {
  const { verify, sign } = await fixture();
  const { privateKey } = await generateKeyPair("RS256");
  const token = await sign({}, privateKey);

  await assert.rejects(() => verify(token));
});
