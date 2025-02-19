import { AxiosInstance } from "axios";
import { AuthAPI } from "./auth";
import { DataAPI } from "./data";
import { NetworkClientProvider } from "./types";

export * from "./types";

export class IRacingAPI extends NetworkClientProvider {
  private _auth: AuthAPI;
  get auth() {
    return this._auth;
  }

  private _data: DataAPI;
  get data() {
    return this._data;
  }

  /**
   * Initializes an IRacingAPI instance, using the provided client.
   * @param client The Axios client to use for requests
   */
  constructor(client: AxiosInstance) {
    super(client);
    this._auth = new AuthAPI(client);
    this._data = new DataAPI(client);
  }
}

export default IRacingAPI;
