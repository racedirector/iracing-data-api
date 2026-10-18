import { Configuration, DocApi } from "@iracing-data/api-client-fetch";

/** Shared SDK configuration and lazy generated Data API clients, without CLI policy. */
export class IRacingAPI {
  private documentation?: DocApi;

  /**
   * Keep the generated SDK defaults, including its canonical Data API base URL.
   * @param {string} accessToken - Resolved bearer credential without a Bearer prefix.
   * @returns {IRacingAPI} Facade whose clients share the token configuration.
   */
  static withAccessToken(accessToken: string): IRacingAPI {
    return new IRacingAPI(new Configuration({ accessToken }));
  }

  /**
   * Access the generated documentation client, constructing it once on first access.
   * @returns {DocApi} Cached documentation client using the shared SDK configuration.
   */
  get doc(): DocApi {
    this.documentation ??= new DocApi(this.configuration);

    return this.documentation;
  }

  /**
   * Retain one configuration for all generated clients exposed by this facade.
   * @param {Configuration} configuration - Shared generated SDK configuration.
   */
  constructor(private readonly configuration: Configuration) {}
}
