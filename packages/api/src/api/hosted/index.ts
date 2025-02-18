import { AxiosInstance } from "axios";

export class HostedAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  /**
   * Sessions that can be joined as a driver or spectator, and also includes
   * non-league pending sessions for the user.
   */
  combinedSessions({ packageId }: { packageId: number }) {
    return this._client.get(`/data/hosted/combined_sessions`, {
      params: { package_id: packageId },
    });
  }

  /**
   * Sessions that can be joined as a driver. Without spectator and non-league
   * pending sessions for the user.
   */
  sessions() {
    return this._client.get("/data/hosted/sessions");
  }
}

export default HostedAPI;
