import assert from "node:assert/strict";
import test from "node:test";
import {
  SignJWT,
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
} from "jose";
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

  await assert.rejects(() => verify("not-a-jwt"));
  await assert.rejects(() => verify(sign({ exp: now - 1 })));
  await assert.rejects(() => verify(sign({ iss: "https://other.example/" })));
  await assert.rejects(() => verify(sign({ aud: "https://other.example/mcp" })));
});

test("rejects a token signed by an untrusted key", async () => {
  const { verify, sign } = await fixture();
  const { privateKey } = await generateKeyPair("RS256");

  await assert.rejects(() => verify(sign({}, privateKey)));
});
