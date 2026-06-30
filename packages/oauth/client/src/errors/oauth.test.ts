import {
  AuthorizationResponseError,
  type OAuth2Error,
  ResponseBodyError,
} from "oauth4webapi";
import { describe, expect, it } from "vitest";
import {
  OAuthCallbackError,
  OAuthRefreshError,
  OAuthClaimsError,
} from "./oauth";

describe("OAuth Errors", () => {
  describe("OAuthCallbackError", () => {
    it("returns existing OAuth callback errors from from", () => {
      const params = new URLSearchParams({ state: "session-state" });
      const existing = OAuthCallbackError.stateMissing(params);

      const result = OAuthCallbackError.from(
        existing,
        new URLSearchParams(),
        "ignored-state",
      );

      expect(result).toBe(existing);
      expect(result).toBeInstanceOf(OAuthCallbackError);
      expect(result).toBeInstanceOf(Error);
    });

    it("configures callback errors from Error instances", () => {
      const params = new URLSearchParams({ state: "session-state" });
      const cause = new Error("Callback exchange failed");

      const result = OAuthCallbackError.from(cause, params, "app-state");

      expect(result).toBeInstanceOf(OAuthCallbackError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Callback exchange failed");
      expect(result.params).toBe(params);
      expect(result.state).toBe("app-state");
      expect(result.cause).toBe(cause);
    });

    it("configures callback errors from unknown values", () => {
      const params = new URLSearchParams({
        error_description: "Provider supplied description",
      });
      const cause = { reason: "unexpected" };

      const result = OAuthCallbackError.from(cause, params);

      expect(result).toBeInstanceOf(OAuthCallbackError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Provider supplied description");
      expect(result.params).toBe(params);
      expect(result.state).toBeUndefined();
      expect(result.cause).toBe(cause);
    });

    it("configures authorizationError", () => {
      const params = new URLSearchParams({ state: "session-state" });
      const providerParams = new URLSearchParams({
        error: "access_denied",
        error_description: "Access denied",
      });
      const providerError = new AuthorizationResponseError(
        "Authorization response error",
        {
          cause: providerParams,
        },
      );

      const result = OAuthCallbackError.authorizationError(
        providerError,
        params,
        "app-state",
      );

      expect(result).toBeInstanceOf(OAuthCallbackError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("OAuth Provider returned an error");
      expect(result.params).toBe(params);
      expect(result.state).toBe("app-state");
      expect(result.cause).toBe(providerParams);
    });

    it("configures stateMissing", () => {
      const params = new URLSearchParams();

      const result = OAuthCallbackError.stateMissing(params);

      expect(result).toBeInstanceOf(OAuthCallbackError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Missing "state" parameter.');
      expect(result.params).toBe(params);
      expect(result.state).toBeUndefined();
      expect(result.cause).toBeUndefined();
    });

    it("configures unknownAuthorizationState", () => {
      const params = new URLSearchParams({ state: "unknown-state" });

      const result = OAuthCallbackError.unknownAuthorizationState(
        "unknown-state",
        params,
      );

      expect(result).toBeInstanceOf(OAuthCallbackError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe(
        'Unknown authorization session "unknown-state"',
      );
      expect(result.params).toBe(params);
      expect(result.state).toBeUndefined();
      expect(result.cause).toBeUndefined();
    });

    it("configures codeMissing", () => {
      const params = new URLSearchParams({ state: "session-state" });

      const result = OAuthCallbackError.codeMissing(params, "app-state");

      expect(result).toBeInstanceOf(OAuthCallbackError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Missing "code" query parameter.');
      expect(result.params).toBe(params);
      expect(result.state).toBe("app-state");
      expect(result.cause).toBeUndefined();
    });
  });

  describe("OAuthRefreshError", () => {
    it("configures refresh errors from OAuth response body errors", () => {
      const responseBody: OAuth2Error = {
        error: "invalid_grant",
        error_description: "Refresh token was revoked",
      };
      const response = new Response(JSON.stringify(responseBody), {
        status: 400,
      });
      const cause = new ResponseBodyError("Token Endpoint error", {
        cause: responseBody,
        response,
      });

      const result = OAuthRefreshError.from(cause);

      expect(result).toBeInstanceOf(OAuthRefreshError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Token Endpoint error");
      expect(result.description).toBe("Refresh token was revoked");
      expect(result.code).toBe(cause.code);
      expect(result.cause).toBe(responseBody);
    });

    it("configures sessionNotFound", () => {
      const result = OAuthRefreshError.sessionNotFound("session-id");

      expect(result).toBeInstanceOf(OAuthRefreshError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("No session found for key ID.");
      expect(result.description).toBeUndefined();
      expect(result.code).toBeUndefined();
      expect(result.cause).toEqual({ sessionId: "session-id" });
    });

    it("configures missingRefreshToken", () => {
      const result = OAuthRefreshError.missingRefreshToken("session-id");

      expect(result).toBeInstanceOf(OAuthRefreshError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Session cannot be refreshed.");
      expect(result.description).toBe("Missing refresh token");
      expect(result.code).toBe("MISSING_REFRESH_TOKEN");
      expect(result.cause).toEqual({ sessionId: "session-id" });
    });

    it("configures tokenExpired", () => {
      const result = OAuthRefreshError.tokenExpired("session-id");

      expect(result).toBeInstanceOf(OAuthRefreshError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Refresh token cannot be refreshed");
      expect(result.description).toBe("Token expired");
      expect(result.code).toBe("REFRESH_TOKEN_EXPIRED");
      expect(result.cause).toEqual({ sessionId: "session-id" });
    });
  });

  describe("OAuthClaimsError", () => {
    it.each([
      {
        name: "tokenExpired",
        create: () => OAuthClaimsError.tokenExpired(),
        message: "Access token has expired.",
      },
      {
        name: "tokenIssuedInFuture",
        create: () => OAuthClaimsError.tokenIssuedInFuture(),
        message: "Access token was issued in the future.",
      },
      {
        name: "tokenAuthenticationInFuture",
        create: () => OAuthClaimsError.tokenAuthenticationInFuture(),
        message: "Access token authentication time is in the future.",
      },
      {
        name: "issueTimeBeforeAuthenticationTime",
        create: () => OAuthClaimsError.issueTimeBeforeAuthenticationTime(),
        message: "Access token issue time is earlier than authentication time.",
      },
      {
        name: "issuerMismatch",
        create: () =>
          OAuthClaimsError.issuerMismatch(
            "https://wrong.example.com",
            "https://expected.example.com",
          ),
        message:
          'Access token issuer mismatch. Expected "https://expected.example.com" but received "https://wrong.example.com".',
      },
      {
        name: "clientIdMismatch",
        create: () =>
          OAuthClaimsError.clientIdMismatch("wrong-client", "expected-client"),
        message:
          'Access token client_id mismatch. Expected "expected-client" but received "wrong-client".',
      },
      {
        name: "audienceClientIdMissing",
        create: () => OAuthClaimsError.audienceClientIdMissing("client-id"),
        message:
          'Access token audience does not include the expected client id "client-id".',
      },
      {
        name: "oauthApiMissing",
        create: () => OAuthClaimsError.oauthApiMissing(),
        message: 'Access token audience does not include "oauth-api".',
      },
      {
        name: "environmentMismatch",
        create: () =>
          OAuthClaimsError.environmentMismatch("staging", "production"),
        message:
          'Access token environment mismatch. Expected "production" but received "staging".',
      },
      {
        name: "scopeMissing",
        create: () => OAuthClaimsError.scopeMissing("profile"),
        message: 'Access token is missing required scope "profile".',
      },
    ])("configures $name", ({ create, message }) => {
      const result = create();

      expect(result).toBeInstanceOf(OAuthClaimsError);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe(message);
      expect(result.cause).toBeUndefined();
    });
  });
});
