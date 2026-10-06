import {
  OAuthApiClientGenerated,
  type OAuthApiClientGeneratedOptions,
} from "./generated/oauth-api";

/**
 * Low-level client for the iRacing OAuth API surface.
 *
 * Generated code owns ordinary HTTP wire mechanics. This authored facade is
 * the stable package boundary consumed by applications and by the higher-level
 * {@link OAuthClient} orchestration layer.
 */
export class OAuthApiClient extends OAuthApiClientGenerated {
  constructor(options: OAuthApiClientGeneratedOptions = {}) {
    super(options);
  }
}

export type OAuthApiClientOptions = OAuthApiClientGeneratedOptions;

export type OAuthProfileApi = Pick<OAuthApiClient, "getProfile">;

export * from "./generated/oauth-api";
