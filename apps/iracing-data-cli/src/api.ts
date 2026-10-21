import {
  CarApi,
  Configuration,
  DocApi,
  SeriesApi,
} from "@iracing-data/api-client-fetch";

/** Shared SDK configuration and lazy generated Data API clients, without CLI policy. */
export class IRacingAPI {
  private documentation?: DocApi;
  private cars?: CarApi;
  private seriesClient?: SeriesApi;

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
   * Access the generated car client on first use.
   * @returns {CarApi} Cached generated car client.
   */
  get car(): CarApi {
    this.cars ??= new CarApi(this.configuration);

    return this.cars;
  }

  /**
   * Access the generated series client on first use.
   * @returns {SeriesApi} Cached generated series client.
   */
  get series(): SeriesApi {
    this.seriesClient ??= new SeriesApi(this.configuration);

    return this.seriesClient;
  }

  /**
   * Retain one configuration for all generated clients exposed by this facade.
   * @param {Configuration} configuration - Shared generated SDK configuration.
   */
  constructor(private readonly configuration: Configuration) {}
}
