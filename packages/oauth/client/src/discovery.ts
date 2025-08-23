import * as oauth from "oauth4webapi";

export async function discover(issuer: string) {
  const issuerUrl = new URL(issuer);

  const discoveryResponse = await oauth.discoveryRequest(issuerUrl, {
    algorithm: "oauth2",
  });

  try {
    const authorizationServer = await oauth.processDiscoveryResponse(
      issuerUrl,
      discoveryResponse
    );

    if (!authorizationServer.authorization_endpoint) {
      throw new TypeError(
        "Authorization server did not provide an authorization endpoint."
      );
    }

    if (!authorizationServer.token_endpoint) {
      throw new TypeError(
        "Authorization server did not provide a token endpoint."
      );
    }

    return authorizationServer;
  } catch (error) {
    if (!(error instanceof TypeError) || error.message !== "Invalid URL") {
      throw error;
    }

    throw new TypeError(
      `Discovery request responded with invalid issuer. Expected: ${issuerUrl}`
    );
  }
}
